// misc utilites and constants

const DEVMODE = process.env.NODE_ENV !== 'production';
const LOBBIES = {};
const TIMERS = {};
const GHOST = 'ghost';
const HUNTER = 'hunter';
const KILLER = 'killer';
const ACCOMPLICE = 'accomplice';
const WITNESS = 'witness';
const CAUSE = 'cause';
const LOCATION = 'location';
const CLUE = 'clue';
const MIN_PLAYER = DEVMODE ? 3 : 4;
const MIN_PLAYER_ADV_ROLES = DEVMODE ? 4 : 5;
const OPT_ROLES = ['witness', 'accomplice'];

const DEFAULT_GAME_SETTINGS = {
  assignedToGhost: null,
  hasWitness: false,
  hasAccomplice: false,
  timer: {
    on: false,
    duration: 0,
    durationOpts: [0, 1, 2, 3, 4, 5],
  }
};

const COLORS = [
  'red','blue','green','yellow','orange','purple','pink','cyan','emerald','violet','rose','amber'
];

const EVIDENCE_CARD_INFO = [
  'Love Letter',
  'Raincoat',
  'Broken Glass',
  'Wine Glass',
  'Motor Oil',
  'Thread',
  'Mirror',
  'Fish Tank',
  'Tire',
  'Bicycle',
  'Computer',
  'Umbrella',
  'Flowers',
  'Apple',
  'Plane Ticket',
  'telephone',
  'envelope',
  'chalk',
  'perfume',
  'test tube',
  'ballet slippers',
  'bone',
  'clothes iron',
  'surgical mask',
  'computer mouse',
  'fruit juice',
  'gift',
  'toothpicks',
  'bullet',
  'fiber optics',
  'sock',
  'gloves',
  'mosquito netting',
  'candy',
  'sewing kit',
  'watch',
  'antique furniture',
  'white powder',
  'eggs',
];

const MEANS_CARD_INFO = [
  'Knife',
  'Revolver',
  'Pills',
  'Falling Debris',
  'Animal Bite',
  'Power Tool',
  'Machine',
  'Motor Vehicle',
  'Plastic Bag',
  'Brick',
  'Axe',
  'Crowbar',
  'Drowned',
  'Hunting Rifle',
  'Heart Attack',
  'crutch',
  'razor blade',
  'electric baton',
  'scarf',
  'liquid drug',
  'machete',
  'potted plant',
  'wine',
  'dirty water',
  'plague',
  'dumbbell',
  'ice skates',
  'candle stick',
  'matches',
  'belt',
  'venomous insect',
  'lighter',
  'wrench',
  'starvation',
  'electric shock',
  'scissors',
  'machinery',
  'chemicals',
  'metal wire',
];

const makePlayerCard = (info, type) => {
  return {
    imgURL: `url.${info}`,
    id: info,
    type: type
  };
};

const MEANS_DECK = MEANS_CARD_INFO.map(info => makePlayerCard(info, 'means'));
const EVIDENCE_DECK = EVIDENCE_CARD_INFO.map(info => makePlayerCard(info, 'evidence'));

const GHOST_CARD_INFO = [
  {
    type: CAUSE,
  
    id: 'Cause of Death',
    opts: ['Suffocation', 'Severe Injury', 'Blood Loss', 'Illness/Disease', 'Poison', 'Accident']
  },
  {
    type: LOCATION,
  
    id: 'Location',
    opts: ['Playground', 'Classroom', 'Dormitory', 'Cafeteria', 'Elevator', 'Toilet']
  },
  {
    type: LOCATION,
  
    id: 'Location',
    opts: ['Pub', 'Restaurant', 'Bookstore', 'Hotel', 'Hospital', 'Building Site']
  },
  {
    type: CLUE,
  
    id: 'Motive',
    opts: ['Hatred', 'Power', 'Money', 'Love', 'Envy', 'Justice']
  },
  {
    type: CLUE,
  
    id: 'In Progress',
    opts: ['Entertainment', 'Relaxation', 'Assembly', 'Trading', 'Visit', 'Dining']
  },
  {
    type: CLUE,
  
    id: 'Duration',
    opts: ['Instant', 'Brief', 'Gradual', 'Prolonged', 'A Few Days', 'Unclear']
  },
  {
    type: CLUE,
  
    id: 'General Impression',
    opts: ['Common', 'Creative', 'Fishy', 'Cruel', 'Horrific', 'Suspensful']
  },
  {
    type: CLUE,
  
    id: 'Relationship',
    opts: ['Relatives', 'Friends', 'Colleagues', 'Competitors', 'Lovers', 'Strangers']
  },
  {
    type: CLUE,
  
    id: 'Victim\'s Expression',
    opts: ['Peaceful', 'Struggling', 'Frightened', 'In Pain', 'Blank', 'Angry']
  },
  {
    type: CLUE,
  
    id: 'Hint on Corpse',
    opts: ['Head', 'Chest', 'Hand', 'Leg', 'Partial', 'All-over']
  }
];

