// Unique Lobby ID
// Generates a randomized string of the pattern: adjective-noun-0000

const ADJECTIVES = [
  'aged', 'ancient', 'bitter', 'black', 'blue', 'broad', 'broken', 'calm',
  'cold', 'crimson', 'damp', 'dark', 'delicate', 'dry', 'gentle', 'green',
  'hidden', 'holy', 'frigid', 'vast', 'lucky', 'misty', 'nameless', 'old',
  'great', 'patient', 'proud', 'purple', 'quiet', 'red', 'restless', 'rough',
  'royal', 'shining', 'silent', 'snowy', 'lonely', 'foggy', 'still', 'summer',
  'twilight', 'wandering', 'weathered', 'white', 'winter', 'yellow', 'scenic',
  'shady', 'lost', 'rugged', 'majestic', 'splendid'
];

const NOUNS = [
  'crossing', 'reef', 'camp', 'village', 'alley', 'canyon', 'brook', 'passage',
  'keep', 'tower', 'bridge', 'beach', 'bay', 'hollow', 'dream', 'planet',
  'field', 'ruin', 'wall', 'garden', 'park', 'forest', 'depot', 'oasis',
  'glade', 'hall', 'castle', 'fort', 'hill', 'lake', 'inlet', 'marsh', 'swamp',
  'meadow', 'dock', 'mountain', 'peak', 'ocean', 'shoal', 'palace', 'barrens',
  'pond', 'temple', 'way', 'island', 'river', 'farm', 'workshop', 'sea',
  'villa', 'factory', 'waterfall', 'harbor', 'monolith', 'wood', 'outpost'
];

const Haikunator = require('haikunator');

const uniqLobbyID = () => {
  const hk = new Haikunator({
    adjectives: ADJECTIVES,
    nouns: NOUNS,
    defaults: {
        delimiter: '-',
        tokenLength: 4,
        tokenHex: false,
        tokenChars: "0123456789",
    }
  });
  return hk.haikunate();
};

exports.uniqLobbyID = uniqLobbyID;