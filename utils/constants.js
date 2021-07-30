// constants

const LOBBIES = {},
      GHOST = 'ghost',
      HUNTER = 'hunter',
      KILLER = 'killer',
      ACCOMPLICE = 'accomplice',
      WITNESS = 'witness'
      CAUSE = 'cause',
      LOCATION = 'location',
      CLUE = 'clue';

const OPT_ROLES = ['witness', 'accomplice'];

function newClueCard(game, i) {
  game.cluesDeck[i].isDisplayed = true;
  game.cluesDeck[i].isNew = true;
  game.cluesDeck[i-1].isNew = false;
};

function removeClueCard(game, cardId) {
  game.cluesDeck.find(card => card.id === cardId).isDisplayed = false;
};

const GAME_STAGES = [
  {
    type: 'setup',
    id: 'Setup',
    display: 'Setup',
  },
  {
    type: 'round',
    id: 'Round 1',
    roundNum: 1,
    display: 'Round 1',
  },
  {
    type: 'liminal',
    id: 'round-2-start',
    roundNum: 2,
    display: 'Round 2',
    onStart: (game) => newClueCard(game, 6),
  },
  {
    type: 'round',
    id: 'Round 2',
    roundNum: 2,
    display: 'Round 2',
    onStart: (game, cardId) => removeClueCard(game, cardId),
  },
  {
    type: 'liminal',
    id: 'round-3-start',
    roundNum: 3,
    display: 'Round 3',
    onStart: (game) => newClueCard(game, 7),
  },
  {
    type: 'round',
    id: 'Round 3',
    roundNum: 3,
    display: 'Round 3',
    onStart: (game, cardId) => removeClueCard(game, cardId),
  },
  {
    type: 'special',
    id: 'Second Murder',
    display: 'Second Murder'
  },
  {
    type: 'postgame',
    id: 'Finale',
    display: 'Finale',
  }
];

const GAME_OUTCOMES = {
  redwin: 'Killer wins! The Hunters used their last accusation.',
  redwintimeout: 'Killer wins! The Hunters ran out of time.',
  redwinwitnessdead: 'Killers win! The Witness is dead.',
  bluewin: 'Hunters and Ghost win!',
  bluewinwitnessalive: 'Hunters & Ghost win! The Witness survived.'
};

const USER_COLORS = [
  'red','blue','green','yellow','orange','purple','pink','cyan','emerald','violet','rose','amber'
];

const EVIDENCE_CARD_INFO = [
  'Love Letter', 'Raincoat', 'Broken Glass', 'Wineglass', 'Motor Oil', 'Thread', 'Mirror', 'Fish Tank', 'Tire', 'Bicycle', 'Computer', 'Umbrella', 'Flowers', 'Apple', 'Plane Ticket'
];

const MEANS_CARD_INFO = [
  'Knife', 'Revolver', 'Pills', 'Falling Debris', 'Animal Bite', 'Power Tool', 'Machine', 'Motor Vehicle', 'Plastic Bag', 'Brick', 'Axe', 'Crowbar', 'Drowned', 'Hunting Rifle', 'Heart Attack'
];

const makePlayerCard = (info) => {
  return {
    imgURL: `url.${info}`,
    id: info
  };
};

const EVIDENCE_DECK = EVIDENCE_CARD_INFO.map(info => makePlayerCard(info));
const MEANS_DECK = MEANS_CARD_INFO.map(info => makePlayerCard(info))

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

exports.LOBBIES = LOBBIES;
exports.GAME_STAGES = GAME_STAGES;
exports.GAME_OUTCOMES = GAME_OUTCOMES;
exports.OPT_ROLES = OPT_ROLES;
exports.GHOST = GHOST;
exports.HUNTER = HUNTER;
exports.KILLER = KILLER;
exports.ACCOMPLICE = ACCOMPLICE;
exports.WITNESS = WITNESS;
exports.EVIDENCE_DECK = EVIDENCE_DECK;
exports.MEANS_DECK = MEANS_DECK;
exports.GHOST_CARD_INFO = GHOST_CARD_INFO;
exports.USER_COLORS = USER_COLORS;
exports.HIDE_FROM = HIDE_FROM;