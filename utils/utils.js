const { customAlphabet } = require('nanoid');

const alpha = '1234567890';
const nanoid = customAlphabet(alpha, 4);

const uniqUserID = (userName) => {
  if (userName === 'a') return 'Ali-0000';
  if (userName === 's') return 'Ainsley-0000';
  if (userName === 'd') return 'Amber-0000';
  return userName + '-' + nanoid();
};

const adjectives = [
  'aged', 'ancient', 'billowing', 'bitter', 'black', 'blue', 'broad', 'broken', 'calm', 'cold', 'crimson', 'damp', 'dark', 'delicate', 'dry', 'floral', 'gentle', 'green', 'hidden', 'holy', 'frigid', 'vast', 'transient', 'lingering', 'lucky', 'misty', 'nameless', 'old', 'great', 'patient', 'polished', 'proud', 'purple', 'quiet', 'red', 'restless', 'rough', 'royal', 'shining', 'silent', 'snowy', 'desolate', 'lonely', 'foggy', 'still', 'summer', 'twilight', 'wandering', 'weathered', 'white', 'winter', 'yellow', 'scenic', 'shady', 'lost', 'rugged', 'majestic'
];

const nouns = [
  'crossing', 'delve', 'sandbar', 'reef', 'camp', 'village', 'alley', 'canyon', 'gully', 'gulf', 'brook', 'bush', 'passage', 'keep', 'tower', 'bridge', 'beach', 'bay', 'hollow', 'dream', 'planet', 'heights', 'field', 'ruins', 'wall', 'garden', 'park', 'forest', 'depot', 'oasis', 'glade', 'hall', 'castle', 'fort', 'hill', 'lake', 'inlet', 'marsh', 'swamp', 'meadow', 'homestead', 'dock', 'mountain', 'peak', 'ocean', 'shoal', 'palace', 'office', 'barrens', 'pond', 'temple', 'way', 'island', 'river', 'farm', 'workshop', 'sea', 'villa', 'factory', 'waterfall', 'harbor', 'monolith', 'rapids', 'wood', 'outpost'
];

const Haikunator = require('haikunator');

const uniqLobbyID = () => {
  const hk = new Haikunator({
    adjectives: adjectives,
    nouns: nouns,
    defaults: {
        delimiter: "-",
        tokenLength: 4,
        tokenHex: false,
        tokenChars: "0123456789",
    }
  });
  return hk.haikunate();
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

const shuffleAndBatch = (array, batchSize) => {
  const shuffledDeck = shuffle(array);
  const batches = [];

  let i = 1
  shuffledDeck.forEach(card => {
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

exports.shuffle = shuffle;
exports.shuffleAndBatch = shuffleAndBatch;
exports.uniqUserID = uniqUserID;
exports.uniqLobbyID = uniqLobbyID;