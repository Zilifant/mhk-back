
const { LOBBIES } = require('./constants');

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
    console.log(`Lobby: ${id} not found`);
    return;
  };
  return LOBBIES[id];
};

const getUserById = ({lobbyId, userId}) => {
  if (!LOBBIES[lobbyId]) {
    console.log(`Lobby: ${lobbyId} not found`);
    return;
  };
  return LOBBIES[lobbyId].users.find(user => user.id === userId);
};

const getRoleById = (userId, lobby) => {
  const role = lobby.game.rolesRef.find(ref => ref.user.id === userId).role;
  if (!!role) return role;
  return console.log(`${userId} matches no roles in this game`);
};

const msg = (type, args, senderId = 'app') => {
  return {
    type,
    senderId,
    args,
    time: new Date().toLocaleTimeString().slice(0,-6)
  }
};

const cookieSettings = {
  maxAge: 60 * 60 * 5000, // 5 hours
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax',
  secure: process.env.NODE_ENV === "production"
}

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
