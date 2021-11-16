
const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { makeUser } = require('../utils/modules/user-init-module');
const { getLobbyById, getUserById, cookieSettings } = require('../utils/utils');

function parseCookies(c) {
  const cArr = c.split(';');
  const userData = cArr.find(c => c.trim().substr(0,8) === 'userData').split('=')[1];
  if (!userData) return console.log(`parseCookies Error; c = ${c}`);
  return {
    userId: userData.split('--')[0],
    lobbyId: userData.split('--')[1]
  };
};

const checkForCookie = async (req, res, next) => {

  const cookies = req.get('Cookie');

  if (!cookies) {
    return res.status(200).json({ user: null });
  };

  let user;
  if (cookies) {
    const data = parseCookies(cookies);
    try {
      user = await getUserById({
        userId: data.userId,
        lobbyId: data.lobbyId
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
  const isStreamer = req.body.isStreamer;

  const newUser = makeUser({
    id: userId,
    myLobby: lobby.id,
    isStreamer
  });

  lobby.users.push(newUser);

  res
  .status(201)
  .cookie('userData', `${userId}--${lobby.id}`, cookieSettings)
  .json({
    user: newUser,
    lobby: lobby
  });
};

exports.checkForCookie = checkForCookie;
exports.addUserToLobby = addUserToLobby;
