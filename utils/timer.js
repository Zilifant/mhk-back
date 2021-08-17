// timer

function setTimer(duration, display) {
  let timer = duration,
      minutes,
      seconds;
  const timeInterval = setInterval(() => {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? '0' + minutes : minutes;
      seconds = seconds < 10 ? '0' + seconds : seconds;

      if (--timer < 0) {
          console.log(minutes + ':' + seconds + ' ' + 'time\'s up');
          clearInterval(timeInterval);
      } else {
        if (!display) console.log(minutes + ':' + seconds);
      }
  }, 1000);
};

function timer(round, duration) {
  return {
    id: round,
    duration: duration,
    setTimer
  };
}

exports.timer = timer;
exports.setTimer = setTimer;