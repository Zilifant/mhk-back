const intersection = require('lodash.intersection');
const { getLobbyById, getRoleById } = require('../utils/utils');
const { announce } = require('../utils/chat-utils');
const { GAME_OUTCOMES } = require('../utils/constants');

module.exports = (io) => {

  io.on('connection', (socket) => {
    // console.log(`Socket: ${socket.id} connected`);

    function getUserBySID(SID) {
      return lobby.users.find(u => u.socketId === SID);
    };

    let lobby;

    socket.on('connectToLobby', ({ userId, lobbyId }) => {
      // console.log(`Connecting: ${userId} to: ${lobbyId} on: ${socket.id}`);

      lobby = getLobbyById(lobbyId);
      const user = lobby.users.find(u => u.id === userId);

      if (!user) return console.log(`${userId} not in ${lobbyId}'s user list`)

      socket.join(lobbyId);
      user.isOnline = true;
      user.isReady = true; // TEMP
      user.socketId = socket.id;

      if (!lobby.leader) {
        lobby.leader = userId;
        user.isLeader = true;
      };

      const resData = {
        usersOnline: lobby.users.filter(u => u.isOnline === true),
        user: user
      };
      io.in(lobbyId).emit(
        'userConnected',
        {
          resData,
          msg: announce.join(user.id)
        }
      );
    });

    // disconnect

    socket.on('disconnect', () => {
      console.log(`Socket: ${socket.id} disconnected`);

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

      const resData = {
        usersOnline: lobby.users.filter(u => u.isOnline === true),
        discoUserId: user.id,
        newLeaderId
      };

      io.to(lobby.id).emit(
        'userDisco',
        {
          resData,
          msg: announce.leave(user.id, newLeaderId)
        }
      );
      // console.log(`Removed: ${user.id} on: ${socket.id} from: ${lobby.id}`);
    });

    // readyUnready

    socket.on('readyUnready', ({ userId }) => {
      const user = lobby.users.find(u => u.id === userId);
      user.isReady ? user.isReady = false : user.isReady = true;

      const resData = {
        usersOnline: lobby.users.filter(u => u.isOnline === true),
        userId: userId,
        ready: user.isReady,
        canStart: lobby.canStart()
      };
      // console.log(`${userId} is ${user.isReady ? 'ready' : 'not ready'}`);
      io.in(lobby.id).emit(
        'readyUnready',
        {
          resData,
          msg: announce.ready(userId, user.isReady)
        }
      );
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

    socket.on('ghostAssigned', (data) => {
      const userId = data[0];
      userId ? assignNewGhost(userId) : assignNoGhost();

      const resData = {
        usersOnline: lobby.users.filter(u => u.isOnline === true),
        assignedToGhost: lobby.gameSettings.assignedToGhost
      };

      io.in(lobby.id).emit(
        'ghostAssigned',
        {
          resData,
          msg: announce.ghostAssigned(userId)
        }
      );
    });

    // toggle

    function emitGameSettingsChange() {
      io.in(lobby.id).emit(
        'gameSettingsUpdate',
        {
          gameSettings: lobby.gameSettings
        }
      );
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

    // newMessage

    socket.on('newMessage', (data) => {
      const msg = announce.userMessage(data.sender, data.text)
      lobby.chat.push(msg);
      io.in(lobby.id).emit(
        'newMessage',
        msg
      );
    });

    // startGame

    socket.on('startGame', (data) => {
      lobby.makeGame(data.settings);
      emitByRole('startGame', announce.gameStart());
    });

    // clearGame

    socket.on('clearGame', () => {
      // console.log('Game cleared by leader');

      lobby.game = null;
      lobby.gameOn = false;
      io.in(lobby.id).emit(
        'clearGame',
        { msg: announce.clearGame() }
      );
    });

    // advanceStage

    socket.on('advanceStage', () => {
      lobby.game.advanceStage();
      emitByRole('advanceStage', announce.advanceTo(lobby.game.currentStage));
    });

    // keyEvidenceChosen (by killer)

    socket.on('keyEvidenceChosen', (keyEv) => {
      // console.log(`Key evidence chosen: ${keyEv[0]}, ${keyEv[1]}`);

      lobby.game.keyEvidence = keyEv;
      lobby.game.advanceStage();
      emitByRole('advanceStage', announce.advanceTo(lobby.game.currentStage));
    });

    // clueChosen (by Ghost)

    function lockClueCard(clue) {
      const card = lobby.game.cluesDeck.find(c => c.opts.some(o => o.id === clue));
      card.isLocked = true;
    };

    socket.on('clueChosen', (data) => {
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
        : resolveGame('blue-win', accuser.id);
    };

    function advToSecondMurder(accuserId) {
      lobby.game.advanceStage('Second Murder');
      emitByRole('advanceStage', announce.advanceTo(lobby.game.currentStage, accuserId));
    };

    function resolveSecondMurder(targetId) {
      lobby.game.witness.id === targetId
        ? resolveGame('red-win-witness_dead')
        : resolveGame('blue-win-witness_alive');
    };

    function resolveWrongAccusal(accuser) {
      accuser.accusalSpent = true;
      accuser.canAccuse = false;
      lobby.game.blueCanAccuse()
        ? continueRound(accuser.id)
        : resolveGame('red-win');
    };

    function continueRound(accuserId) {
      emitByRole('wrongAccusation', announce.accusationWrong(accuserId));
    };

    function resolveGame(type, accuserId) {
      lobby.game.advanceStage('Finale');
      lobby.game.result = {
        type: type,
        winnerIds: [],
        loserIds: [],
        keyEv: [],
        accuserId: accuserId
      };
      emitByRole('resolveGame', announce.resolveGame(lobby.game.result));
    };

    socket.on('accusation', ({accuserSID, accusedId, accusalEv}) => {
      const accuser = getUserBySID(accuserSID);
      isAccusalRight(accusalEv)
        ? resolveRightAccusal(accuser, accusedId, accusalEv)
        : resolveWrongAccusal(accuser, accusedId, accusalEv);
    });

    socket.on('secondMurder', (targetId) => resolveSecondMurder(targetId));

    function emitByRole(event, msg) {
      lobby.game.rolesRef.forEach(ref => {
        io.to(ref.user.socketId).emit(
          event,
          { game: lobby.game.viewAs(ref.role), msg }
        );
      });
    };

  });

};