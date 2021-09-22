
const sample = require('lodash.sample');

const { timer } = require('./utils/timer');
const l = require('./utils/lobby-module')();

const {
  GAME_STAGES, OPT_ROLES, HIDE_FROM,
  HUNTER, KILLER, GHOST, ACCOMPLICE, WITNESS,
  EVIDENCE_DECK, MEANS_DECK, GHOST_CARD_INFO, COLORS,
  MIN_PLAYER_COUNT, MIN_PLAYER_COUNT_FOR_ADV_ROLES
} = require('./utils/constants');

const {
  nullify,
  shuffle,
  shuffleAndBatch,
  makeGhostCard,
} = require('./utils/utils');

const makeUser = ({ id, myLobby, isStreamer, lobbyCreator = false }) => {
  const userName = id.slice(0,-5);
  return {
    id,
    socketId: null,
    userName: userName,
    myLobby,
    isOnline: false,
    isReady: false,
    isLeader: lobbyCreator,
    isStreamer,
    isAssignedToGhost: false,
    connectionTime: null,
    color: null,
    canAccuse: false,
    hand: {evidence: null, means: null},
  };
};

const makeLobby = (creator) => {
  const lobby = {
    id: creator.myLobby,
    creatorId: creator.id,
    leader: creator.id,
    users: [creator],
    getUserById(id) {
      const user = this.users.find(u => u.id === id);
      if (!user) console.log(`ERR! ${this.id}: user '${id}' not found`);
      return user;
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
    usersOffline() {
      return this.users.filter(u => u.isOnline === false);
    },
    usersReady() {
      return this.users.filter(u => u.isReady === true);
    },
    usersUnReady() {
      return this.users.filter(u => u.isReady === false);
    },
    canUseAdvRoles() {
      return this.numOnline() >= MIN_PLAYER_COUNT_FOR_ADV_ROLES;
    },
    minPlayersOnline() {
      return this.numOnline() >= MIN_PLAYER_COUNT;
    },
    minPlayersReady() {
      return this.numReady() >= MIN_PLAYER_COUNT;
    },
    canStart() {
      return (this.numReady() >= 3) && (this.numReady() === this.numOnline());
    },
    resetSettings() {
      const ghost = this.users.find(u => u.isAssignedToGhost === true);
      if (ghost) ghost.isAssignedToGhost = false;
      return initSettings(this);
    },
    makeGame,
    gameOn: false,
    game: null,
    chat: [],
    createdAt: new Date().toLocaleTimeString(),
    defaultSettings: {
      assignedToGhost: null,
      hasWitness: false,
      hasAccomplice: false,
      timer: {
        on: false,
        duration: 0,
        durationOpts: [0, 1, 2, 3, 4, 5],
      }
    },
    gameSettings: { ...this.defaultSettings },
  };

  initColors(lobby);
  initSettings(lobby);

  return lobby;
};

function initSettings(lobby) {
  const defaultSettings = {
    assignedToGhost: null,
    hasWitness: false,
    hasAccomplice: false,
    timer: {
      on: false,
      duration: 0,
      minDuration: 0,
      maxDuration: 5
    }
  };
  lobby.gameSettings = defaultSettings;
};

function initColors(lobby) {
  lobby.colors = COLORS.map(col => {
    return {
      id: col,
      isAssigned: false,
      assignedTo: []
    };
  });
};

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
    currentStage: GAME_STAGES[0],
    advanceStage(stageId, io) {
      if (stageId) {
        this.currentStage = GAME_STAGES.find(s => s.id === stageId);
      } else {
        const stageNum = GAME_STAGES.indexOf(this.currentStage);
        this.currentStage = GAME_STAGES[stageNum+1];
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
    timerIsRunning: false,
    currentTimer: null
  };

  initRoles(game);
  createHands(game);
  createGhostCardDisplay(game);

  this.game = game;
  this.gameOn = true;
};

function handleTimer(game, io) {
  if (game.currentStage.timed) {
    const timerData = {
      lobbyId: game.lobbyId,
      duration: game.settings.timer.duration,
      io: io
    };
    game.timer.run(timerData);
    game.timerIsRunning = true;
  };
  if (!game.currentStage.timed && game.timerIsRunning === true) {
    console.log(!!io);
    game.timer.clear(game.lobbyId, io);
    game.timerIsRunning = false;
  };
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
  // if (game.lobbyId === 'z') {
  //   game.nonGhosts = getNonGhosts(game);
  //   assignDevLobbyRoles(game);
  //   return
  // }
  const shuffledRoles = shuffle(initNGRoles(game));
  game.nonGhosts.forEach((nG, index) => {
    nG.canAccuse = true;
    if (shuffledRoles[index] === KILLER) return game.killer = nG;
    if (shuffledRoles[index] === WITNESS) return game.witness = nG;
    if (shuffledRoles[index] === ACCOMPLICE) return game.accomplice = nG;
    return game.hunters.push(nG);
  });
};

// function assignDevLobbyRoles(game) {
//   return game.nonGhosts.forEach((nG) => {
//     nG.canAccuse = true;
//     if (['Felix-0000', 'Hanna-0000', 'Diedre-0000'].includes(nG.id)) {
//       return game.hunters.push(nG);
//     }
//     game.killer = nG;
//     return
//   })
// }

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
  const evidenceCards = shuffleAndBatch(EVIDENCE_DECK, 4),
        meansCards = shuffleAndBatch(MEANS_DECK, 4);
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

// if (DEVMODE) devLobby();

// function devLobby() {
//   const lobbyId = 'z';

//   const newUser = makeUser({
//     id: 'Dev-0000',
//     myLobby: lobbyId,
//     lobbyCreator: false
//   });
  
//   const newLobby = makeLobby(newUser);
  
//   newLobby.leader = null;
  
//   LOBBIES[newLobby.id] = newLobby;
  
//   const users = ['Felix-0000', 'Hanna-0000', 'Diedre-0000']
  
//   const addUser = (userId, makeUser, lobby) => {
//     const newUser = makeUser({
//       id: userId,
//       myLobby: newLobby.id
//     });
//     newUser.isOnline = true;
//     newUser.isReady = true;
//     lobby.users.push(newUser);
//   }
  
//   users.forEach(user => addUser(user, makeUser, newLobby))
// };