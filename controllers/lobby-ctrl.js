
const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { uniqLobbyID } = require('../utils/uniqLobbyID');
const { makeLobby, makeUser } = require('../data');
const { getLobbyById, omit } = require('../utils/utils');
const { LOBBIES } = require('../utils/constants');

const getLobby = async (req, res, next) => {
  // console.log('getLobby');

  let lobby;
  try {
    lobby = await getLobbyById(req.params.lobbyUrlRoute);
  } catch (err) {
    console.log(err);
    const error = new HttpError('Could not find lobby.', 500);
    return next(error);
  };

  const resData = lobby.gameOn
                  ? resWithGame(req.body.userId, lobby)
                  : lobby

  res.status(200).json({ lobby: resData });
};

const createLobby = async (req, res) => {
  // console.log('createLobby');

  const userId = uniqUserID(req.body.userName);
  const lobbyId = uniqLobbyID();

  const newUser = makeUser({
    id: userId,
    myLobby: lobbyId,
    lobbyCreator: true
  });

  const newLobby = makeLobby(newUser);

  LOBBIES[newLobby.id] = newLobby;

  req.session.userIdCookie = userId;
  req.session.userLobbyCookie = lobbyId;

  res.status(201).json({
    user: newUser,
    lobby: newLobby
  });
};

function resWithGame(userId, lobby) {
  const role = getRoleById(userId, lobby);

  const lobbyWithGame = omit(lobby, ['game']);
  lobbyWithGame.game = lobby.game.viewAs(role);
  return lobbyWithGame;
};

function getRoleById(userId, lobby) {
  const role = lobby.game.rolesRef.find(ref => ref.user.id === userId).role;
  if (!!role) return role;
  return console.log(`${userId} matches no roles in this game`);
};

exports.getLobby = getLobby;
exports.createLobby = createLobby;