// timer

const timers = {}

function run({lobbyId, duration, io}) {
  console.log(`${duration} minute timer started.`);
  let timer = duration * 5,
      minutes,
      seconds;
  timers[lobbyId] = setInterval(() => {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;
      const string = minutes + ':' + seconds;

      if (!io) return console.log('Timer error: no io');

      if (--timer < 0) {
          io.in(lobbyId).emit('lastTick', string);
          // console.log(string);
          clearInterval(timers[lobbyId])
          // this.clear(t);
      }
      // console.log(string);
      io.in(lobbyId).emit('tick', string);
  }, 1000);
};

function clear(lobbyId, io) {
  console.log(!!io);
  clearInterval(timers[lobbyId]);
  io.in(lobbyId).emit('clear');
}

const timer = {
  running: false,
  current: null,
  run,
  clear
}

exports.timer = timer;