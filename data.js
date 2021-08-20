
const sample = require('lodash.sample');
const {
  GAME_STAGES, OPT_ROLES, HIDE_FROM,
  HUNTER, KILLER, GHOST, ACCOMPLICE, WITNESS,
  EVIDENCE_DECK, MEANS_DECK, GHOST_CARD_INFO, DEVMODE, LOBBIES
} = require('./utils/constants');
const {
  nullify,
  shuffle,
  shuffleAndBatch,
  makeGhostCard,
  msg
} = require('./utils/utils');
const { timer } = require('./utils/timer');

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
      timer: {
        on: true,
        duration: 1,
        durationOpts: ['off', 1, 2, 3, 4, 5],
        soft: null,
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
    chat: [msg('welcome')],
    createdAt: new Date().toLocaleTimeString()
  };
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
    timer
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
    game.timer.running = true;
  };
  if (!game.currentStage.timed && game.timer.running === true) {
    console.log(!!io);
    game.timer.clear(game.lobbyId, io);
    game.timer.running = false;
  }
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