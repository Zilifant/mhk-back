// Lobby Utilities Module
// Provides functions used in lobby.

const sample = require('lodash.sample');

const g = require('./game-module')();

const { isDevEnv } = require('../utils');

module.exports = () => {

  // User connects to IO.
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
    };

    if (isDevEnv) console.log(`IO: ${user.id} connected`);
  };

  // Assign (and track) a unique color for each user.
  function assignColor(lobby, user) {
    const availCols = lobby.colors.filter(c => !c.isAssigned);
    // If length of availCols is truthy (i.e. not 0) assign a new color.
    return !!availCols.length ? assignNewColor() : assignDupeColor();

    function assignNewColor() {
      const color = sample(availCols)
      color.isAssigned = true;
      color.assignedTo.push(user.id);
      user.color = color;
    };

    // In rare case where all 12 unique colors have been assigned, assign
    // a duplicate color, prioritizing colors assigned to offline users.
    function assignDupeColor() {
      const oUCols = lobby.usersOffline().map(oU => oU.color);
      const pickDupeColor = () => {
        const col = oUCols.find(c => c.assignedTo.length === 1);
        // Handle edge case where all colors are picked twice.
        return !!col ? col : sample(lobby.colors);
      };
      const color = pickDupeColor();
      color.assignedTo.push(user.id);
      user.color = color;
    };
  };

  // User disconnects from IO.

  function disconnectFromLobby(lobby, user) {
    setUserDataToOffline(user);
    unAssignToGhost(lobby, user);
    reconcileAdvRolesSettings(lobby);

    if (isDevEnv) console.log(`IO: ${user.id} disconnected`);
  }

  function identifyDisconnectedUser(lobby, socket) {
    let user;
    try {
      user = lobby.getUserBy(socket.id, 'socketId');
    } catch (err) {
      return console.log(`ERR! idDisconnectedUser: no user for socket '${socket.id}'`);
    };
    return user;
  };

  function setUserDataToOffline(user) {
    user.isOnline = false;
    user.isReady = false;
    user.socketId = null;
  };

  function changeLeader(lobby, user) {
    unAssignLeader(lobby, user);
    if (lobby.numOnline() > 0) return assignNewLeader(lobby);
    return null;
  };

  function assignNewLeader(lobby) {
    const newLeader = lobby.users.find(u => u.isOnline === true);
    newLeader.isLeader = true;
    lobby.leader = newLeader.id;
    return newLeader;
  }

  function unAssignLeader(lobby, leader) {
    leader.isLeader = false;
    lobby.leader = null;
  }

  function unAssignToGhost(lobby, user) {
    if (user.isAssignedToGhost) {
      user.isAssignedToGhost = false;
      lobby.gameSettings.assignedToGhost = null;
    };
  };

  function reconcileAdvRolesSettings(lobby) {
    if (!lobby.canUseAdvRoles()) {
      lobby.gameSettings.hasWitness = false;
      lobby.gameSettings.hasAccomplice = false;
    };
  };

  // Leader gives leadership to another user

  function giveLeadership(lobby, newLeader) {
    lobby.users.find(u => u.id === lobby.leader).isLeader = false;
    newLeader.isLeader = true;
    lobby.leader = newLeader.id;
  };

  // Leader assigns/unassigns ghost role

  function assignGhost(lobby, newGhost) {
    unAssignGhost();
    newGhost ? assignNewGhost() : assignNoGhost();

    function unAssignGhost() {
      const formerGhost = lobby.users.find(u => u.isAssignedToGhost === true);
      if (formerGhost) formerGhost.isAssignedToGhost = false;
    };

    function assignNewGhost() {
      newGhost.isAssignedToGhost = true;
      lobby.gameSettings.assignedToGhost = newGhost.id;
    };

    function assignNoGhost() {
      lobby.gameSettings.assignedToGhost = null;
    };
  };

  // Update a game setting

  function updateSetting(lobby, setting) {
    switch (setting) {
      case `witness`:
        lobby.gameSettings.hasWitness = !lobby.gameSettings.hasWitness;
        break;
      case `accomplice`:
        lobby.gameSettings.hasAccomplice = !lobby.gameSettings.hasAccomplice;
        break;
      default: return console.log(`ERR! toggleItem: toggled item is '${setting}'`);
    };
  };

  // Update game timer setting

  function updateTimer(lobby, duration) {
    const timer = lobby.gameSettings.timer;
    timer.duration = duration;
    duration === 0
      ? timer.on = false
      : timer.on = true;
  };

  // Clear game

  function clearGame(lobby, io) {

    if (!isDevEnv) {
      lobby.game.players.map(player => {
        player.isReady = false;
        return player;
      });
    };

    if (lobby.game.timerIsRunning) g.clearTimer(lobby.game, io);

    lobby.game = null;
    lobby.gameOn = false;
    lobby.resetSettings();
  };

  return {
    connectToLobby,
    disconnectFromLobby,
    giveLeadership,
    changeLeader,
    assignGhost,
    identifyDisconnectedUser,
    updateSetting,
    updateTimer,
    clearGame
  };

};