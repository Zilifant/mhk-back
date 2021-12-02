// User Control

const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { makeUser } = require('../utils/modules/user-init-module');
const { getLobbyById, getUserById, cookieSettings } = require('../utils/utils');

// TO DO correct status codes and improve error handling.
const checkForCookie = async (req, res, next) => {

  const cookies = req.get('Cookie');

  if (!cookies) {
    return res.status(200).json({ user: null });
  };

  let user;
  if (cookies) {
    const data = parseUserDataCookie(cookies);
    try {
      user = await getUserById({
        userId: data.userId,
        lobbyId: data.lobbyId
      });
    } catch (err) {
      console.log(err);
      const error = new HttpError('Could not find lobby!', 500);
      return next(error);
    };
  };
  res.status(200).json({ user: user });
};

function parseUserDataCookie(c) {
  // Convert string to array of individual cookies.
  const cookieArr = c.split(';');
  // Find 'userData' cookie.
  const userDataCookie = cookieArr.find(c => {
    return c.trim().substr(0,8) === 'userData';
  });
  // Extract data or throw error.
  // TODO: add proper error handling.
  if (!userDataCookie) return console.log(`parseCookies Error; c = ${c}`);
  const userData = userDataCookie.split('=')[1];
  // Convert userData ('userId--lobbyId') to object.
  return {
    userId: userData.split('--')[0],
    lobbyId: userData.split('--')[1]
  };
};

// Called when a visitor attempts to join an existing lobby. Each user is
// associated with exactly one lobby; this function handles both creating the
// user and adding them to the lobby.
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

  // Append random numbers to visitor's chosen user name
  const userId = uniqUserID(req.body.userName);
  // Set 'streaming mode' option
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
