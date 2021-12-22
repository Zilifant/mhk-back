// IO

const { getLobbyById, omit, msg } = require('./utils/utils');
const l = require('./utils/modules/lobby-module')();
const g = require('./utils/modules/game-module')();

// TO DO: break these out into more granular emits.
// Which front end components need each emit:
const emitSimply = [
  'userConnected', // anno/feed, memberlist, setup, players
  'userDisconnected', // anno/feed, memberlist, setup, players
  'readyUnready', // anno/feed, memberlist, setup, players
  'giveLeadership', // anno/feed, memberlist, setup*, info*, footer*
  'ghostAssigned', // anno/feed, memberlist
  'gameSettingsChange', // setup
  'startGame', // all
  'clearGame', // all
  'advanceStage', // anno/feed, info, ???
  'clueChosen', // anno/feed, ghostcard
  'newAccusal', // anno/feed, loading
  'wrongAccusation', // anno/feed, players*, playerUI*
  'resolveGame', // anno/feed, info*, all buttons
];

const saveToChat = [
  'startGame', 'clearGame', 'advanceStage', 'newAccusal', 'wrongAccusation',
  'resolveGame'
];

module.exports = io => {

  io.on('connection', socket => {

    let lobby;

    // User Connects //

    socket.on('connectToLobby', ({ userId, lobbyId }) => {
      lobby = getLobbyById(lobbyId);
      if (!lobby) return

      const user = lobby?.users.find(u => u.id === userId);
      if (!user) return console.log(`ERR! connect: '${userId}' not in '${lobbyId}' user list`);

      // Handle case of user loading the app on a second browser window that
      // shares the same cookie data. Send a notification and then disconnect
      // the original instance.
      if (!!user.socketId) {
        const oldSocket = io.sockets.sockets.get(user.socketId);
        const msgType = { type: 'duplicateConnection' };
        const disconnectMsg = msg(msgType);
        io.to(oldSocket.id).emit('privateAnnounce', disconnectMsg);
        oldSocket.disconnect(true);
      };

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

    // User Disconnects //

    socket.on('disconnect', () => {
      if (!lobby) return

      const user = l.identifyDisconnectedUser(lobby, socket);
      if (!user) return console.log(`ERR! disconnect: no user for socket '${socket.id}'`);

      l.disconnectFromLobby(lobby, user);

      // If user was the leader, assign a new leader.
      // TO DO: This is confusing; refactor.
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

    // Leader Abdicates (Transfers Leadership) //

    socket.on('giveLeadership', newLeaderId => {
      if (!lobby) return

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

    // User Becomes Ready/Unready //

    socket.on('readyUnready', userId => {
      if (!lobby) return

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

    // Leader Assigns/Unassigns Ghost //

    socket.on('ghostAssigned', userId => {
      if (!lobby) return

      // If userId is falsy or if userId is already assigned to Ghost (meaning
      // the leader 'selected' that user again to toggle the assignment), send
      // `null` to assignGhost, else send the userId.
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

    // Toggle Advanced Roles //

    // TO DO: rename this and related functions to be less generic, as this
    // only handles the advanced role settings.
    socket.on('toggle', setting => {
      if (!lobby) return

      l.updateSetting(lobby, setting);

      emitByRole('gameSettingsChange');
    });

    // Update Game Timer Setting //

    socket.on('chooseTimer', duration => {
      if (!lobby) return

      l.updateTimer(lobby, duration);

      emitByRole('gameSettingsChange');
    });

    // Start Game //

    socket.on('startGame', data => {
      if (!lobby) return

      lobby.makeGame(data.settings);

      const msgData = {
        type: 'advanceTo',
        args: [lobby.game.currentStage],
        isInGame: true,
      };

      emitByRole('startGame', msg(msgData));
    });

    // Clear Game //

    socket.on('clearGame', () => {
      if (!lobby) return

      l.clearGame(lobby, io);

      const msgData = {
        type: 'clearGame',
        isInGame: true,
      };

      emitByRole('clearGame', msg(msgData));
    });

    // Advance Stage //

    socket.on('advanceStage', data => {
      if (!lobby) return

      g.advanceToNextStage(lobby.game, io, data);

      const msgData = {
        type: 'advanceTo',
        args: [lobby.game.currentStage],
        isInGame: true,
      };

      emitByRole('advanceStage', msg(msgData));
    });

    // Key Evidence Chosen //

    socket.on('keyEvidenceChosen', (keyEv) => {
      if (!lobby) return

      g.advanceOnKeyEvChosen(lobby.game, io, keyEv);

      const msgData = {
        type: 'advanceTo',
        args: [lobby.game.currentStage],
        isInGame: true,
      };

      emitByRole('advanceStage', msg(msgData));
    });

    // Clue Chosen //

    socket.on('clueChosen', data => {
      if (!lobby) return

      g.confirmClueChoice(lobby.game, data[0]);

      const msgData = {
        type: 'clueChosen',
        args: [data[0]],
        isInGame: true,
      };

      emitByRole('clueChosen', msg(msgData));
    });

    // Accusation //

    socket.on('accusation', ({accuserId, accusedId, accusalEv}) => {
      if (!lobby) return

      const accuser = lobby.getUserBy(accuserId);
      const accused = lobby.getUserBy(accusedId);

      // Send message announcing the accusal.
      const msgData = g.announceAccusal({lobby, accuser, accused, accusalEv});
      emitByRole('newAccusal', msg(msgData));

      // Resolve the accusal.
      const [result, message] = g.resolveAccusal(lobby.game, accusalEv, accuser, io);

      // After a suspenseful delay, send message with the resolution.
      setTimeout(() => {
        lobby.game.isResolvingAccusal = false;
        emitByRole(result, message);
      }, 3000);
    });

    // Second Murder //

    // TO DO: Implement a suspensful delay.
    socket.on('secondMurder', targetId => {
      if (!lobby) return

      const [result, message] = g.resolveSecondMurder(lobby.game, targetId, io);

      emitByRole(result, message);
    });

    // New Message //

    // Handles user messages in chat.
    socket.on('newMessage', ({senderId, text}) => {
      if (!lobby) return

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

    // Each client recieves different data depending on the player's role.
    function emitByRole(e, msg, data) {

      // Some system messages are saved to chat feed, so that they will appear
      // to users who connect later.
      // TO DO: move this elsewhere.
      if (saveToChat.includes(e)) lobby.chat.push(msg);

      // TO DO: Currently redundant; remove this.
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