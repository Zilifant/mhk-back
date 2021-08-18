
const HttpError = require('../models/HttpError');
const { uniqUserID } = require('../utils/uniqUserID');
const { makeUser } = require('../data');
const { getLobbyById, getUserById, cookieSettings } = require('../utils/utils');

// const checkForSess = async (req, res, next) => {

//   if (!req.session.userIdCookie) {
//     const error = new HttpError('No active session found.', 404);
//     return next(error);
//   };

//   let user;
//   if (req.session.userIdCookie) {
//     try {
//       user = await getUserById({
//         lobbyId: req.session.userLobbyCookie,
//         userId: req.session.userIdCookie
//       });
//     } catch (err) {
//       console.log(err);
//       const error = new HttpError('Could not find lobby.', 500);
//       return next(error);
//     };
//   };
//   res.status(200).json({ user: user });
// };

function parseCookies(c) {
  const cArr = c.split(';');
  const userData = cArr.find(c => c.trim().substr(0,8) === 'userData').split('=')[1];
  if (!userData) return console.log(`parseCookies Error; c = ${c}`);
  return {
    userId: userData.split('--')[0],
    lobbyId: userData.split('--')[1]
  }
};

const checkForCookie = async (req, res, next) => {

  const cookies = req.get('Cookie');

  if (!cookies) {
    const error = new HttpError('No cookie found.', 404);
    return next(error);
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
  // console.log('addUserToLobby');

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

  res
  .status(201)
  .cookie('userData', `${userId}--${lobby.id}`, cookieSettings)
  .json({
    user: newUser,
    lobby: lobby
  });
};

// exports.checkForSess = checkForSess;
exports.checkForCookie = checkForCookie;
exports.addUserToLobby = addUserToLobby;

// .setHeader('Set-Cookie',`userData=${userId}--${lobby.id}`)