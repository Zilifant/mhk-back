
const sample = require('lodash.sample');
const {
  GAME_STAGES, OPT_ROLES, HIDE_FROM,
  HUNTER, KILLER, GHOST, ACCOMPLICE, WITNESS,
  EVIDENCE_DECK, MEANS_DECK, GHOST_CARD_INFO
} = require('./utils/constants');
const {
  nullify,
  shuffle,
  shuffleAndBatch,
  makeGhostCard,
} = require('./utils/utils');
const { announce } = require('./utils/chat-utils');

const makeUser = ({ id, myLobby, lobbyCreator = false }) => {
  const userName = id.slice(0,-5);
  return {
    id,
    socketId: null,
    userName: userName,
    myLobby,
    isOnline: false,
    isReady: false,
    isLeader: lobbyCreator,
    isAssignedToGhost: false,
    color: null,
    accusalSpent: null,
    canAccuse: false,
    hand: {evidence: null, means: null},
  };
};

const makeLobby = (creator) => {
  return {
    id: creator.myLobby,
    creatorId: creator.id,
    leader: creator.id,
    users: [creator],
    gameSettings: {
      assignedToGhost: null,
      hasWitness: false,
      hasAccomplice: false,
      hasTimer: false,
      timerSettings: {
        minutes: 3,
        soft: true,
      }
    },
    numOnline() {
      return this.users.filter(u => u.isOnline === true).length;
    },
    numReady() {
      return this.users.filter(u => u.isReady === true).length;
    },
    usersOnline() {
      return this.users.filter(u => u.isOnline === true);
    },
    usersReady() {
      return this.users.filter(u => u.isReady === true);
    },
    canStart() {
      return (this.numReady() >= 3) && (this.numReady() === this.numOnline());
    },
    makeGame,
    gameOn: false,
    game: null,
    chat: [announce.join(creator.id)],
    createdAt: new Date().toLocaleTimeString()
  };
};

function makeGame() {

  const game = {
    settings: this.gameSettings,
    players: this.usersReady(),
    confirmedClues: [],
    timerSettings: `placeholder`,
    rolesRef: [],
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
    currentStage: GAME_STAGES[0],
    advanceStage(stageId) {
      if (stageId) {
        this.currentStage = GAME_STAGES.find(s => s.id === stageId);
      } else {
        const stageNum = GAME_STAGES.indexOf(this.currentStage);
        this.currentStage = GAME_STAGES[stageNum+1];
      };
    },
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

  this.game = game;
  this.gameOn = true;
};

function initRoles(game) {
  selectGhost(game);
  assignNGRoles(game, initNGRoles);
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

function assignNGRoles(game, initNGRoles) {
  const shuffledRoles = shuffle(initNGRoles(game));
  game.nonGhosts.forEach((nG, index) => {
    nG.accusalSpent = false;
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
    console.log(game[role]);
    if (!!game[role]) game.rolesRef.push({role: role, user: game[role]});
  });
};

function createTeamsRef(game) {
  game.blueTeam = [game.ghost, game.witness, game.hunters].flat().filter(x => !!x);
  game.redTeam = [game.killer, game.accomplice].filter(x => !!x);
};

function createHands(game) {
  const evidenceCards = shuffleAndBatch(EVIDENCE_DECK, 2),
        meansCards = shuffleAndBatch(MEANS_DECK, 2);
  game.nonGhosts.forEach(nG => {
    nG.hand.evidence = evidenceCards[game.nonGhosts.indexOf(nG)];
    nG.hand.means = meansCards[game.nonGhosts.indexOf(nG)];
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

  game.cluesDeck.unshift(causeCard, locationCard)
};

exports.makeUser = makeUser;
exports.makeLobby = makeLobby;