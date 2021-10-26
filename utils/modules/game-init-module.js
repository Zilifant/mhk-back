// game initiation module
// creates new game

const sample = require('lodash.sample');

const g = require('./game-module')();

const {
  nullify, shuffle, shuffleAndBatch, makeGhostCard, OPT_ROLES, HIDE_FROM, HUNTER, KILLER, GHOST, ACCOMPLICE, WITNESS, EVIDENCE_DECK, MEANS_DECK, GHOST_CARD_INFO,
} = require('../utils');
const { timer } = require('../timer');

function makeGame() {

  const game = {
    lobbyId: this.id,
    settings: this.gameSettings,
    players: this.usersReady(),
    confirmedClues: [],
    rolesRef: [],
    spectators: [],
    blueTeam: [],
    redTeam: [],
    nonGhosts: [],
    ghost: null,
    hunters: [],
    killer: null,
    accomplice: null,
    witness: null,
    cluesDeck: [],
    keyEvidence: [],
    result: null,
    isResolvingAccusal: false,
    currentStage: g.STAGES[0],
    advanceStage(stageId, io) {
      if (stageId) {
        this.currentStage = g.STAGES.find(s => s.id === stageId);
      } else {
        const stageNum = g.STAGES.indexOf(this.currentStage);
        this.currentStage = g.STAGES[stageNum+1];
      };
      if (this.settings.timer.on) handleTimer(this, io);
    },
    viewAs(role) {
      const g = nullify(this, HIDE_FROM[role]);
      g.viewingAs = role;
      return g;
    },
    blueCanAccuse() {
      return this.blueTeam.some(player => !!player.canAccuse);
    },
    timer,
    currentTimer: null,
    timerIsRunning: false,
  };

  initRoles(game);
  createHands(game);
  createGhostCardDisplay(game);

  this.game = game;
  this.gameOn = true;
};

function handleTimer(game, io) {
  if (game.currentStage.timed) {
    game.timer.run(game.lobbyId, game.settings.timer.duration, io)
    // runTimer(game, io);
    game.timerIsRunning = true;
  };
  if (!game.currentStage.timed && game.timerIsRunning === true) {
    game.timer.clear(game.lobbyId, io);
    // clearTimer(game, io);
    game.timerIsRunning = false;
  };
};

function initRoles(game) {
  selectGhost(game);
  assignNGRoles(game);
  createRolesRef(game);
  createTeamsRef(game);
};

function selectGhost(game) {
  const ghostId = game.settings.assignedToGhost
  !!ghostId ? assignGhost(game, ghostId) : randomGhost(game);
}

function assignGhost(game, ghostId) {
  return game.ghost = game.players.find(player => player.id === ghostId);
};

function randomGhost(game) {
  return game.ghost = sample(game.players);
};

function initNGRoles(game) {
  game.nonGhosts = getNonGhosts(game);
  const roles = [KILLER];
  if (game.settings.hasWitness) roles.push(WITNESS);
  if (game.settings.hasAccomplice) roles.push(ACCOMPLICE);
  const numHunters = game.nonGhosts.length - roles.length;
  for (let i = 0; i < numHunters ; i++) roles.push(HUNTER);
  return roles;
};

function getNonGhosts(game) {
  return game.players.filter(player => player.id !== game.ghost.id);
};

function assignNGRoles(game) {
  const shuffledRoles = shuffle(initNGRoles(game));
  game.nonGhosts.forEach((nG, index) => {
    nG.canAccuse = true;
    if (shuffledRoles[index] === KILLER) return game.killer = nG;
    if (shuffledRoles[index] === WITNESS) return game.witness = nG;
    if (shuffledRoles[index] === ACCOMPLICE) return game.accomplice = nG;
    return game.hunters.push(nG);
  });
};

function createRolesRef(game) {
  game.rolesRef = [
    {role: GHOST, user: game.ghost},
    {role: KILLER, user: game.killer},
  ];
  game.hunters.forEach(h => game.rolesRef.push({role: HUNTER, user: h}));
  OPT_ROLES.forEach(role => {
    if (!!game[role]) game.rolesRef.push({role: role, user: game[role]});
  });
};

function createTeamsRef(game) {
  game.blueTeam = [game.ghost, game.witness, game.hunters].flat().filter(x => !!x);
  game.redTeam = [game.killer, game.accomplice].filter(x => !!x);
};

function createHands(game) {
  const meansCards = shuffleAndBatch(MEANS_DECK, 4),
        evidenceCards = shuffleAndBatch(EVIDENCE_DECK, 4);
  game.nonGhosts.forEach(nG => {
    nG.hand.means = meansCards[game.nonGhosts.indexOf(nG)];
    nG.hand.evidence = evidenceCards[game.nonGhosts.indexOf(nG)];
  });
};

function createGhostCardDisplay(game) {
  const GHOST_CARDS = GHOST_CARD_INFO.map(item => makeGhostCard(item));
  const CAUSES_DECK = GHOST_CARDS.filter(card => card.type === 'cause');
  const LOCS_DECK   = GHOST_CARDS.filter(card => card.type === 'location');
  const CLUES_DECK  = GHOST_CARDS.filter(card => card.type === 'clue');

  const causeCard = sample(CAUSES_DECK);
  causeCard.isDisplayed = true;

  const locationCard = sample(LOCS_DECK);
  locationCard.isDisplayed = true;

  game.cluesDeck = shuffle(CLUES_DECK).filter((card, index) => index < 6);

  game.cluesDeck.forEach((card, index) => {
    if (index < 4) card.isDisplayed = true;
  });

  game.cluesDeck.unshift(causeCard, locationCard);
};

exports.makeGame = makeGame;