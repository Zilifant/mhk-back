// Game Utilities Module
// Provides functions and objects used during game.

const intersection = require('lodash.intersection');
const { TIMERS, msg, getUserById } = require('../utils');

module.exports = () => {

  // Game Stages //

  // Stages are not analagous to game rounds.
  // Stages are listed in the order they (generally) occur in game; Stage
  // indexes are used by the game logic.
  // 'Liminal' stages contain (generally brief) procedures carried out between
  // rounds.
  // TO DO: update naming to be more specific to this game rather than general
  // as in a framework.
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

  // Stage Methods //

  // Called at the start of certain rounds.
  function newClueCard(game, i) {
    game.cluesDeck[i].isDisplayed = true;
    game.cluesDeck[i].isNew = true;
    game.cluesDeck[i-1].isNew = false;
  };

  // Called when Ghost chooses a Clue card to be replaced.
  function removeClueCard(game, cardId) {
    game.cluesDeck.find(card => card.id === cardId).isDisplayed = false;
  };

  // Advancing Stages //

  // Called when the leader hits the 'advance stage' button.
  function advanceToNextStage(game, io, data) {
    // Passing `null` tells the method to advance to the next stage in the
    // STAGES array.
    game.advanceStage(null, io);
    // If the stage has an onStart method, call that method.
    if (!!game.currentStage.onStart) game.currentStage.onStart(game, data);
  };

  // Called when the killer confirms their selection of key evidence during the
  // setup stage.
  function advanceOnKeyEvChosen(game, io, keyEv) {
    game.keyEvidence = keyEv;
    game.advanceStage(null, io);
    // This is only called when advancing from setup to round-1, which does not
    // have an onStart method.
  };

  // Choosing Clues //

  // Called when the ghost confirms their selection of an option on a clue card.
  function confirmClueChoice(game, clue) {

    function lockClueCard() {
      // TO DO: Can we just pass the whole card instead of finding it?
      const card = game.cluesDeck.find(c => c.opts.some(o => o.id === clue));
      card.isLocked = true;
    };

    game.confirmedClues.push(clue);
    lockClueCard(clue);
  };

  // Accusations //

  // Called when a player accuses someone of being the killer.
  // Updates data on accuser and returns data formatted for the msg function.
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

  // Called after announceAccusal and a short timeout.
  function resolveAccusal(game, accusalEv, accuser, io) {

    return isAccusalRight() ? resolveRightAccusal() : resolveWrongAccusal();

    // Check if accuser's evidence matches key evidence chosen by killer.
    function isAccusalRight() {
      return intersection(accusalEv, game.keyEvidence).length === 2;
    };

    // Advance to second-murder stage if there is a witness, else resolve a
    // blue team win.
    function resolveRightAccusal() {
      return game.witness
        ? advToSecondMurder(accuser.id)
        : resolveGame(game, 'bluewin', {accuser, killer: game.killer}, io);
    };

    // Advance to second-murder stage (possibly skipping stages).
    function advToSecondMurder() {
      game.advanceStage('second-murder', io);

      const msgData = {
        type: 'advanceTo',
        args: [game.currentStage, accuser.id],
        isInGame: true,
      };

      return ['advanceStage', msg(msgData)];
    };

    // Continue the current round (don't advance the stage), unless the blue
    // team (hunters and witness) are out of accusals, in which case resolve
    // a red team win.
    function resolveWrongAccusal() {
      return game.blueCanAccuse()
        ? continueRound()
        : resolveGame(game, 'redwin', {accuser}, io);
    };

    // No other game logic. Just send UI message.
    function continueRound() {

      const args = [
        [accuser.id, accuser.color.id]
      ];

      const msgData = {
        type: 'accusationWrong',
        args: args,
        isInGame: true,
      };

      return ['wrongAccusation', msg(msgData)];
    };

  };

  // Second Murder //

  function resolveSecondMurder(game, targetId, io) {
    const target = getUserById({lobbyId: game.lobbyId, userId: targetId});

    const args = {
      killer: game.killer,
      witness: game.witness,
      target: target
    };

    return game.witness.id === targetId
      ? resolveGame(game, 'redwinwitnessdead', args, io)
      : resolveGame(game, 'bluewinwitnessalive', args, io);
  };

  // Resolve Game //

  function resolveGame(game, result, args, io) {
    game.advanceStage('game-over', io);

    const msgData = {
      type: 'resolveGame',
      args: [result, args],
      isInGame: true,
    };

    return ['resolveGame', msg(msgData)];
  };

  // Round Timer //

  // Called when stage advances, immediately after stage data has been updated,
  // so currentStage will be the stage just advanced to.
  function handleTimer(game, io) {
    const { timerIsRunning, currentStage } = game;
    if (timerIsRunning) clearTimer(game, io);
    if (currentStage.timed) runTimer(game, io);
  };

  // Timer is a 10 second interval.
  // TO DO: Timers are currently stored in a TIMERS object separate from all
  // lobbies. Refactor to store each Timer inside of the game it belons to.
  function runTimer(game, io) {
    const lobbyId = game.lobbyId,
          duration = game.settings.timer.duration; // minutes

    io.in(lobbyId).emit('timerStarted');
    game.timerIsRunning = true;

    let timer = duration * 6; // minutes * 6 = total 10 second intervals
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

  function clearTimer(game, io) {
    const lobbyId = game.lobbyId;

    io.in(lobbyId).emit('clear');
    game.timerIsRunning = false;

    clearInterval(TIMERS[lobbyId]);
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