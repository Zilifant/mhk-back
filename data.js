
const sample = require('lodash.sample');
const {
  GAME_STAGES, OPT_ROLES, HIDE_FROM,
  HUNTER, KILLER, GHOST, ACCOMPLICE, WITNESS,
  EVIDENCE_DECK, GHOST_CARD_INFO
} = require('./utils/constants');
const {
  nullify, shuffle, shuffleAndBatch, makeGhostCard
} = require('./utils/utils');

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
    hand: null,
  };
};

const makeLobby = (creator) => {
  return {
    id: creator.myLobby,
    creatorId: creator.id,
    leader: creator.id,
    users: [creator],
    assignedToGhost: null,
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
    chat: [],
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
    currentStage: GAME_STAGES[0],
    advanceStage() {
      const stageNum = GAME_STAGES.indexOf(this.currentStage);
      this.currentStage = GAME_STAGES[stageNum+1];
    },
    viewAs(role) {
      const g = nullify(this, HIDE_FROM[role]);
      g.viewingAs = role;
      return g;
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
  const hands = shuffleAndBatch(EVIDENCE_DECK, 3);
  game.nonGhosts.forEach(nG => {
    nG.hand = hands[game.nonGhosts.indexOf(nG)];
    nG.accusalSpent = false;
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

// if (this.id === 'z') {
//   game.players.forEach(player => {
//     if (player.id === 'Kali-0000') return game.killer = player;
//     if (player.id === 'Gerrard-0000') return game.ghost = player;
//     return game.hunters.push(player);
//   });
//   game.nonGhosts = game.hunters.concat(game.killer);
// } else if (this.gameSettings.assignedToGhost) {
//   game.ghost = game.players.find(player => player.id === this.gameSettings.assignedToGhost);
//   game.nonGhosts = game.players.filter(player => player.id !== this.gameSettings.assignedToGhost);

//   const shuffledRoles = shuffle(ROLES);
//   game.nonGhosts.forEach((nG, index) => {
//     if (shuffledRoles[index] === KILLER) return game.killer = nG;
//     return game.hunters.push(nG);
//   });
// } else {
//   const allRoles = ROLES.concat(GHOST);
//   const shuffledRoles = shuffle(allRoles)
//   game.players.forEach((player, index) => {
//     if (shuffledRoles[index] === KILLER) return game.killer = player;
//     if (shuffledRoles[index] === GHOST) return game.ghost = player;
//     return game.hunters.push(player);
//   })
//   game.nonGhosts = game.hunters.concat(game.killer);
// }

// const silas = {
//   id: 'Silas-0000',
//   userName: 'Silas',
//   myLobby: 'z',
//   isOnline: true,
//   isLeader: true,
//   isReady: true,
//   color: null,
//   role: null,
//   socketId: null
// };

// const sara = {
//   id: 'Sara-0000',
//   userName: 'Sara',
//   myLobby: 'z',
//   isOnline: true,
//   isLeader: false,
//   isReady: true,
//   color: null,
//   role: null,
//   socketId: null
// };

// LOBBIES[silas.myLobby] = makeLobby(silas);
// LOBBIES[sara.myLobby].users.push(sara);
// LOBBIES[silas.myLobby].makeGame();
// console.log(LOBBIES[silas.myLobby].game.currentStage);

// const { announce } = require('./utils/chat-utils');
// const x = announce.accusation({accuser: 'Nina', accusee: 'Hel', evidence: ['gun','towel']});
// const x = announce.userMessage('Harold-9382', 'Hey, how are you??')
// console.log(x);

// function rolesAssignedGhost(game, ghostId) {
//   game.ghost = game.players.find(player => player.id === ghostId);
//   game.nonGhosts = game.players.filter(player => player.id !== ghostId);

//   const shuffledRoles = shuffle(ROLES);
//   game.nonGhosts.forEach((nG, index) => {
//     if (shuffledRoles[index] === KILLER) return game.killer = nG;
//     return game.hunters.push(nG);
//   });
// };

// function rolesRandomGhost(game) {
//   const allRoles = ROLES.concat(GHOST);
//   const shuffledRoles = shuffle(allRoles)
//   game.players.forEach((player, index) => {
//     if (shuffledRoles[index] === KILLER) return game.killer = player;
//     if (shuffledRoles[index] === GHOST) return game.ghost = player;
//     return game.hunters.push(player);
//   })
//   game.nonGhosts = game.hunters.concat(game.killer);
// };