// User Initiation Module
// Creates new user.

const makeUser = ({
  id, myLobby, isStreamer, lobbyCreator = false
}) => {
  const userName = id.slice(0,-5);
  return {
    id,
    socketId: null,
    userName: userName,
    myLobby,
    isOnline: false,
    isReady: false,
    isLeader: lobbyCreator,
    isStreamer,
    isAssignedToGhost: false,
    connectionTime: null,
    color: null,
    canAccuse: false,
    hand: { means: null, evidence: null },
  };
};

exports.makeUser = makeUser;