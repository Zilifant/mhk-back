// timer

const { getLobbyById } = require('../utils/utils');

const timers = {};

function run(lobbyId, duration, io) {

  const lobby = getLobbyById(lobbyId);
  if (!lobby) return;

  console.log(`${duration} min timer started in ${lobbyId}`);

  let timer = duration * 6;

  io.in(lobbyId).emit('timerStarted');

  timers[lobbyId] = setInterval(() => {
    if (!io) return console.log('Timer Error: no io');

    if (--timer <= 0) {
      io.in(lobbyId).emit('timeUp', timer);
      clearInterval(timers[lobbyId]);
      lobby.game.timerIsRunning = false;
      return;
    }

    io.in(lobbyId).emit('tenSec', timer);

  }, 10000);
};

function clear(lobbyId, io) {
  clearInterval(timers[lobbyId]);
  io.in(lobbyId).emit('clear');
  console.log(`timer cleared in ${lobbyId}`);
}

const timer = {
  run,
  clear
}

exports.timer = timer;

// function run({lobbyId, duration, io}) {
//   console.log(`${duration} minute timer started`);
//   let timer = duration * 60,
//       minutes,
//       seconds;
//   timers[lobbyId] = setInterval(() => {
//       minutes = parseInt(timer / 60, 10);
//       seconds = parseInt(timer % 60, 10);

//       minutes = minutes < 10 ? '0' + minutes : minutes;
//       seconds = seconds < 10 ? '0' + seconds : seconds;
//       const string = minutes + ':' + seconds;

//       if (!io) return console.log('Timer Error: no io');

//       if (--timer < 0) {
//         io.in(lobbyId).emit('tick', string);
//         clearInterval(timers[lobbyId])
//       }
//       io.in(lobbyId).emit('tick', string);
//       console.log(string);

//   }, 1000);
// };