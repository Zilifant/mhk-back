const intersection = require('lodash.intersection');
const { getLobbyById, getUserById, omit, msg, have } = require('../utils/utils');
// const { DEVMODE } = require('../utils/constants');
const l = require('../utils/lobby-module')();
const g = require('../utils/game-module')();

const emitSimply = [
  'userConnected', 'userDisconnected', 'giveLeadership', 'ghostAssigned', 'gameSettingsChange', 'startGame', 'readyUnready', 'clearGame', 'advanceStage', 'clueChosen', 'newAccusal', 'wrongAccusation', 'resolveGame'
];

const saveToChat = [
  'startGame', 'clearGame', 'advanceStage', 'newAccusal', 'wrongAccusation', 'resolveGame'
];

module.exports = io => {

  io.on('connection', socket => {

    let lobby;

    // User connects

    socket.on('connectToLobby', ({ userId, lobbyId }) => {
      lobby = getLobbyById(lobbyId);
      if (!have(lobby)) return;

      const user = lobby?.users.find(u => u.id === userId);
      if (!user) return console.log(`ERR! connect: '${userId}' not in '${lobbyId}' user list`);

      l.connectToLobby(lobby, user, socket);

      const args = [
        [user.id, user.color.id]
      ];

      const data = {
        event: 'userConnected',
        user: user
      };

      emitByRole('userConnected', msg('join', args, false), data);
    });

    // User disconnects

    socket.on('disconnect', () => {
      if (!have(lobby)) return;

      const user = l.identifyDisconnectedUser(lobby, socket);
      if (!user) return console.log(`ERR! disconnect: no user for socket '${socket.id}'`);

      l.disconnectFromLobby(lobby, user);

      const newLeader = user.isLeader ? l.changeLeader(lobby, user) : null;

      const args = [
        [user.id, user.color.id],
        [newLeader?.id, newLeader?.color.id]
      ];

      emitByRole('userDisconnected', msg('leave', args, false));
    });

    // Leader gives leadership to another user

    socket.on('giveLeadership', newLeaderId => {
      if (!have(lobby)) return;

      const newLeader = lobby.getUserById(newLeaderId);

      l.giveLeadership(lobby, newLeader);

      const args = [
        [newLeader.id, newLeader.color.id]
      ];

      emitByRole('giveLeadership', msg('newLeader', args, false));
    });

    // User becomes ready/unready

    socket.on('readyUnready', userId => {
      if (!have(lobby)) return;

      const user = lobby.getUserById(userId);
      user.isReady = !user.isReady;

      const args = [
        [user.id, user.color.id],
        user.isReady
      ];

      emitByRole('readyUnready', msg('ready', args, false));
    });

    // Leader assigns/unassigns ghost role

    socket.on('ghostAssigned', userId => {
      if (!have(lobby)) return;

      const unAssign = !userId || (userId === lobby.gameSettings.assignedToGhost);
      const newGhost = !unAssign ? lobby.getUserById(userId) : null;

      l.assignGhost(lobby, newGhost);

      const args = newGhost
        ? [[newGhost.id, newGhost.color.id], false]
        : [[null, null], true];

      emitByRole('ghostAssigned', msg('ghostAssigned', args, false));
    });

    // Update a game setting

    socket.on('toggle', setting => {
      if (!have(lobby)) return;

      l.updateSetting(lobby, setting);

      emitByRole('gameSettingsChange');
    });

    // Update game timer setting

    socket.on('chooseTimer', duration => {
      if (!have(lobby)) return;

      l.updateTimer(lobby, duration);

      emitByRole('gameSettingsChange');
    });

    // Start game

    socket.on('startGame', data => {
      if (!have(lobby)) return;

      lobby.makeGame(data.settings);

      emitByRole('startGame', msg('advanceTo', [lobby.game.currentStage], true));
    });

    // Clear game

    socket.on('clearGame', () => {
      if (!have(lobby)) return;

      l.clearGame(lobby, io);

      emitByRole('clearGame', msg('clearGame', [], true));
    });

    // Advance game stage

    socket.on('advanceStage', data => {
      if (!have(lobby)) return;

      g.advanceToNextStage(lobby.game, io, data);

      emitByRole('advanceStage', msg('advanceTo', [lobby.game.currentStage], true));
    });

    // Key evidence chosen by killer

    socket.on('keyEvidenceChosen', (keyEv) => {
      if (!have(lobby)) return;

      g.advanceOnKeyEvChosen(lobby.game, io, keyEv)

      emitByRole('advanceStage', msg('advanceTo', [lobby.game.currentStage], true));
    });

    // Clue chosen by ghost

    socket.on('clueChosen', data => {
      if (!have(lobby)) return;

      g.confirmClueChoice(lobby.game, data[0]);

      emitByRole('clueChosen', msg('clueChosen', [data[0]], true));
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

    socket.on('accusation', ({accuserId, accusedId, accusalEv}) => {
      if (!have(lobby)) return;

      lobby.game.isResolvingAccusal = true;

      const accuser = l.getUserById(lobby, accuserId);
      const accused = l.getUserById(lobby, accusedId);

      accuser.accusalSpent = true;
      accuser.canAccuse = false;

      const message = msg('accusation', [{
        accuser: [accuser.id, accuser.color.id],
        accusee: [accused.id, accused.color.id],
        evidence: accusalEv
      }], true);
      emitByRole('newAccusal', message);

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