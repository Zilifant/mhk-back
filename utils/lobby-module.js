// lobby utilities module

// const {
//   MIN_PLAYER_COUNT,
//   MIN_PLAYER_COUNT_FOR_ADV_ROLES
// } = require('../utils/constants');

module.exports = () => {

  function getUserBySID(lobby, SID) {
    return lobby.users.find(u => u.socketId === SID);
  };

  function identifyDisconnectedUser(lobby, socket) {
    let user;
    try {
      user = getUserBySID(lobby, socket.id);
      console.log(`IO: ${user.id} disconnected`);
    } catch (err) {
      return console.log(`ERR! cannot find a user on socket: ${socket.id}`);
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

  function unAssignGhost(lobby) {
    const formerGhost = lobby.users.find(u => u.isAssignedToGhost === true);
    if (formerGhost) formerGhost.isAssignedToGhost = false;
  };

  return {
    getUserBySID,
    identifyDisconnectedUser,
    removeUserFromLists,
    changeLeader,
    unAssignToGhost,
    reconcileAdvRolesSettings,
    unAssignGhost
  };

};