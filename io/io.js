const intersection = require('lodash.intersection');
const { getLobbyById, omit } = require('../utils/utils');
const { announce } = require('../utils/chat-utils');
const { DEVMODE } = require('../utils/constants');

module.exports = io => {

  io.on('connection', socket => {
    // console.log(`Socket: ${socket.id} connected`);

    function getUserBySID(SID) {
      return lobby.users.find(u => u.socketId === SID);
    };

    const c = 'c';
    let lobby;
    // let game;

    socket.on('connectToLobby', ({ userId, lobbyId }) => {
      console.log(`Connecting: ${userId} to: ${lobbyId} on: ${socket.id}`);

      lobby = getLobbyById(lobbyId);
      const user = lobby?.users.find(u => u.id === userId);

      if (!user) return console.log(`${userId} not in ${lobbyId}'s user list`)

      socket.join(lobbyId);
      user.isOnline = true;
      user.isReady = DEVMODE; // users start ready in dev mode
      user.socketId = socket.id;

      if (!lobby.leader) {
        lobby.leader = userId;
        user.isLeader = true;
      };

      // const resData = {
      //   users: lobby.users,
      //   user: user
      // };
      // io.in(lobbyId).emit(
      //   'userConnected',
      //   {
      //     resData,
      //     msg: announce.join(user.id)
      //   }
      // );

      emitByRole(c, announce.join(user.id));
    });

    // disconnect

    socket.on('disconnect', () => {
      // console.log(`Socket: ${socket.id} disconnected`);

      let user;

      try {
        user = getUserBySID(socket.id);
      } catch (err) {
        return console.log(`Cannot find user on Socket: ${socket.id}`);
      };

      user.isOnline = false;
      user.isReady = false;

      const needNewLeader = user.isLeader && (lobby.numOnline() >= 1);

      let newLeaderId;

      if (!needNewLeader) {
        newLeaderId = null;
      } else {
        const newLeader = lobby.users.find(u => u.isOnline === true);
        user.isLeader = false;
        newLeader.isLeader = true;
        lobby.leader = newLeader.id;
        newLeaderId = newLeader.id;
        // console.log(`${newLeaderId} is the new leader of ${lobby.id}`);
      };

      // const resData = {
      //   users: lobby.users,
      //   discoUserId: user.id,
      //   newLeaderId
      // };

      // io.to(lobby.id).emit(
      //   'userDisco',
      //   {
      //     resData,
      //     msg: announce.leave(user.id, newLeaderId)
      //   }
      // );
      emitByRole(c, announce.leave(user.id, newLeaderId));
    });

    // giveLeader

    socket.on('giveLeadership', newLeaderId => {
      const newLeader = lobby.users.find(u => u.id === newLeaderId);
      const oldLeader = lobby.users.find(u => u.id === lobby.leader);
      lobby.leader = newLeaderId;
      newLeader.isLeader = true;
      oldLeader.isLeader = false;

      emitByRole(c, announce.newLeader(newLeaderId));
    });

    // readyUnready

    socket.on('readyUnready', userId => {
      const user = lobby.users.find(u => u.id === userId);
      user.isReady ? user.isReady = false : user.isReady = true;

      // const resData = {
      //   users: lobby.users,
      //   userId: userId,
      //   ready: user.isReady,
      //   canStart: lobby.canStart()
      // };
      // // console.log(`${userId} is ${user.isReady ? 'ready' : 'not ready'}`);
      // io.in(lobby.id).emit(
      //   'readyUnready',
      //   {
      //     resData,
      //     msg: announce.ready(userId, user.isReady)
      //   }
      // );
      emitByRole(c, announce.ready(userId, user.isReady));
    });

    // ghostAssigned

    function unAssignGhost() {
      const formerGhost = lobby.users.find(u => u.isAssignedToGhost === true);
      if (formerGhost) formerGhost.isAssignedToGhost = false;
    };

    function assignNewGhost(userId) {
      unAssignGhost();
      const newGhost = lobby.users.find(u => u.id === userId);
      newGhost.isAssignedToGhost = true;
      lobby.gameSettings.assignedToGhost = userId;
    };

    function assignNoGhost() {
      unAssignGhost();
      lobby.gameSettings.assignedToGhost = null;
    };

    socket.on('ghostAssigned', userId => {
      const unAssign = !userId || (userId === lobby.gameSettings.assignedToGhost);
      unAssign ? assignNoGhost() : assignNewGhost(userId);

      // const resData = {
      //   users: lobby.users,
      //   assignedToGhost: lobby.gameSettings.assignedToGhost
      // };

      // io.in(lobby.id).emit(
      //   'ghostAssigned',
      //   {
      //     resData,
      //     msg: announce.ghostAssigned(userId, unAssign)
      //   }
      // );
      emitByRole(c,
        announce.ghostAssigned(userId, unAssign),
        {type: 'ghostAssigned', args: [userId, unAssign]});
    });

    // toggle

    function emitGameSettingsChange() {
      // io.in(lobby.id).emit(
      //   'gameSettingsUpdate',
      //   {
      //     gameSettings: lobby.gameSettings
      //   }
      // );
      emitByRole(c);
    };

    function toggleItem(toggledItem) {
      switch (toggledItem) {
        case `witness`:
          lobby.gameSettings.hasWitness = !lobby.gameSettings.hasWitness;
          emitGameSettingsChange();
          break;
        case `accomplice`:
          lobby.gameSettings.hasAccomplice = !lobby.gameSettings.hasAccomplice;
          emitGameSettingsChange();
          break;
        default: return console.log(`toggleItem Error: 'toggledItem' = ${toggledItem}`);
      };
    };

    socket.on('toggle', toggledItem => toggleItem(toggledItem));

    function chooseTimer(duration) {
      const timer = lobby.gameSettings.timer;
      timer.duration = duration;
      duration === 'off'
        ? timer.on = false
        : timer.on = true;
      emitGameSettingsChange();
    };

    socket.on('chooseTimer', duration => chooseTimer(duration));

    // newMessage

    socket.on('newMessage', data => {
      const msg = announce.userMessage(data.sender, data.text)
      lobby.chat.push(msg);
      io.in(lobby.id).emit(
        'newMessage',
        msg
      );
    });

    // startGame

    socket.on('startGame', data => {
      lobby.makeGame(data.settings);
      game = lobby.game;
      emitByRole('startGame', announce.advanceTo(game.currentStage));
    });

    // clearGame

    socket.on('clearGame', () => {
      // console.log('Game cleared by leader');

      lobby.game.players.map(player => {
        player.isReady = false;
        return player;
      });

      // const resData = {
      //   users: lobby.users
      // };

      lobby.game = null;
      lobby.gameOn = false;
      // io.in(lobby.id).emit(
      //   'clearGame',
      //   {
      //     resData,
      //     msg: announce.clearGame()
      //   }
      // );
      emitByRole(c, announce.clearGame());
    });

    // advanceStage

    socket.on('advanceStage', data => {
      lobby.game.advanceStage();
      const newStage = lobby.game.currentStage;
      if (!!newStage.onStart) newStage.onStart(lobby.game, data);
      emitByRole('advanceStage', announce.advanceTo(newStage));
    });

    // keyEvidenceChosen (by killer)

    socket.on('keyEvidenceChosen', (keyEv) => {

      lobby.game.keyEvidence = keyEv;
      lobby.game.advanceStage();
      emitByRole('advanceStage', announce.advanceTo(lobby.game.currentStage));
    });

    // clueChosen (by Ghost)

    function lockClueCard(clue) {
      const card = lobby.game.cluesDeck.find(c => c.opts.some(o => o.id === clue));
      card.isLocked = true;
    };

    socket.on('clueChosen', data => {
      const clue = data[0];
      // console.log(`Clue chosen: ${clue}`);
      lobby.game.confirmedClues.push(clue);
      lockClueCard(clue);
      emitByRole('clueChosen', announce.clueChosen(clue));
    });

    // accusation

    function isAccusalRight(accusalEv) {
      return intersection(accusalEv, lobby.game.keyEvidence).length === 2;
    };

    function resolveRightAccusal(accuser) {
      lobby.game.witness
        ? advToSecondMurder(accuser.id)
        : resolveGame('bluewin', accuser.id);
    };

    function advToSecondMurder(accuserId) {
      lobby.game.advanceStage('second-murder');
      emitByRole('advanceStage', announce.advanceTo(lobby.game.currentStage, accuserId));
    };

    function resolveSecondMurder(targetId) {
      lobby.game.witness.id === targetId
        ? resolveGame('redwinwitnessdead')
        : resolveGame('bluewinwitnessalive');
    };

    function resolveWrongAccusal(accuser) {
      accuser.accusalSpent = true;
      accuser.canAccuse = false;
      lobby.game.blueCanAccuse()
        ? continueRound(accuser.id)
        : resolveGame('redwin');
    };

    function continueRound(accuserId) {
      emitByRole('wrongAccusation', announce.accusationWrong(accuserId));
    };

    function resolveGame(type, accuserId) {
      // lobby.game.result = {
      //   type: type,
      //   winnerIds: [],
      //   loserIds: [],
      //   keyEv: [],
      //   accuserId: accuserId
      // };
      lobby.game.advanceStage('game-over');
      emitByRole('resolveGame', announce.resolveGame(type, accuserId));
    };

    socket.on('accusation', ({accuserSID, accusedId, accusalEv}) => {
      const accuser = getUserBySID(accuserSID);
      isAccusalRight(accusalEv)
        ? resolveRightAccusal(accuser)
        : resolveWrongAccusal(accuser);
    });

    socket.on('secondMurder', targetId => resolveSecondMurder(targetId));

    function emitByRole(event, msg, msgData) {

      const emitRedacted = () => {
        const redactedLobby = omit(lobby, ['game']);

        lobby.game.rolesRef.forEach(ref => {
          redactedLobby.game = lobby.game.viewAs(ref.role);
          io.to(ref.user.socketId).emit(
            event,
            { lobby: redactedLobby, msg, msgData }
          );
        });
      };

      const emitLobby = () => {
        io.in(lobby.id).emit(
          event,
          { lobby, msg, msgData }
        );
      };

      return lobby.game ? emitRedacted() : emitLobby();
    };

  });

};