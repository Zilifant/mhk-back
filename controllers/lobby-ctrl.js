// Lobby Control

const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { uniqLobbyID } = require('../utils/uniqLobbyID');
const { makeLobby } = require('../utils/modules/lobby-init-module');
const { makeUser } = require('../utils/modules/user-init-module');
const {
  getRoleById,
  omit,
  cookieSettings,
  LOBBIES,
  isDevEnv,
} = require('../utils/utils');
const g = require('../utils/modules/game-module')();
const mongo = require('../mongo');

// If user is returning to an in-progress game, data may need to be redacted.
function lobbyData(user, lobby) {
  if (!lobby.game) return lobby;
  // TO DO: seperate this semi-related side effect.
  if (!isPlayer(user, lobby)) {
    assignSpectator(user, lobby);
    return lobby;
  }
  return redactGame(user.id, lobby);
}

function isPlayer(user, lobby) {
  return lobby.game.players.some((p) => p.id === user.id);
}

function assignSpectator(user, lobby) {
  lobby.game.spectators.push(user);
  lobby.game.rolesRef.push({ role: 'spectator', user: user });
}

// Get user's role, then replace the lobby's game property with a redacted version specific
// to that role.
function redactGame(userId, lobby) {
  const role = getRoleById(userId, lobby);

  const lobbyWithGame = omit(lobby, ['game']);
  lobbyWithGame.game = g.redact(lobby.game, role);
  return lobbyWithGame;
}

// Called when visitor reaches a (potential) lobby url.
const getLobby = async (req, res, next) => {
  const lobby = LOBBIES[req.body.lobbyId.toLowerCase()];
  // Find lobby in db.
  // const lob = await mongo.findOne({
  //   filter: { id: req.body.lobbyId.toLowerCase() },
  // });
  // console.log(lob);

  if (!lobby) {
    const error = new HttpError('No lobby with that name.', 404);
    return next(error);
  }

  const user = lobby.users.find((u) => u.id === req.body.userId);
  // Find user in db.
  // const usr = await mongo.findOne({
  //   filter: { 'users.id': req.body.userId },
  //   projection: { 'users.$': 1 },
  // });
  // console.log(usr);

  res.status(200).json({ lobby: lobbyData(user, lobby) });
};

const createLobby = async (req, res) => {
  const isDemo = req.body.isDemo;

  const newUser = makeUser({
    id: uniqUserID(req.body.userName),
    // Generate lobby id; in development and not demo mode
    // and give lobby short, predictable id.
    myLobby: isDevEnv ? 'z' : uniqLobbyID(),
    isStreamer: req.body.isStreamer,
    isDemo: isDemo,
    lobbyCreator: true,
  });

  const newLobby = makeLobby(newUser, isDemo);

  LOBBIES[newLobby.id] = newLobby;

  // Insert lobby into db.
  // await mongo.insertOne(newLobby).then((r) => console.log(r));

  res
    .status(201)
    .cookie('userData', `${newUser.id}--${newLobby.id}`, cookieSettings)
    .json({
      user: newUser,
      lobby: newLobby,
    });
};

// Unimplemented.
const createDemoLobby = (req, res) => {
  const firstUserPlaceholderData = {
    id: 'demo-creator',
    myLobby: 'demo-' + uniqLobbyID(),
    isDemo: req.body.isDemo,
  };

  const newDemoLobby = makeLobby(firstUserPlaceholderData, req.body.isDemo);

  LOBBIES[newDemoLobby.id] = newDemoLobby;

  res.status(201).json({ lobby: newDemoLobby });
};

exports.getLobby = getLobby;
exports.createLobby = createLobby;
exports.createDemoLobby = createDemoLobby;
