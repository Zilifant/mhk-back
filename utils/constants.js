// constants

const GHOST = 'Ghost',
      HUNTER = 'Hunter',
      KILLER = 'Killer',
      CAUSE = 'cause',
      LOCATION = 'location',
      CLUE = 'clue';

const ROLES = [GHOST, HUNTER, HUNTER, KILLER];

const EVIDENCE_CARD_INFO = ['Knife', 'Revolver', 'Pills', 'Falling Debris', 'Animal Bite', 'Power Tool', 'Machine', 'Motor Vehicle', 'Plastic Bag', 'Brick', 'Axe', 'Crowbar', 'Drowned', 'Hunting Rifle', 'Heart Attack'];

const makeEvidenceCard = (info) => {
  return {
    imgURL: `url.${info}`,
    id: info
  };
};

const EVIDENCE_DECK = EVIDENCE_CARD_INFO.map(info => makeEvidenceCard(info));

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

const makeGhostCard = (item) => {
  item.opts = item.opts.map(opt => {
    return {
      id: opt,
      isSelected: false
    };
  });
  return {
    ...item,
    isDisplayed: false,
    isLocked: false
  };
};

const GHOST_CARDS = GHOST_CARD_INFO.map(item => makeGhostCard(item));

const CAUSES_DECK = GHOST_CARDS.filter(card => card.type === CAUSE);
const LOCS_DECK = GHOST_CARDS.filter(card => card.type === LOCATION);
const CLUES_DECK = GHOST_CARDS.filter(card => card.type === CLUE);

exports.ROLES = ROLES;
exports.GHOST = GHOST;
exports.HUNTER = HUNTER;
exports.KILLER = KILLER;
exports.EVIDENCE_DECK = EVIDENCE_DECK;
exports.CAUSES_DECK = CAUSES_DECK;
exports.LOCS_DECK = LOCS_DECK;
exports.CLUES_DECK = CLUES_DECK;