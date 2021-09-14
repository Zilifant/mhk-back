const intersection = require('lodash.intersection');
const sample = require('lodash.sample');
const { getLobbyById, getUserById, omit, msg, have } = require('../utils/utils');
const { DEVMODE } = require('../utils/constants');
const { l } = require('../utils/lobby-module');

const emitSimply = [
  'userConnected', 'userDisconnected', 'giveLeadership', 'ghostAssigned', 'gameSettingsChange', 'startGame', 'readyUnready', 'clearGame', 'advanceStage', 'clueChosen', 'newAccusal', 'wrongAccusation', 'resolveGame'
];

const saveToChat = [
  'startGame', 'clearGame', 'advanceStage', 'newAccusal', 'wrongAccusation', 'resolveGame'
];

module.exports = io => {

  io.on('connection', socket => {

    function assignColor(user) {

      function assignNewColor() {
        const color = sample(availCols)
        color.isAssigned = true;
        color.assignedTo.push(user.id);
        user.color = color;
      };
  
      function assignDupeColor() {
        const oUCols = lobby.usersOffline().map(oU => oU.color);
        const pickDupeColor = () => {
          const col = oUCols.find(c => c.assignedTo.length === 1);
          // handle edge case where all colors are picked twice
          return !!col ? col : sample(lobby.colors);
        };
        const color = pickDupeColor();
        color.assignedTo.push(user.id);
        user.color = color;
      };

      const availCols = lobby.colors.filter(c => !c.isAssigned);

      return !!availCols.length ? assignNewColor() : assignDupeColor();
    };

    let lobby;

    socket.on('connectToLobby', ({ userId, lobbyId }) => {

      lobby = getLobbyById(lobbyId);
      const user = lobby?.users.find(u => u.id === userId);

      if (!user) return console.log(`${userId} not in ${lobbyId} user list`);

      socket.join(lobbyId);
      user.isOnline = true;
      user.isReady = DEVMODE; // users start ready in dev mode
      user.socketId = socket.id;
      user.connectionTime = Date.now();

      console.log(`${user.id} connected`);

      if (!user.color) assignColor(user);

      if (!lobby.leader) {
        lobby.leader = userId;
        user.isLeader = true;
      };

      const args = [
        [user.id, user.color.id]
      ];

      const data = {
        event: 'userConnected',
        user: user
      };

      emitByRole('userConnected', msg('join', args, false), data);
    });

    // disconnect

    socket.on('disconnect', () => {

      const user = l.identifyDisconnectedUser(lobby, socket);

      if (!user) return console.log(`Error: cannot find user for Socket: ${socket.id}`);

      l.removeUserFromLists(user);
      l.unAssignToGhost(lobby, user);

      const newLeader = l.makeNewLeader(lobby, user);

      l.reconcileAdvRolesSettings(lobby);

      const args = [
        [user.id, user.color.id],
        [newLeader?.id, newLeader?.color.id]
      ];

      emitByRole('userDisconnected', msg('leave', args, false));
    });

    // giveLeader

    socket.on('giveLeadership', newLeaderId => {
      const newLeader = lobby.users.find(u => u.id === newLeaderId);
      const oldLeader = lobby.users.find(u => u.id === lobby.leader);
      lobby.leader = newLeaderId;
      newLeader.isLeader = true;
      oldLeader.isLeader = false;

      const args = [
        [newLeader.id, newLeader.color.id]
      ];

      emitByRole('giveLeadership', msg('newLeader', args, false));
    });

    // readyUnready

    socket.on('readyUnready', userId => {
      if (!have(lobby)) return;

      const user = lobby.users.find(u => u.id === userId);
      user.isReady ? user.isReady = false : user.isReady = true;

      const args = [
        [user.id, user.color.id],
        user.isReady
      ];

      emitByRole('readyUnready', msg('ready', args, false));
    });

    // ghostAssigned

    function assignNewGhost(userId) {
      l.unAssignGhost(lobby);
      const newGhost = lobby.users.find(u => u.id === userId);
      newGhost.isAssignedToGhost = true;
      lobby.gameSettings.assignedToGhost = userId;

      const args = [
        [newGhost.id, newGhost.color.id],
        false
      ];

      emitByRole('ghostAssigned', msg('ghostAssigned', args, false));
    };

    function assignNoGhost() {
      l.unAssignGhost(lobby);
      lobby.gameSettings.assignedToGhost = null;

      emitByRole('ghostAssigned', msg('ghostAssigned', [[null, null], true], false));
    };

    socket.on('ghostAssigned', userId => {
      if (!have(lobby)) return;

      const unAssign = !userId || (userId === lobby.gameSettings.assignedToGhost);
      unAssign ? assignNoGhost() : assignNewGhost(userId);
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

      emitByRole('startGame', msg('advanceTo', [lobby.game.currentStage], true));
    });

    // clearGame

    function clearGame() {
      if (!have(lobby)) return;

      if (!DEVMODE) {
        lobby.game.players.map(player => {
          player.isReady = false;
          return player;
        });
      };

      if (lobby.game.timerIsRunning) lobby.game.timer.clear(lobby.id, io);

      lobby.game = null;
      lobby.gameOn = false;
      lobby.resetSettings();
    }

    socket.on('clearGame', () => {
      clearGame();
      emitByRole('clearGame', msg('clearGame', [], true));
    });

    // advanceStage

    socket.on('advanceStage', data => {
      if (!have(lobby)) return;

      lobby.game.advanceStage(null, io);
      const newStage = lobby.game.currentStage;
      if (!!newStage.onStart) newStage.onStart(lobby.game, data);
      console.log(newStage.id);
      emitByRole('advanceStage', msg('advanceTo', [lobby.game.currentStage], true));
    });

    // keyEvidenceChosen (by killer)

    socket.on('keyEvidenceChosen', (keyEv) => {
      if (!have(lobby)) return;

      lobby.game.keyEvidence = keyEv;
      lobby.game.advanceStage(null, io);
      emitByRole('advanceStage', msg('advanceTo', [lobby.game.currentStage], true));
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
      emitByRole('clueChosen', msg('clueChosen', [clue], true));
    });

    // accusation

    function isAccusalRight(accusalEv) {
      return intersection(accusalEv, lobby.game.keyEvidence).length === 2;
    };

    function resolveRightAccusal(accuser) {
      lobby.game.witness
        ? advToSecondMurder(accuser.id)
        : resolveGame('bluewin');
    };

    function advToSecondMurder(accuserId) {
      lobby.game.advanceStage('second-murder', io);
      emitByRole('advanceStage', msg('advanceTo', [lobby.game.currentStage, accuserId], true));
    };

    function resolveSecondMurder(targetId) {
      lobby.game.witness.id === targetId
        ? resolveGame('redwinwitnessdead')
        : resolveGame('bluewinwitnessalive');
    };

    function resolveWrongAccusal(accuser) {
      lobby.game.blueCanAccuse()
        ? continueRound(accuser)
        : resolveGame('redwin');
    };

    function continueRound(user) {
      const args = [
        [user.id, user.color.id]
      ];
      emitByRole('wrongAccusation', msg('accusationWrong', args, true));
    };

    function resolveGame(result) {
      lobby.game.advanceStage('game-over', io);
      emitByRole('resolveGame', msg('resolveGame', [result], true));
    };

    socket.on('accusation', ({accuserSID, accusedId, accusalEv}) => {
      if (!have(lobby)) return;

      lobby.game.isResolvingAccusal = true;

      const accuser = l.getUserBySID(lobby, accuserSID);
      const accused = getUserById({lobbyId: lobby.id, userId: accusedId});

      accuser.accusalSpent = true;
      accuser.canAccuse = false;

      const message = msg('accusation', [{
        accuser: [accuser.id, accuser.color.id],
        accusee: [accused.id, accused.color.id],
        evidence: accusalEv
      }], true);
      emitByRole('newAccusal', message);
      // io.in(lobby.id).emit('announcement', {msg: message});

      // suspensful delay
      setTimeout(() => {
        lobby.game.isResolvingAccusal = false;
        isAccusalRight(accusalEv)
        ? resolveRightAccusal(accuser)
        : resolveWrongAccusal(accuser);
      }, 3000);
    });

    socket.on('secondMurder', targetId => resolveSecondMurder(targetId));

    // newMessage

    socket.on('newMessage', data => {
      if (!have(lobby)) return;

      const user = getUserById({lobbyId: lobby.id, userId: data.senderId});

      const args = [
        [user.id, user.color.id],
        data.text
      ];

      const message = msg('userMessage', args, false, data.senderId);
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