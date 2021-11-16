// Game Utilities Module
// Provides functions used during game.

const intersection = require('lodash.intersection');
const { TIMERS, msg } = require('../utils');

module.exports = () => {

  function newClueCard(game, i) {
    game.cluesDeck[i].isDisplayed = true;
    game.cluesDeck[i].isNew = true;
    game.cluesDeck[i-1].isNew = false;
  };

  function removeClueCard(game, cardId) {
    game.cluesDeck.find(card => card.id === cardId).isDisplayed = false;
  };

  const STAGES = [
    {
      type: 'setup',
      timed: false,
      id: 'setup',
      display: 'Setup',
    },
    {
      type: 'round',
      timed: true,
      id: 'round-1',
      roundNum: 1,
      display: 'Round 1',
    },
    {
      type: 'liminal',
      timed: false,
      id: 'round-2-start',
      roundNum: 2,
      display: 'Round 2',
      onStart: (game) => newClueCard(game, 6),
    },
    {
      type: 'round',
      timed: true,
      id: 'round-2',
      roundNum: 2,
      display: 'Round 2',
      onStart: (game, cardId) => removeClueCard(game, cardId),
    },
    {
      type: 'liminal',
      timed: false,
      id: 'round-3-start',
      roundNum: 3,
      display: 'Round 3',
      onStart: (game) => newClueCard(game, 7),
    },
    {
      type: 'round',
      timed: true,
      id: 'round-3',
      roundNum: 3,
      display: 'Round 3',
      onStart: (game, cardId) => removeClueCard(game, cardId),
    },
    {
      type: 'special',
      timed: false,
      id: 'second-murder',
      display: 'Second Murder'
    },
    {
      type: 'postgame',
      timed: false,
      id: 'game-over',
      display: 'Game Over',
    }
  ];

  function advanceToNextStage(game, io, data) {
    game.advanceStage(null, io);
    if (!!game.currentStage.onStart) game.currentStage.onStart(game, data);
  };

  function advanceOnKeyEvChosen(game, io, keyEv) {
    game.keyEvidence = keyEv;
    game.advanceStage(null, io);
  };

  function confirmClueChoice(game, clue) {

    function lockClueCard() {
      const card = game.cluesDeck.find(c => c.opts.some(o => o.id === clue));
      card.isLocked = true;
    };

    game.confirmedClues.push(clue);
    lockClueCard(clue);
  };

  // Accusation

  function announceAccusal({ lobby, accuser, accused, accusalEv }) {

    lobby.game.isResolvingAccusal = true;

    accuser.accusalSpent = true;
    accuser.canAccuse = false;

    return {
      type: 'accusation',
      args: [{
        accuser: [accuser.id, accuser.color.id],
        accusee: [accused.id, accused.color.id],
        evidence: accusalEv
      }],
      isInGame: true,
    };

  };

  function resolveAccusal(game, accusalEv, accuser, io) {

    return isAccusalRight() ? resolveRightAccusal() : resolveWrongAccusal();

    function isAccusalRight() {
      return intersection(accusalEv, game.keyEvidence).length === 2;
    };

    function resolveRightAccusal() {
      return game.witness
        ? advToSecondMurder(accuser.id)
        : resolveGame(game, 'bluewin', {accuser, killer: game.killer}, io);
    };

    function advToSecondMurder() {
      game.advanceStage('second-murder', io);

      const msgData = {
        type: 'advanceTo',
        args: [game.currentStage, accuser.id],
        isInGame: true,
      };

      return ['advanceStage', msg(msgData)];
    };

    function resolveWrongAccusal() {
      return game.blueCanAccuse()
        ? continueRound()
        : resolveGame(game, 'redwin', {accuser}, io);
    };

    function continueRound() {
      const args = [
        [accuser.id, accuser.color.id]
      ];

      const msgData = {
        type: 'accusationWrong',
        args,
        isInGame: true,
      };

      return ['wrongAccusation', msg(msgData)];
    };

  };

  function resolveSecondMurder(game, targetId, io) {
    return game.witness.id === targetId
      ? resolveGame(game, 'redwinwitnessdead', {killer: game.killer}, io)
      : resolveGame(game, 'bluewinwitnessalive', {target: game.witness}, io);
  };

  function resolveGame(game, result, args, io) {
    game.advanceStage('game-over', io);

    const msgData = {
      type: 'resolveGame',
      args: [result, args],
      isInGame: true,
    };

    return ['resolveGame', msg(msgData)];
  };

  // Timer

  function handleTimer(game, io) {
    const { timerIsRunning, currentStage } = game;
    if (timerIsRunning) clearTimer(game, io);
    if (currentStage.timed) runTimer(game, io);
  };

  function clearTimer(game, io) {
    const lobbyId = game.lobbyId;

    io.in(lobbyId).emit('clear');
    game.timerIsRunning = false;

    clearInterval(TIMERS[lobbyId]);
  };

  function runTimer(game, io) {
    const lobbyId = game.lobbyId,
          duration = game.settings.timer.duration;

    console.log(`${duration} minute timer started in ${lobbyId}`);
    io.in(lobbyId).emit('timerStarted');
    game.timerIsRunning = true;

    let timer = duration * 6;
    TIMERS[lobbyId] = setInterval(() => {
      if (!io) return console.log(`ERR! runTimer: io = ${io}`);

      if (--timer <= 0) {
        io.in(lobbyId).emit('timeUp', timer);
        game.timerIsRunning = false;

        clearInterval(TIMERS[lobbyId]);
        return;
      };

      io.in(lobbyId).emit('tenSec', timer);

    }, 10000);
  };

  return {
    STAGES,
    advanceToNextStage,
    advanceOnKeyEvChosen,
    confirmClueChoice,
    announceAccusal,
    resolveAccusal,
    resolveSecondMurder,
    resolveGame,
    handleTimer,
    clearTimer
  };

};