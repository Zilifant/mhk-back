// // dev

// const { uniqUserID } = require('./uniqUserID');
// const { uniqLobbyID } = require('./uniqLobbyID');
// const { getLobbyById, getRoleById, omit, cookieSettings } = require('./utils');
// const { LOBBIES } = require('./constants');

// module.exports = () => {

//   const { makeLobby, makeUser } = require('../data');

//   function devLobby() {
//     const lobbyId = 'z';
  
//     const newUser = makeUser({
//       id: 'Dagny-0000',
//       myLobby: lobbyId,
//       lobbyCreator: false
//     });

//     const newLobby = makeLobby(newUser);

//     newLobby.leader = null;
  
//     LOBBIES[newLobby.id] = newLobby;

//     const users = ['Felix-0000', 'Hanna-0000', 'Diedre-0000']

//     const addUser = (userId, makeUser) => {
//       const newUser = makeUser({
//         id: userId,
//         myLobby: newLobby.id
//       });
//       lobby.users.push(newUser);
//     }

//     users.forEach(user => addUser(user, makeUser))

//   }

//   return {
//     devLobby
//   }
// }