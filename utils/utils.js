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

function parseSMDString(str, opts) {
  const defStyle = opts.default || 'default';
  const st = opts.splitTextOn || '^';
  const sc = opts.splitClsOn || '_';

  const createStyleObj = (string, style = defStyle) => {
    return { string, style }
  };

  const checkAbbr = (cls) => opts.abbr.find(e => e.abb === cls);

  const arr = str.split(st).filter(e => !!e);

  const result = arr.map(str => {

    if (str.charAt(0) !== sc) return createStyleObj(str);

    const a = str.split(sc).filter(e => !!e);

    let abbr;
    if (!!opts) abbr = checkAbbr(a[0]);
    if (!!abbr) return createStyleObj(a[1], abbr.classname);

    return createStyleObj(a[1], a[0]);
  });
  return result;
};

const SMDopts = {
  wrapper: 'announcement-wrapper',
  splitTextOn: '^',
  splitClsOn: '_',
  default: 'announcement',
  abbr: [
    {abb: 'm', classname: 'announcement--usermessage'},
    {abb: 't', classname: 'announcement--timestamp'},
    {abb: 'u', classname: 'announcement--username'},
    {abb: 'k', classname: 'announcement--keyword'}
  ]
};

const parseSMD = (string) => {
  return parseSMDString(string, SMDopts);
};

const makeGhostCard = (item) => {
  const optObjects = item.opts.map(opt => {
    return {
      id: opt,
      isSelected: false
    };
  });
  return {
    type: item.type,
    id: item.id,
    opts: optObjects,
    isDisplayed: false,
    isLocked: false
  };
};

const makeGhostDecks = (ghostCardInfo) => {
  const gCards = ghostCardInfo.map(item => makeGhostCard(item));
  const gDecks = {
    causes: gCards.filter(card => card.type === 'cause'),
    locs: gCards.filter(card => card.type === 'location'),
    clues: gCards.filter(card => card.type === 'clue')
  };
  return gDecks;
};

exports.shuffle = shuffle;
exports.shuffleAndBatch = shuffleAndBatch;
exports.uniqUserID = uniqUserID;
exports.uniqLobbyID = uniqLobbyID;
exports.parseSMD = parseSMD;
exports.makeGhostCard = makeGhostCard;
exports.makeGhostDecks = makeGhostDecks;