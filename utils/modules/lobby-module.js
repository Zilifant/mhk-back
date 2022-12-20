// Lobby Utilities Module
// Provides functions used in lobby but not necessarily during a game.

const sample = require('lodash.sample');

const g = require('./game-module')();

const { makeGame } = require('./game-init-module');
const { initSettings } = require('./lobby-init-module');
const { isDevEnv } = require('../utils');

module.exports = (LOBBY) => {
  // if (isDevEnv) console.log('LOBBY ---', LOBBY);

  // Internal Utility Functions //

  const usersReady = () => LOBBY.users.filter((u) => u.isReady === true);
  const usersOnline = () => LOBBY.users.filter((u) => u.isOnline === true);
  const canUseAdvRoles = () => usersOnline().length >= LOBBY.minPlayerAdvRoles;

  // Exported Utility Functions //

  function getUserBy(val, key = 'id', lobby) {
    const lob = lobby || LOBBY;
    const user = lob.users.find((u) => u[key] === val);
    if (!user) {
      console.log(`ERR! ${lob.id}: no user with '${key}:${val}' found`);
      return;
    }
    return user;
  }

  // User Connects //

  // Join the IO room and update lobby data.
  function connectToLobby(lobby, user, socket) {
    socket.join(lobby.id);

    user.isOnline = true;
    user.isReady = isDevEnv; // Users start ready in development.
    user.socketId = socket.id;
    user.connectionTime = Date.now(); // Used for order in UI memberlist

    if (!user.color) assignColor(lobby, user);

    // If lobby has no leader (most likely because no other users are
    // connected) make user the leader.
    if (!lobby.leader) {
      lobby.leader = user.id;
      user.isLeader = true;
    }

    if (isDevEnv) console.log(`IO: ${user.id} connected`);
  }

  // Assign (and track) a unique color for each user.
  function assignColor(lobby, user) {
    const availCols = lobby.colors.filter((c) => !c.isAssigned);
    // If length of availCols is truthy (i.e. not 0) assign a new color.
    return !!availCols.length ? assignNewColor() : assignDupeColor();

    function assignNewColor() {
      const color = sample(availCols);
      color.isAssigned = true;
      color.assignedTo.push(user.id);
      user.color = color;
    }

    // In rare case where all 12 unique colors have been assigned, assign
    // a duplicate color, prioritizing colors assigned to offline users.
    function assignDupeColor() {
      const usersOffline = () =>
        LOBBY.users.filter((u) => u.isOnline === false);
      const oUCols = usersOffline().map((oU) => oU.color);
      const pickDupeColor = () => {
        const col = oUCols.find((c) => c.assignedTo.length === 1);
        // Handle edge case where all colors are picked twice.
        return !!col ? col : sample(lobby.colors);
      };
      const color = pickDupeColor();
      color.assignedTo.push(user.id);
      user.color = color;
    }
  }

  // User Disconnects //

  function disconnectFromLobby(lobby, user) {
    setUserDataToOffline(user);
    unAssignToGhost(lobby, user);
    reconcileAdvRolesSettings(lobby);

    if (isDevEnv) console.log(`IO: ${user.id} disconnected`);
  }

  // On disconnect front end sends no additional data; so id user by socket.
  function identifyDisconnectedUser(lobby, socket) {
    let user;
    try {
      user = getUserBy(socket.id, 'socketId', lobby);
    } catch (err) {
      return console.log(
        `ERR! idDisconnectedUser: no user for socket '${socket.id}'`,
      );
    }
    return user;
  }

  // Update lobby data.
  function setUserDataToOffline(user) {
    user.isOnline = false;
    user.isReady = false;
    user.socketId = null;
  }

  // If user was leader, and if any other users are online, assign a new leader.
  // Leadership is checked in io.js.
  // TO DO: clean this up.
  function changeLeader(lobby, user) {
    unAssignLeader(lobby, user);
    if (usersOnline().length > 0) return assignNewLeader(lobby);
    return null;
  }

  function assignNewLeader(lobby) {
    const newLeader = lobby.users.find((u) => u.isOnline === true);
    newLeader.isLeader = true;
    lobby.leader = newLeader.id;
    return newLeader;
  }

  function unAssignLeader(lobby, leader) {
    leader.isLeader = false;
    lobby.leader = null;
  }

  // If user was assigned to Ghost, unassign them. This does not unassign the
  // user from the Ghost role if a game is already in progress.
  function unAssignToGhost(lobby, user) {
    if (user.isAssignedToGhost) {
      user.isAssignedToGhost = false;
      lobby.gameSettings.assignedToGhost = null;
    }
  }

  // If number of online users is now below the min needed to use adv roles,
  // disable these roles.
  function reconcileAdvRolesSettings(lobby) {
    if (!canUseAdvRoles()) {
      lobby.gameSettings.hasWitness = false;
      lobby.gameSettings.hasAccomplice = false;
    }
  }

  // Leader Abdicates (Transfers Leadership) //

  function giveLeadership(lobby, newLeader) {
    lobby.users.find((u) => u.id === lobby.leader).isLeader = false;
    newLeader.isLeader = true;
    lobby.leader = newLeader.id;
  }

  // Leader Assigns/Unassigns Ghost //

  function assignGhost(lobby, newGhost) {
    unAssignGhost();
    newGhost ? assignNewGhost() : assignNoGhost();

    function unAssignGhost() {
      const formerGhost = lobby.users.find((u) => u.isAssignedToGhost === true);
      if (formerGhost) formerGhost.isAssignedToGhost = false;
    }

    function assignNewGhost() {
      newGhost.isAssignedToGhost = true;
      lobby.gameSettings.assignedToGhost = newGhost.id;
    }

    function assignNoGhost() {
      lobby.gameSettings.assignedToGhost = null;
    }
  }

  // Update A Game Setting //

  // TO DO: refactor into separate toggles.
  function updateSetting(lobby, setting) {
    switch (setting) {
      case `witness`:
        lobby.gameSettings.hasWitness = !lobby.gameSettings.hasWitness;
        break;
      case `accomplice`:
        lobby.gameSettings.hasAccomplice = !lobby.gameSettings.hasAccomplice;
        break;
      default:
        return console.log(`ERR! toggleItem: toggled item is '${setting}'`);
    }
  }

  // Update Game Timer Setting //

  // Timer duration is in minutes; setting duration to zero turns off timer.
  function updateTimer(lobby, duration) {
    const timer = lobby.gameSettings.timer;
    timer.duration = duration;
    duration === 0 ? (timer.on = false) : (timer.on = true);
  }

  // Start Game //

  function startGame(lobby) {
    lobby.gameOn = true;
    lobby.game = makeGame({
      lobbyId: lobby.id,
      players: usersReady(),
      settings: lobby.gameSettings,
    });
  }

  // Clear Game //

  // Only function in this module that is only used during a game. It does not
  // deal with game logic.
  function clearGame(lobby, io) {
    function resetSettings() {
      // If a user was assigned to Ghost, reset that setting on the user object.
      const ghost = lobby.users.find((u) => u.isAssignedToGhost === true);
      if (ghost) ghost.isAssignedToGhost = false;
      // Reset all settings on the lobby object.
      return initSettings(lobby);
    }

    // Unready all players. (In dev environment, users start ready.)
    if (!isDevEnv) {
      lobby.game.players.map((player) => {
        player.isReady = false;
        return player;
      });
    }

    if (lobby.game.timerIsRunning) g.clearTimer(lobby.game, io);

    lobby.game = null;
    lobby.gameOn = false;
    resetSettings();
  }

  return {
    getUserBy,
    connectToLobby,
    disconnectFromLobby,
    giveLeadership,
    changeLeader,
    assignGhost,
    identifyDisconnectedUser,
    updateSetting,
    updateTimer,
    startGame,
    clearGame,
  };
};
