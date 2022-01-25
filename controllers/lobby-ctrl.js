// Lobby Control

const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { uniqLobbyID } = require('../utils/uniqLobbyID');
const { makeLobby } = require('../utils/modules/lobby-init-module');
const { makeUser } = require('../utils/modules/user-init-module');
const { getRoleById, omit, cookieSettings, LOBBIES, isDevEnv } = require('../utils/utils');

// If user is returning to an in-progress game, data may need to be redacted.
function lobbyData(user, lobby) {
  if (!lobby.game) return lobby;
  // TO DO: seperate this semi-related side effect.
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

// Get user's role, then replace the lobby's game property with a redacted version specific
// to that role.
function redactGame(userId, lobby) {
  const role = getRoleById(userId, lobby);

  const lobbyWithGame = omit(lobby, ['game']);
  lobbyWithGame.game = lobby.game.viewAs(role);
  return lobbyWithGame;
};

// Called when visitor reaches a (potential) lobby url.
const getLobby = (req, res, next) => {
  const lobby = LOBBIES[req.body.lobbyId.toLowerCase()];

  if (!lobby) {
    const error = new HttpError('No lobby with that name.', 404);
    return next(error);
  };

  const user = lobby.users.find(u => u.id === req.body.userId);

  res.status(200).json({ lobby: lobbyData(user, lobby) });
};

const createLobby = (req, res) => {

  const isDemo = !!req.body.isDemo

  // Generate lobby id; in development and not demo mode, give lobby short, predictable id.
  const myLobby = () => {
    if (isDemo) return uniqLobbyID(isDemo);
    if (isDevEnv) return 'z';
    return uniqLobbyID(isDemo);
  }

  const newUser = makeUser({
    id: uniqUserID(req.body.userName),
    myLobby: myLobby(),
    isStreamer: req.body.isStreamer,
    lobbyCreator: true
  });

  const newLobby = makeLobby(newUser, isDemo);

  LOBBIES[newLobby.id] = newLobby;

  res
  .status(201)
  .cookie('userData', `${newUser.id}--${newLobby.id}`, cookieSettings)
  .json({
    user: newUser,
    lobby: newLobby
  });
};

exports.getLobby = getLobby;
exports.createLobby = createLobby;
