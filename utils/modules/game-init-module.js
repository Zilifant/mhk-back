// Game Initiation Module
// Provides functions used to create a new game.

const sample = require('lodash.sample');

const g = require('./game-module')();

const {
  nullify, shuffle, shuffleAndBatch, makeGhostCard, OPT_ROLES, HIDE_FROM, HUNTER, KILLER, GHOST, ACCOMPLICE, WITNESS, EVIDENCE_DECK, MEANS_DECK, GHOST_CARD_INFO,
} = require('../utils');

// This is added to lobby as a method.
function makeGame() {

  // TO DO: refactor/remove redundant properties.
  const game = {
    lobbyId: this.id, // lobby.id
    settings: this.gameSettings, // lobby.gameSettings
    players: this.usersReady(), // lobby.usersReady()
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
    timerIsRunning: false,
    currentStage: g.STAGES[0],

    advanceStage(stageId, io) {
      if (stageId) {
        // Advance directly to given stage.
        this.currentStage = g.STAGES.find(s => s.id === stageId);
      } else {
        // Advance to the next stage in the STAGES array.
        const stageNum = g.STAGES.indexOf(this.currentStage);
        this.currentStage = g.STAGES[stageNum+1];
      };

      if (this.settings.timer.on) g.handleTimer(this, io);
    },

    // Redacts some properties based on given role.
    viewAs(role) {
      const g = nullify(this, HIDE_FROM[role]);
      g.viewingAs = role;
      return g;
    },

    blueCanAccuse() {
      return this.blueTeam.some(player => !!player.canAccuse);
    }
  };

  initRoles(game);
  createHands(game);
  createGhostCardDisplay(game);

  this.game = game; // lobby.game
  this.gameOn = true; // lobby.gameOn
};

// Player Roles //

function initRoles(game) {
  selectGhost(game);
  assignNonGhostRoles(game);
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

// Return an array of roles needed (including multiple Hunters) based on game
// settings and player count.
function initNonGhostRoles(game) {
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

function assignNonGhostRoles(game) {
  const shuffledRoles = shuffle(initNonGhostRoles(game));

  game.nonGhosts.forEach((nG, index) => {
    nG.canAccuse = true; // TO DO: remove semi-related side effect
    if (shuffledRoles[index] === KILLER) return game.killer = nG;
    if (shuffledRoles[index] === WITNESS) return game.witness = nG;
    if (shuffledRoles[index] === ACCOMPLICE) return game.accomplice = nG;
    return game.hunters.push(nG);
  });
};

// Roles Reference Objects //
// Used by other functions that need to know player roles and teams. Not part
// of core game logic.
// Ideally, future refactorings will make these unnecessary.

function createRolesRef(game) {
  // 1 Ghost and 1 Killer are always assigned;
  game.rolesRef = [
    {role: GHOST, user: game.ghost},
    {role: KILLER, user: game.killer},
  ];
  // 1 or more Hunters are always assigned.
  game.hunters.forEach(h => game.rolesRef.push({role: HUNTER, user: h}));
  // 0 or 1 of each optional role (Witness, Accomplice) may be assigned.
  OPT_ROLES.forEach(role => {
    if (!!game[role]) game.rolesRef.push({role: role, user: game[role]});
  });
};

function createTeamsRef(game) {
  game.blueTeam = [game.ghost, game.witness, game.hunters].flat().filter(x => !!x);
  game.redTeam = [game.killer, game.accomplice].filter(x => !!x);
  // Note: this filters out falsy values in case of unused optional roles
};

// Player Hands //

// ShuffleAndBatch returns an array of 'batches'. Batches are given to each
// player based on index (the idx of the batch and of the player);
function createHands(game) {
  const meansCards = shuffleAndBatch(MEANS_DECK, 4),
        evidenceCards = shuffleAndBatch(EVIDENCE_DECK, 4);
  game.nonGhosts.forEach(nG => {
    nG.hand.means = meansCards[game.nonGhosts.indexOf(nG)];
    nG.hand.evidence = evidenceCards[game.nonGhosts.indexOf(nG)];
  });
};

// Ghost Cards //

function createGhostCardDisplay(game) {
  const GHOST_CARDS = GHOST_CARD_INFO.map(item => makeGhostCard(item));

  const CAUSES_DECK = GHOST_CARDS.filter(card => card.type === 'cause');
  const LOCS_DECK   = GHOST_CARDS.filter(card => card.type === 'location');
  const CLUES_DECK  = GHOST_CARDS.filter(card => card.type === 'clue');

  const causeCard = sample(CAUSES_DECK);
  causeCard.isDisplayed = true;

  const locationCard = sample(LOCS_DECK);
  locationCard.isDisplayed = true;

  // Shuffle Clue cards and select the first 6 to start the Clues Deck.
  game.cluesDeck = shuffle(CLUES_DECK).filter((card, index) => index < 6);
  // First 4 Clue cards are displayed; last 2 are hidden.
  game.cluesDeck.forEach((card, index) => {
    if (index < 4) card.isDisplayed = true;
  });
  // Add the Cause and Location cards to the front of the Clues Deck.
  game.cluesDeck.unshift(causeCard, locationCard);
};

exports.makeGame = makeGame;