// lobby utilities module

// const {
//   MIN_PLAYER_COUNT,
//   MIN_PLAYER_COUNT_FOR_ADV_ROLES
// } = require('../utils/constants');

const lobbyModule = (() => {

  function getUserBySID(lobby, SID) {
    return lobby.users.find(u => u.socketId === SID);
  };

  function identifyDisconnectedUser(lobby, socket) {
    let user;
    try {
      user = getUserBySID(lobby, socket.id);
      console.log(`${user.id} disconnected`);
    } catch (err) {
      return console.log(`Cannot find user on Socket: ${socket.id}`);
    };
    return user;
  };

  function removeUserFromLists(user) {
    user.isOnline = false;
    user.isReady = false;
  };

  function makeNewLeader(lobby, user) {
    const needNewLeader = user.isLeader && (lobby.numOnline() >= 1);
    let newLeader;
    if (needNewLeader) {
      newLeader = lobby.users.find(u => u.isOnline === true);
      user.isLeader = false;
      newLeader.isLeader = true;
      lobby.leader = newLeader.id;
      return newLeader;
    };
  };

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
    makeNewLeader,
    unAssignToGhost,
    reconcileAdvRolesSettings,
    unAssignGhost
  };

})();

exports.l = lobbyModule;