// Lobby Control

const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { uniqLobbyID } = require('../utils/uniqLobbyID');
const { makeLobby } = require('../utils/modules/lobby-init-module');
const { makeUser } = require('../utils/modules/user-init-module');
const {
  getLobbyById, getRoleById, omit, cookieSettings, LOBBIES, isDevEnv
} = require('../utils/utils');

// If user is returning to an in-progress game, data may need to be redacted.
function lobbyData(user, lobby) {
  if (!lobby.game) return lobby;
  // TODO: seperate this semi-related side effect.
  if (!isPlayer(user, lobby)) {
    assignSpectator(user, lobby);
    return lobby;
  };
  return redactGame(user.id, lobby);
};

function isPlayer(user, lobby) {
  return lobby.game.players.some(p => p.id === user.id);
}

function assignSpectator(user, lobby) {
  lobby.game.spectators.push(user);
  lobby.game.rolesRef.push({role: 'spectator', user: user});
};

// Get user's role, then replace the lobby's game property with a redacted
// version specific to that role.
function redactGame(userId, lobby) {
  const role = getRoleById(userId, lobby);

  const lobbyWithGame = omit(lobby, ['game']);
  lobbyWithGame.game = lobby.game.viewAs(role);
  return lobbyWithGame;
};

module.exports = () => {

  // Called when visitor reaches a (potential) lobby url.
  // TODO: replace param with json data.
  const getLobby = async (req, res, next) => {

    let lobby;
    try {
      lobby = await getLobbyById(req.params.lobbyUrlRoute);
    } catch (err) {
      console.log(err);
      const error = new HttpError('Could not find lobby.', 500);
      return next(error);
    };

    if (!lobby) {
      const error = new HttpError('No lobby with that name.', 404);
      return next(error);
    };

    const user = lobby.users.find(u => u.id === req.body.userId);

    res.status(200).json({ lobby: lobbyData(user, lobby) });
  };

  const createLobby = async (req, res) => {

    // Append random numbers to visitor's chosen user name
    const userId = uniqUserID(req.body.userName);
    // Set 'streaming mode' option
    const isStreamer = req.body.isStreamer;

    // Generate lobby id; in development give lobby short, predictable id.
    const lobbyId = isDevEnv ? 'z' : uniqLobbyID();

    const newUser = makeUser({
      id: userId,
      myLobby: lobbyId,
      isStreamer,
      lobbyCreator: true
    });

    const newLobby = makeLobby(newUser);

    LOBBIES[newLobby.id] = newLobby;

    res
    .status(201)
    .cookie('userData', `${userId}--${lobbyId}`, cookieSettings)
    .json({
      user: newUser,
      lobby: newLobby
    });
  };

  return {
    getLobby,
    createLobby
  }

};