const HIDE_FROM = {
  spectator: [],
  ghost: [],
  killer: [
    'blueTeam', 'rolesRef', 'witness', 'hunters'
  ],
  accomplice: [
    'blueTeam', 'rolesRef', 'witness', 'hunters'
  ],
  witness: [
    'blueTeam', 'rolesRef', 'keyEvidence', 'killer', 'accomplice'
  ],
  hunter: [
    'blueTeam', 'redTeam', 'rolesRef', 'keyEvidence', 'hunters', 'killer', 'accomplice', 'witness'
  ]
};

const have = (x) => !!x ? true : console.log(`ERR! have = ${x}`);

const nullify = (obj, keys) => {
  const newObj = Object.assign({}, obj);
  keys.forEach(key => {
    newObj[key] = null;
  });
  return newObj;
};

const omit = (obj, keys) => {
  const newObj = Object.assign({}, obj);
  keys.forEach(key => {
    delete newObj[key];
  });
  return newObj;
};

const capitalize = (str) => {
  return str.replace(/\b([a-zÁ-ú])/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
};

const shuffle = (array) => {
  let m = array.length, t, i;
  while (m) {
    i = Math.floor(Math.random() * m--);
    t = array[m];
    array[m] = array[i];
    array[i] = t;
  };
  return array;
};

const batch = (array, batchSize) => {
  const batches = [];

  let i = 1
  array.forEach(card => {
    switch (true) {
      case (i === 1):
        batches.push([]);
        batches[batches.length-1].push(card);
        i++;
        break;
      case (i > 1 && i < batchSize):
        batches[batches.length-1].push(card);
        i++
        break;
      case (i === batchSize):
        batches[batches.length-1].push(card);
        i = 1;
        break;
    };
  });

  return batches;
};

const shuffleAndBatch = (array, batchSize) => {
  const shuffledDeck = shuffle(array);
  return batch(shuffledDeck, batchSize);
};

const makeGhostCard = (item) => {
  const optionObjects = item.opts.map(opt => {
    return {
      id: opt,
      isSelected: false
    };
  });
  return {
    type: item.type,
    id: item.id,
    opts: optionObjects,
    isDisplayed: false,
    isLocked: false
  };
};

const getLobbyById = lobbyId => {
  const id = lobbyId.toLowerCase();
  if (!LOBBIES[id]) {
    console.log(`ERR! getLobbyById: lobby '${id}' not found`);
    return;
  };
  return LOBBIES[id];
};

const getUserById = ({lobbyId, userId}) => {
  if (!LOBBIES[lobbyId]) {
    console.log(`ERR! getUserById: lobby '${lobbyId}' not found`);
    return;
  };
  return LOBBIES[lobbyId].users.find(user => user.id === userId);
};

const getRoleById = (userId, lobby) => {
  const role = lobby.game.rolesRef.find(ref => ref.user.id === userId).role;
  if (!!role) return role;
  return console.log(`ERR! getRoleById: role '${userId}' matches no roles in this game`);
};

const msg = ({type, args=[], isInGame, senderId='app'}) => {
  return {
    time: new Date().toLocaleTimeString().slice(0,-6),
    type,
    isInGame,
    args,
    senderId,
  }
};

const cookieSettings = {
  maxAge: 60 * 60 * 7000, // 7 hours
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
  secure: process.env.NODE_ENV === "production"
}

exports.DEVMODE = DEVMODE;
exports.LOBBIES = LOBBIES;
exports.TIMERS = TIMERS;
exports.OPT_ROLES = OPT_ROLES;
exports.GHOST = GHOST;
exports.HUNTER = HUNTER;
exports.KILLER = KILLER;
exports.ACCOMPLICE = ACCOMPLICE;
exports.WITNESS = WITNESS;
exports.EVIDENCE_DECK = EVIDENCE_DECK;
exports.MEANS_DECK = MEANS_DECK;
exports.GHOST_CARD_INFO = GHOST_CARD_INFO;
exports.COLORS = COLORS;
exports.HIDE_FROM = HIDE_FROM;
exports.DEFAULT_GAME_SETTINGS = DEFAULT_GAME_SETTINGS;
exports.MIN_PLAYER = MIN_PLAYER;
exports.MIN_PLAYER_ADV_ROLES = MIN_PLAYER_ADV_ROLES;
exports.cookieSettings = cookieSettings;
exports.omit = omit;
exports.nullify = nullify;
exports.capitalize = capitalize;
exports.shuffle = shuffle;
exports.shuffleAndBatch = shuffleAndBatch;
exports.makeGhostCard = makeGhostCard;
exports.getLobbyById = getLobbyById;
exports.getUserById = getUserById;
exports.getRoleById = getRoleById;
exports.msg = msg;
exports.have = have;

// const makeGhostDecks = (ghostCardInfo) => {
//   const gCards = ghostCardInfo.map(item => makeGhostCard(item));
//   const gDecks = {
//     causes: gCards.filter(card => card.type === 'cause'),
//     locs: gCards.filter(card => card.type === 'location'),
//     clues: gCards.filter(card => card.type === 'clue')
//   };
//   return gDecks;
// };

// exports.makeGhostDecks = makeGhostDecks;
