// Data

// const { announce } = require('./utils/chat-utils');
const sample = require('lodash.sample');
const {
  ROLES, GAME_STAGES,
  HUNTER, KILLER, GHOST,
  EVIDENCE_DECK, GHOST_CARD_INFO
} = require('./utils/constants');
const { shuffle, shuffleAndBatch, makeGhostCard } = require('./utils/utils');

const lobbies = {};

const makeLobby = (creator) => {
  return {
    id: creator.myLobby,
    creatorId: creator.id,
    leader: creator.id,
    users: [creator],
    assignedToGhost: null,
    numOnline() { return this.users.filter(u => u.isOnline === true).length; },
    numReady() { return this.users.filter(u => u.isReady === true).length; },
    usersOnline() { return this.users.filter(u => u.isOnline === true); },
    usersReady() { return this.users.filter(u => u.isReady === true); },
    canStart() { return (this.numReady() >= 3) && (this.numReady() === this.numOnline()); },
    makeGame,
    gameOn: false,
    game: null,
    chat: [],
    createdAt: new Date().toLocaleTimeString()
  };
};

function makeGame(settings) {

  const GHOST_CARDS = GHOST_CARD_INFO.map(item => makeGhostCard(item));
  const CAUSES_DECK = GHOST_CARDS.filter(card => card.type === 'cause');
  const LOCS_DECK = GHOST_CARDS.filter(card => card.type === 'location');
  const CLUES_DECK = GHOST_CARDS.filter(card => card.type === 'clue');

  const game = {
    settings: settings,
    players: this.usersReady(),
    keyEvidence: [],
    confirmedClues: [],
    currentStage: GAME_STAGES[0],
    advanceStage() {
      const stageNum = GAME_STAGES.indexOf(this.currentStage);
      this.currentStage = GAME_STAGES[stageNum+1];
    }
  };

  if (this.id === 'z') {
    game.players.forEach(player => {
      if (player.id === 'Ali-0000') player.role = KILLER;
      if (player.id === 'Ainsley-0000') player.role = GHOST;
      if (player.id === 'Amber-0000') player.role = HUNTER;
      if (player.id === 'Silas-0000') player.role = HUNTER;
      if (player.id === 'Sara-0000') player.role = HUNTER;
    });
  } else {
    const shuffledRoles = shuffle(ROLES);
    game.players.forEach(player => {
      player.role = shuffledRoles[game.players.indexOf(player)];
    });
  };

  game.ghost = game.players.find(player => player.role === GHOST);
  game.killer = game.players.find(player => player.role === KILLER);
  game.hunters = game.players.filter(player => player.role === HUNTER);
  game.nonGhosts = game.hunters.concat(game.killer)

  const hands = shuffleAndBatch(EVIDENCE_DECK, 3);

  game.nonGhosts.forEach(nG => {
    nG.hand = hands[game.nonGhosts.indexOf(nG)];
    nG.accusalSpent = false;
    // if (nG.role === KILLER) nG.keyEvidence = [];
  });

  game.causeCard = sample(CAUSES_DECK);
  // game.causeCard = sample(game.ghostDecks.causes);
  game.causeCard.isDisplayed = true;
  game.cause = null;

  game.locationCard = sample(LOCS_DECK);
  // game.locationCard = sample(game.ghostDecks.locs);
  game.locationCard.isDisplayed = true;
  game.location = null;

  game.cluesDeck = shuffle(CLUES_DECK).filter((clue, index) => index < 6);
  // game.cluesDeck = shuffle(game.ghostDecks.clues).filter((clue, index) => index < 6);

  game.cluesDeck.forEach((clue, index) => {
    if (index < 4) clue.isDisplayed = true;
  });

  game.ghostCards = game.cluesDeck
  game.ghostCards.unshift(game.causeCard, game.locationCard)

  this.game = game;
  this.gameOn = true;
};

const makeUser = ({ id, myLobby, lobbyCreator = false }) => {
  const userName = id.slice(0,-5);
  return {
    id,
    userName: userName,
    myLobby,
    isOnline: false,
    isLeader: lobbyCreator,
    isReady: false,
    isAssignedToGhost: false,
    color: null,
    role: null,
    socketId: null,
  };
};

const getLobbyById = id => {
  if (!lobbies[id]) {
    console.log(`Lobby: ${id} no longer exists`);
    return;
  };
  return lobbies[id];
};

const getUserById = ({lobbyId, userId}) => {
  if (!lobbies[lobbyId]) {
    console.log(`Lobby: ${lobbyId} no longer exists`);
    return;
  };
  return lobbies[lobbyId].users.find(user => user.id === userId);
};

const silas = {
  id: 'Silas-0000',
  userName: 'Silas',
  myLobby: 'z',
  isOnline: true,
  isLeader: true,
  isReady: true,
  color: null,
  role: null,
  socketId: null
};

const sara = {
  id: 'Sara-0000',
  userName: 'Sara',
  myLobby: 'z',
  isOnline: true,
  isLeader: false,
  isReady: true,
  color: null,
  role: null,
  socketId: null
};

lobbies[silas.myLobby] = makeLobby(silas);
lobbies[sara.myLobby].users.push(sara);
// lobbies[silas.myLobby].makeGame();
// console.log(lobbies[silas.myLobby].game.currentStage);

// const x = announce.accusation({accuser: 'Nina', accusee: 'Hel', evidence: ['gun','towel']});
// const x = announce.userMessage('Harold-9382', 'Hey, how are you??')
// console.log(x);

exports.lobbies = lobbies;
exports.makeLobby = makeLobby;
exports.makeUser = makeUser;
exports.getLobbyById = getLobbyById;
exports.getUserById = getUserById;