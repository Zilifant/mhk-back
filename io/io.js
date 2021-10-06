
const { getLobbyById, omit, msg, have } = require('../utils/utils');
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

      const msgData = {
        type: 'join',
        args,
        isInGame: false,
      }

      emitByRole('userConnected', msg(msgData), data);
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

      const msgData = {
        type: 'leave',
        args,
        isInGame: false,
      }

      emitByRole('userDisconnected', msg(msgData));
    });

    // Leader gives leadership to another user

    socket.on('giveLeadership', newLeaderId => {
      if (!have(lobby)) return;

      const newLeader = lobby.getUserBy(newLeaderId);

      l.giveLeadership(lobby, newLeader);

      const args = [
        [newLeader.id, newLeader.color.id]
      ];

      const msgData = {
        type: 'newLeader',
        args,
        isInGame: false,
      }

      emitByRole('giveLeadership', msg(msgData));
    });

    // User becomes ready/unready

    socket.on('readyUnready', userId => {
      if (!have(lobby)) return;

      const user = lobby.getUserBy(userId);
      user.isReady = !user.isReady;

      const args = [
        [user.id, user.color.id],
        user.isReady
      ];

      const msgData = {
        type: 'ready',
        args,
        isInGame: false,
      }

      emitByRole('readyUnready', msg(msgData));
    });

    // Leader assigns/unassigns ghost role

    socket.on('ghostAssigned', userId => {
      if (!have(lobby)) return;

      const unAssign = !userId || (userId === lobby.gameSettings.assignedToGhost);
      const newGhost = !unAssign ? lobby.getUserBy(userId) : null;

      l.assignGhost(lobby, newGhost);

      const args = newGhost
        ? [[newGhost.id, newGhost.color.id], false]
        : [[null, null], true];

      const msgData = {
        type: 'ghostAssigned',
        args,
        isInGame: false,
      }

      emitByRole('ghostAssigned', msg(msgData));
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

      const msgData = {
        type: 'advanceTo',
        args: [lobby.game.currentStage],
        isInGame: true,
      };

      emitByRole('startGame', msg(msgData));
    });

    // Clear game

    socket.on('clearGame', () => {
      if (!have(lobby)) return;

      l.clearGame(lobby, io);

      const msgData = {
        type: 'clearGame',
        isInGame: true,
      };

      emitByRole('clearGame', msg(msgData));
    });

    // Advance game stage

    socket.on('advanceStage', data => {
      if (!have(lobby)) return;

      g.advanceToNextStage(lobby.game, io, data);

      const msgData = {
        type: 'advanceTo',
        args: [lobby.game.currentStage],
        isInGame: true,
      };

      emitByRole('advanceStage', msg(msgData));
    });

    // Key evidence chosen by killer

    socket.on('keyEvidenceChosen', (keyEv) => {
      if (!have(lobby)) return;

      g.advanceOnKeyEvChosen(lobby.game, io, keyEv);

      const msgData = {
        type: 'advanceTo',
        args: [lobby.game.currentStage],
        isInGame: true,
      };

      emitByRole('advanceStage', msg(msgData));
    });

    // Clue chosen by ghost

    socket.on('clueChosen', data => {
      if (!have(lobby)) return;

      g.confirmClueChoice(lobby.game, data[0]);

      const msgData = {
        type: 'clueChosen',
        args: [data[0]],
        isInGame: true,
      };

      emitByRole('clueChosen', msg(msgData));
    });

    // accusation

    socket.on('accusation', ({accuserId, accusedId, accusalEv}) => {
      if (!have(lobby)) return;

      const accuser = lobby.getUserBy(accuserId);
      const accused = lobby.getUserBy(accusedId);

      const msgData = g.announceAccusal({lobby, accuser, accused, accusalEv});

      emitByRole('newAccusal', msg(msgData));

      const [result, message] = g.resolveAccusal(lobby.game, accusalEv, accuser, io);

      // suspenseful delay
      setTimeout(() => {
        lobby.game.isResolvingAccusal = false;
        emitByRole(result, message);
      }, 3000);
    });

    socket.on('secondMurder', targetId => {
      if (!have(lobby)) return;

      const [result, message] = g.resolveSecondMurder(lobby.game, targetId, io);

      emitByRole(result, message);
    });

    // newMessage

    socket.on('newMessage', ({senderId, text}) => {
      if (!have(lobby)) return;

      const user = lobby.getUserBy(senderId);

      const args = [
        [user.id, user.color.id],
        text
      ];

      const msgData = {
        type: 'userMessage',
        args,
        isInGame: false,
        senderId
      }

      const message = msg(msgData);

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