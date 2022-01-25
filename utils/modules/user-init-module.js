// User Initiation Module
// Creates a new user.

const makeUser = ({
  id, myLobby, isStreamer, isDemo, lobbyCreator = false
}) => {

  // TO DO: remove properties used only in-game.
  return {
    id,
    isDemo,
    socketId: null,
    userName: id.slice(0,-5), // Remove randomized numbers for UI display.
    myLobby,
    isOnline: false,
    isReady: false,
    isLeader: lobbyCreator, // If user is lobby creator, they start as leader.
    isStreamer, // 'Streaming Mode' setting.
    isAssignedToGhost: false,
    connectionTime: null,
    color: null,
    canAccuse: false,
    hand: { means: null, evidence: null }
  };
};

exports.makeUser = makeUser;