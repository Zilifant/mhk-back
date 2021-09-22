// lobby utilities module

const sample = require('lodash.sample');
const { DEVMODE } = require('../utils/constants');

module.exports = () => {

  // Utilities

  function getUserBySID(lobby, SID) {
    return lobby.users.find(u => u.socketId === SID);
  };

  // User connects

  function connectToLobby(lobby, user, socket) {
    socket.join(lobby.id);

    user.isOnline = true;
    user.isReady = DEVMODE; // users start ready in dev mode
    user.socketId = socket.id;
    user.connectionTime = Date.now();

    if (!user.color) assignColor(lobby, user);

    if (!lobby.leader) {
      lobby.leader = user.id;
      user.isLeader = true;
    };

    console.log(`IO: ${user.id} connected`);
  };

  function assignColor(lobby, user) {

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

  // User disconnects

  function disconnectFromLobby(lobby, user) {
    removeUserFromLists(user);
    unAssignToGhost(lobby, user);
    reconcileAdvRolesSettings(lobby);
  }

  function identifyDisconnectedUser(lobby, socket) {
    let user;
    try {
      user = getUserBySID(lobby, socket.id);
      console.log(`IO: ${user.id} disconnected`);
    } catch (err) {
      return console.log(`ERR! idDisconnectedUser: no user for socket '${socket.id}'`);
    };
    return user;
  };

  function removeUserFromLists(user) {
    user.isOnline = false;
    user.isReady = false;
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
      user.isAssignedToGhost === false;
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

  return {
    connectToLobby,
    disconnectFromLobby,
    giveLeadership,
    getUserBySID,
    identifyDisconnectedUser,
    changeLeader,
    assignGhost
  };

};