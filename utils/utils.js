// Misc Utilites and Constants

// TO DO: break these out into separate files.

const { MEANS_CARD_DATA, EVIDENCE_CARD_DATA } = require('./data');

const isDevEnv = process.env.NODE_ENV !== 'production';
const servName = 'MHK';
const devPort = 5555;

const LOBBIES = {}; // Top-level object.
const TIMERS = {}; // Top-level object. TO DO: move timers into lobbies.
const GHOST = 'ghost';
const HUNTER = 'hunter';
const KILLER = 'killer';
const ACCOMPLICE = 'accomplice';
const WITNESS = 'witness';
const OPT_ROLES = ['witness', 'accomplice'];

const makePlayerCard = (info, type) => {
  return {
    imgURL: `placeholderUrl.${info}`, // Images not yet implemented.
    id: info,
    type: type
  };
};

const MEANS_DECK = MEANS_CARD_DATA.map(info => makePlayerCard(info, 'means'));
const EVIDENCE_DECK = EVIDENCE_CARD_DATA.map(info => makePlayerCard(info, 'evidence'));

// List of game properties to be hidden from certain roles.
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
    'blueTeam', 'redTeam', 'rolesRef', 'keyEvidence', 'hunters', 'killer',
    'accomplice', 'witness'
  ]
};

// Check if value is truthy.
const isTruthy = (x) => !!x ? true : console.log(`ERR! have = ${x}`);

// Return new object with specified properties to `null`.
const nullify = (obj, keys) => {
  const newObj = Object.assign({}, obj);
  keys.forEach(key => {
    newObj[key] = null;
  });
  return newObj;
};

// Return new object with specified properties removed.
const omit = (obj, keys) => {
  const newObj = Object.assign({}, obj);
  keys.forEach(key => {
    delete newObj[key];
  });
  return newObj;
};

// Capitalize first letter of each word (separated by non-letter characters).
const capitalize = (str) => {
  return str.replace(/\b([a-zÁ-ú])/g, (w) => w.charAt(0).toUpperCase() + w.slice(1));
};

// Shuffle an array. (Mutates the array.)
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

// Divide elements of an array into 'batches' of given size (e.g. arrays of
// given length). Last 'batch' contains to remainder, if any. Returns an array
// of arrays. (Does not mutate the original array.)
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
  return {
    type: item.type,
    id: item.id,
    opts: item.opts.map(opt => createOption(opt)),
    isDisplayed: false,
    isLocked: false
  };

  function createOption(opt) {
    return {
      id: opt,
      isSelected: false
    };
  };
};

// TO DO: add proper error handling.
const getLobbyById = lobbyId => {
  const id = lobbyId.toLowerCase();
  if (!LOBBIES[id]) {
    console.log(`ERR! getLobbyById: lobby '${id}' not found`);
    return;
  };
  return LOBBIES[id];
};

// TO DO: add proper error handling.
const getUserById = ({lobbyId, userId}) => {
  if (!LOBBIES[lobbyId]) {
    console.log(`ERR! getUserById: lobby '${lobbyId}' not found`);
    return;
  };
  return LOBBIES[lobbyId].users.find(user => user.id === userId);
};

// TO DO: add proper error handling.
const getRoleById = (userId, lobby) => {
  const role = lobby.game.rolesRef.find(ref => ref.user.id === userId).role;
  if (!!role) return role;
  return console.log(`ERR! getRoleById: role '${userId}' matches no roles in this game`);
};

// Structure message data for the `buildSMDString` front end module.
const msg = ({
  type,
  args=[],
  isInGame,
  senderId='app'
}) => {
  return {
    // `en-GB` format is expected by `convertToClientTimezone`.
    time: new Date().toLocaleTimeString('en-GB'),
    type,
    isInGame,
    args,
    senderId,
  };
};

const cookieSettings = {
  maxAge: 60 * 60 * 7000, // 7 hours
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
  secure: process.env.NODE_ENV === "production"
}

module.exports = {
  isDevEnv,
  servName,
  devPort,
  LOBBIES,
  TIMERS,
  OPT_ROLES,
  GHOST,
  HUNTER,
  KILLER,
  ACCOMPLICE,
  WITNESS,
  EVIDENCE_DECK,
  MEANS_DECK,
  HIDE_FROM,
  cookieSettings,
  omit,
  nullify,
  capitalize,
  shuffle,
  shuffleAndBatch,
  makeGhostCard,
  getLobbyById,
  getUserById,
  getRoleById,
  msg,
  isTruthy
};
