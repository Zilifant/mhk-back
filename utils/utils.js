
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

const getLobbyById = id => {
  if (!LOBBIES[id]) {
    console.log(`Lobby: ${id} no longer exists`);
    return;
  };
  return LOBBIES[id];
};

const getUserById = ({lobbyId, userId}) => {
  if (!LOBBIES[lobbyId]) {
    console.log(`Lobby: ${lobbyId} no longer exists`);
    return;
  };
  return LOBBIES[lobbyId].users.find(user => user.id === userId);
};

function getRoleById(userId, lobby) {
  const role = lobby.game.rolesRef.find(ref => ref.user.id === userId).role;
  if (!!role) return role;
  return console.log(`${userId} matches no roles in this game`);
};

exports.omit = omit;
exports.nullify = nullify;
exports.shuffle = shuffle;
exports.shuffleAndBatch = shuffleAndBatch;
exports.makeGhostCard = makeGhostCard;
exports.getLobbyById = getLobbyById;
exports.getUserById = getUserById;
exports.getRoleById = getRoleById;

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
