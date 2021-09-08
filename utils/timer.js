// timer

const timers = {}

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

function run({lobbyId, duration, io}) {
  console.log(`${duration} minute 10-sec timer started`);

  let timer = duration * 6;

  timers[lobbyId] = setInterval(() => {
    if (!io) return console.log('Timer Error: no io');

    if (--timer < 0) {
      io.in(lobbyId).emit('tenSec', timer);
      clearInterval(timers[lobbyId])
    }
    io.in(lobbyId).emit('tenSec', timer);
    console.log(timer);

  }, 10000);
};

function clear(lobbyId, io) {
  clearInterval(timers[lobbyId]);
  io.in(lobbyId).emit('clear');
  console.log('Timer cleared');
}

const timer = {
  running: false,
  current: null,
  run,
  clear
}

exports.timer = timer;