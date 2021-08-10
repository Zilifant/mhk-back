
const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { makeUser } = require('../data');
const { getLobbyById, getUserById } = require('../utils/utils');

const checkForSess = async (req, res, next) => {

  if (!req.session.userIdCookie) {
    const error = new HttpError('No active session found.', 404);
    return next(error);
  };

  let user;
  if (req.session.userIdCookie) {
    try {
      user = await getUserById({
        lobbyId: req.session.userLobbyCookie,
        userId: req.session.userIdCookie
      });
    } catch (err) {
      console.log(err);
      const error = new HttpError('Could not find lobby.', 500);
      return next(error);
    };
  };
  res.status(200).json({ user: user });
};

const addUserToLobby = async (req, res, next) => {
  console.log('addUserToLobby');

  let lobby;
  try {
    lobby = await getLobbyById(req.body.lobbyURL);
  } catch (err) {
    console.log(err);
    const error = new HttpError('Could not find lobby.', 500);
    return next(error);
  };

  if (!lobby) {
    const error = new HttpError('No lobby with that name.', 404);
    return next(error);
  };

  const userId = uniqUserID(req.body.userName);

  const newUser = makeUser({
    id: userId,
    myLobby: lobby.id
  });

  lobby.users.push(newUser);

  req.session.userIdCookie = userId;
  req.session.userLobbyCookie = lobby.id;
  console.log(req.session);

  // req.cookieSession.userIdCookie = userId;
  // req.cookieSession.userLobbyCookie = lobby.id;
  // console.log(req.cookieSession);

  res.status(201).json({
    user: newUser,
    lobby: lobby
  });
};

exports.checkForSess = checkForSess;
exports.addUserToLobby = addUserToLobby;