
const sample = require('lodash.sample');
const {
  GAME_STAGES, ROLES,
  HUNTER, KILLER, GHOST, ACCOMPLICE, WITNESS,
  EVIDENCE_DECK, GHOST_CARD_INFO
} = require('./utils/constants');
const {
  omit, shuffle, shuffleAndBatch, makeGhostCard
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

function makeGame(settings) {

  const game = {
    settings: settings,
    players: this.usersReady(),
    confirmedClues: [],
    timerSettings: `placeholder`,
    accomplice: null,
    witness: null,
    ghost: null,
    nonGhosts: [],
    killer: null,
    hunters: [],
    causeCard: null,
    cause: null,
    locationCard: null,
    location: null,
    cluesDeck: [],
    keyEvidence: [],
    currentStage: GAME_STAGES[0],
    advanceStage() {
      const stageNum = GAME_STAGES.indexOf(this.currentStage);
      this.currentStage = GAME_STAGES[stageNum+1];
    },
    viewAsHunter() {
      const g = omit(this, ['keyEvidence', 'hunters', 'killer'])
      g.viewingAs = HUNTER;
      return g;
    }
  };

  this.gameSettings.assignedToGhost
    ? rolesAssignedGhost(game, this.gameSettings.assignedToGhost)
    : rolesRandomGhost(game);

  createHands(game);
  createGhostCardsDisplay(game);

  this.game = game;
  this.gameOn = true;
};

function createHands(game) {
  const hands = shuffleAndBatch(EVIDENCE_DECK, 3);
  game.nonGhosts.forEach(nG => {
    nG.hand = hands[game.nonGhosts.indexOf(nG)];
    nG.accusalSpent = false;
  });
};

function createGhostCardsDisplay(game) {
  const GHOST_CARDS = GHOST_CARD_INFO.map(item => makeGhostCard(item));
  const CAUSES_DECK = GHOST_CARDS.filter(card => card.type === 'cause');
  const LOCS_DECK   = GHOST_CARDS.filter(card => card.type === 'location');
  const CLUES_DECK  = GHOST_CARDS.filter(card => card.type === 'clue');

  game.causeCard = sample(CAUSES_DECK);
  game.causeCard.isDisplayed = true;

  game.locationCard = sample(LOCS_DECK);
  game.locationCard.isDisplayed = true;

  game.cluesDeck = shuffle(CLUES_DECK).filter((card, index) => index < 6);

  game.cluesDeck.forEach((card, index) => {
    if (index < 4) card.isDisplayed = true;
  });

  game.cluesDeck.unshift(game.causeCard, game.locationCard)
};

function rolesAssignedGhost(game, ghostId) {
  game.ghost = game.players.find(player => player.id === ghostId);
  game.nonGhosts = game.players.filter(player => player.id !== ghostId);

  const shuffledRoles = shuffle(ROLES);
  game.nonGhosts.forEach((nG, index) => {
    if (shuffledRoles[index] === KILLER) return game.killer = nG;
    return game.hunters.push(nG);
  });
};

function rolesRandomGhost(game) {
  const allRoles = ROLES.concat(GHOST);
  const shuffledRoles = shuffle(allRoles)
  game.players.forEach((player, index) => {
    if (shuffledRoles[index] === KILLER) return game.killer = player;
    if (shuffledRoles[index] === GHOST) return game.ghost = player;
    return game.hunters.push(player);
  })
  game.nonGhosts = game.hunters.concat(game.killer);
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
