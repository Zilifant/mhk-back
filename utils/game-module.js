// game utilities module

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

  return {
    STAGES,
    advanceToNextStage,
    advanceOnKeyEvChosen,
    confirmClueChoice,
  };

};