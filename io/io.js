const intersection = require('lodash.intersection');
const { getLobbyById, omit, msg, have } = require('../utils/utils');
const { DEVMODE } = require('../utils/constants');

const emitSimply = [
  'userConnected', 'userDisconnected', 'giveLeadership', 'ghostAssigned', 'gameSettingsChange', 'startGame', 'readyUnready', 'clearGame', 'advanceStage', 'clueChosen', 'wrongAccusation', 'resolveGame'
];

const saveToChat = [
  'startGame', 'clearGame', 'advanceStage', 'wrongAccusation', 'resolveGame'
];

module.exports = io => {

  io.on('connection', socket => {

    function getUserBySID(SID) {
      return lobby.users.find(u => u.socketId === SID);
    };

    let lobby;
    let game;

    socket.on('connectToLobby', ({ userId, lobbyId }) => {

      lobby = getLobbyById(lobbyId);
      const user = lobby?.users.find(u => u.id === userId);

      if (!user) return console.log(`${userId} not in ${lobbyId}'s user list`)

      socket.join(lobbyId);
      user.isOnline = true;
      user.isReady = DEVMODE; // users start ready in dev mode
      user.socketId = socket.id;
      user.connectionTime = Date.now();

      if (!lobby.leader) {
        lobby.leader = userId;
        user.isLeader = true;
      };

      const data = {
        event: 'userConnected',
        user: user
      }

      emitByRole('userConnected', msg('join', [user.id]), data);
    });

    // disconnect

    socket.on('disconnect', () => {

      let user, newLeaderId;

      try {
        user = getUserBySID(socket.id);
      } catch (err) {
        return console.log(`Cannot find user on Socket: ${socket.id}`);
      };

      user.isOnline = false;
      user.isReady = false;

      function makeNewLeader() {
        const needNewLeader = user.isLeader && (lobby.numOnline() >= 1);
        if (!needNewLeader) {
          newLeaderId = null;
        } else {
          const newLeader = lobby.users.find(u => u.isOnline === true);
          user.isLeader = false;
          newLeader.isLeader = true;
          lobby.leader = newLeader.id;
          newLeaderId = newLeader.id;
        };
      };

      function unAssignToGhost() {
        if (user.isAssignedToGhost) {
          user.isAssignedToGhost === false;
          lobby.gameSettings.assignedToGhost = null;
        };
      };

      makeNewLeader();
      unAssignToGhost();
      emitByRole('userDisconnected', msg('leave', [user.id, newLeaderId]));
    });

    // giveLeader

    socket.on('giveLeadership', newLeaderId => {
      const newLeader = lobby.users.find(u => u.id === newLeaderId);
      const oldLeader = lobby.users.find(u => u.id === lobby.leader);
      lobby.leader = newLeaderId;
      newLeader.isLeader = true;
      oldLeader.isLeader = false;

      emitByRole('giveLeadership', msg('newLeader', [newLeaderId]));
    });

    // readyUnready

    socket.on('readyUnready', userId => {
      if (!have(lobby)) return;

      const user = lobby.users.find(u => u.id === userId);
      user.isReady ? user.isReady = false : user.isReady = true;

      emitByRole('readyUnready', msg('ready', [userId, user.isReady]));
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
      if (!have(lobby)) return;

      const unAssign = !userId || (userId === lobby.gameSettings.assignedToGhost);
      unAssign ? assignNoGhost() : assignNewGhost(userId);

      emitByRole('ghostAssigned', msg('ghostAssigned', [userId, unAssign]));
    });

    // toggle

    function emitGameSettingsChange() {
      emitByRole('gameSettingsChange');
    };

    function toggleItem(toggledItem) {
      if (!have(lobby)) return;

      switch (toggledItem) {
        case `witness`:
          lobby.gameSettings.hasWitness = !lobby.gameSettings.hasWitness;
          emitGameSettingsChange();
          break;
        case `accomplice`:
          lobby.gameSettings.hasAccomplice = !lobby.gameSettings.hasAccomplice;
          emitGameSettingsChange();
          break;
        default: return console.log(`toggleItem Error: toggledItem = ${toggledItem}`);
      };
    };

    socket.on('toggle', toggledItem => toggleItem(toggledItem));

    function chooseTimer(duration) {
      if (!have(lobby)) return;

      const timer = lobby.gameSettings.timer;
      timer.duration = duration;
      duration === 0
        ? timer.on = false
        : timer.on = true;
      emitGameSettingsChange();
    };

    socket.on('chooseTimer', duration => chooseTimer(duration));

    // startGame

    socket.on('startGame', data => {
      if (!have(lobby)) return;

      lobby.makeGame(data.settings);
      game = lobby.game;

      emitByRole('startGame', msg('advanceTo', [lobby.game.currentStage]));
    });

    // clearGame

    socket.on('clearGame', () => {
      if (!have(lobby)) return;

      if (!DEVMODE) {
        lobby.game.players.map(player => {
          player.isReady = false;
          return player;
        });
      };

      lobby.game = null;
      lobby.gameOn = false;

      emitByRole('clearGame', msg('clearGame', []));
    });

    // advanceStage

    socket.on('advanceStage', data => {
      if (!have(lobby)) return;

      lobby.game.advanceStage(null, io);
      const newStage = lobby.game.currentStage;
      if (!!newStage.onStart) newStage.onStart(lobby.game, data);
      console.log(newStage.id);
      emitByRole('advanceStage', msg('advanceTo', [lobby.game.currentStage]));
    });

    // keyEvidenceChosen (by killer)

    socket.on('keyEvidenceChosen', (keyEv) => {
      if (!have(lobby)) return;

      lobby.game.keyEvidence = keyEv;
      lobby.game.advanceStage(null, io);
      emitByRole('advanceStage', msg('advanceTo', [lobby.game.currentStage]));
    });

    // clueChosen (by Ghost)

    function lockClueCard(clue) {
      const card = lobby.game.cluesDeck.find(c => c.opts.some(o => o.id === clue));
      card.isLocked = true;
    };

    socket.on('clueChosen', data => {
      if (!have(lobby)) return;

      const clue = data[0];
      lobby.game.confirmedClues.push(clue);
      lockClueCard(clue);
      emitByRole('clueChosen', msg('clueChosen', [clue]));
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
      lobby.game.advanceStage('second-murder', io);
      emitByRole('advanceStage', msg('advanceTo', [lobby.game.currentStage, accuserId]));
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
      emitByRole('wrongAccusation', msg('accusationWrong', [accuserId]));
    };

    function resolveGame(type, accuserId) {
      lobby.game.advanceStage('game-over', io);
      emitByRole('resolveGame', msg('resolveGame', [type, accuserId]));
    };

    socket.on('accusation', ({accuserSID, accusedId, accusalEv}) => {
      if (!have(lobby)) return;

      const accuser = getUserBySID(accuserSID);

      const message = msg('accusation', [{
        accuser: accuser.id,
        accusee: accusedId,
        evidence: accusalEv
      }]);
      io.in(lobby.id).emit('announcement', {msg: message});

      // suspensful delay
      setTimeout(() => {
        isAccusalRight(accusalEv)
        ? resolveRightAccusal(accuser)
        : resolveWrongAccusal(accuser);
      }, 3000);
    });

    socket.on('secondMurder', targetId => resolveSecondMurder(targetId));

    // newMessage

    socket.on('newMessage', data => {
      if (!have(lobby)) return;

      const message = msg('userMessage', [data.senderId, data.text], data.senderId);
      lobby.chat.push(message);
      io.in(lobby.id).emit('newMessage', message);
    });

    function saveAnnouncement(msg) {
      lobby.chat.push(msg);
    }

    function emitByRole(e, msg, data) {

      if (saveToChat.includes(e)) saveAnnouncement(msg);

      // currently redundant
      const event = emitSimply.includes(e) ? 'updateLobby' : e;

      const emitRedacted = () => {
        const redactedLobby = omit(lobby, ['game']);

        lobby.game.rolesRef.forEach(ref => {
          redactedLobby.game = lobby.game.viewAs(ref.role);
          io.to(ref.user.socketId).emit(
            event,
            { lobby: redactedLobby, msg, data }
          );
        });
      };

      const emitLobby = () => {
        io.in(lobby.id).emit(
          event,
          { lobby, msg, data }
        );
      };

      return lobby.game ? emitRedacted() : emitLobby();
    };

  });

};