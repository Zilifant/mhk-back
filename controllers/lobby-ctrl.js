
const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { uniqLobbyID } = require('../utils/uniqLobbyID');
const { makeLobby, makeUser } = require('../data');
const { getLobbyById } = require('../utils/utils');
const { LOBBIES } = require('../utils/constants');

const getLobby = async (req, res, next) => {
  console.log('getLobby');

  let lobby;
  try {
    lobby = await getLobbyById(req.params.lobbyUrlRoute);
  } catch (err) {
    console.log(err);
    const error = new HttpError('Could not find lobby.', 500);
    return next(error);
  };

  res.status(200).json({ lobby });
};

const createLobby = async (req, res) => {
  console.log('createLobby');

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

exports.getLobby = getLobby;
exports.createLobby = createLobby;