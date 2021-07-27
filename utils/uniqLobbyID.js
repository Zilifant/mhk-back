
const ADJECTIVES = [
  'z'
  // 'aged', 'ancient', 'billowing', 'bitter', 'black', 'blue', 'broad', 'broken', 'calm', 'cold', 'crimson', 'damp', 'dark', 'delicate', 'dry', 'floral', 'gentle', 'green', 'hidden', 'holy', 'frigid', 'vast', 'transient', 'lingering', 'lucky', 'misty', 'nameless', 'old', 'great', 'patient', 'polished', 'proud', 'purple', 'quiet', 'red', 'restless', 'rough', 'royal', 'shining', 'silent', 'snowy', 'desolate', 'lonely', 'foggy', 'still', 'summer', 'twilight', 'wandering', 'weathered', 'white', 'winter', 'yellow', 'scenic', 'shady', 'lost', 'rugged', 'majestic'
];

const NOUNS = [
  'z'
  // 'crossing', 'delve', 'sandbar', 'reef', 'camp', 'village', 'alley', 'canyon', 'gully', 'gulf', 'brook', 'bush', 'passage', 'keep', 'tower', 'bridge', 'beach', 'bay', 'hollow', 'dream', 'planet', 'heights', 'field', 'ruins', 'wall', 'garden', 'park', 'forest', 'depot', 'oasis', 'glade', 'hall', 'castle', 'fort', 'hill', 'lake', 'inlet', 'marsh', 'swamp', 'meadow', 'homestead', 'dock', 'mountain', 'peak', 'ocean', 'shoal', 'palace', 'office', 'barrens', 'pond', 'temple', 'way', 'island', 'river', 'farm', 'workshop', 'sea', 'villa', 'factory', 'waterfall', 'harbor', 'monolith', 'rapids', 'wood', 'outpost'
];

const Haikunator = require('haikunator');

const uniqLobbyID = () => {
  const hk = new Haikunator({
    adjectives: ADJECTIVES,
    nouns: NOUNS,
    defaults: {
        delimiter: '',
        tokenLength: 0,
        tokenHex: false,
        tokenChars: "0123456789",
    }
  });
  return hk.haikunate();
};

exports.uniqLobbyID = uniqLobbyID;