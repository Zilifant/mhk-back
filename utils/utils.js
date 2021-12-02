// Misc Utilites and Constants

// TO DO: break these out into separate files.

const isDevEnv = process.env.NODE_ENV !== 'production';
const servName = 'MHK';
const devPort = 5555;

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
const MIN_PLAYER = isDevEnv ? 3 : 4;
const MIN_PLAYER_ADV_ROLES = isDevEnv ? 4 : 5;
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
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'purple',
  'pink',
  'cyan',
  'emerald',
  'violet',
  'rose',
  'amber',
];

const EVIDENCE_CARD_DATA = [
  'love letter','rain coat','broken glass','wine glass','motor oil','thread','mirror','fish tank','tire','bicycle','computer','umbrella','keyboard','flowers','apple','plane ticket','telephone','envelope','chalk','ballet slippers','computer mouse','gift','tooth picks','bullet','fiber optics','sock','gloves','mosquito netting','candy','sewing kit','watch','antique furniture','eggs','spices','tattoo','skull','table lamp','map','gear','flyer','numbers','tea leaves','notebook','hour glass','receipt','towel','tool box','cardboard box','toy blocks','painting','nail','gift wrap','fruit juice','surgical mask','clothing iron','bone','test tube','perfume','panties','boxer shorts','white powder','black powder','red powder','antique vase','watch','candy','campfire','gloves','computer cable','cigarette ash','paperwork','cigarette butt','lunch box','light switch','postage stamp','button','paper money','dice','mobile phone','blood','earrings','handcuffs','exam paper','lipstick','wallet','costume mask','tweezers','maze','apple','ants','safety pin','paper bag','clothes hanger','doctor\'s note','shoe','sandals','cotton balls','bell','bread','sponge','electric parts','signature','tissues','peanuts','poker chips','diary','flute','coffee','wedding ring','bandage','hat','violin','flash light','badge','dentures','light bulb','suit','cigar','sunglasses','space heater','spy camera','book','key','luggage','cockroach','syringe','bracelet','headphones','game console','office supplies','insect','calendar','laptop','teacup','high heel','puppet','stuffed animal','stockings','dog fur','cat fur','leash','vegetables','newspaper','paint','comic books','rose','wedding invite','rat','dust','human hair','oil stain','fingernails','cake','plastic bottle','photograph','dirt','ice','slinky','playing cards','spider','tie','soap','shampoo','puzzle pieces','diamond','curtains','leaf','camp fire','broom','glue','menu','sand','fan','dictonary','library card','wig','riddle','magazine','padlock','hairpin','helmet','lottery ticket','black cat','graffiti','lens','sticky note','speaker','sawdust','bullseye','herbal medicine','house plant','coins'
];

const MEANS_CARD_DATA = [
  'pocket knife','pistol','pills','falling debris','animal bite','power tool','machine','motor vehicle','plastic bag','brick','axe','crowbar','drowned','hunting rifle','heart attack','crutch','razor blade','cattle prod','scarf','liquid drug','machete','potted plant','wine','dirty water','plague','dumbbell','ice skates','candle stick','matches','belt','venomous insect','lighter','wrench','starved','electric shock','scissors','machinery','chemicals','metal wire','illegal drugs','fish hook','sculpture','powder drug','dismember','injection','baseball bat','towel','box cutter','rope','pills','metal chain','mercury','poisoned needle','stone','amoeba','arson','locked room','dagger','chainsaw','kerosene','wire','arsenic','noxious gas','folding chair','buried','packing tape','steel pipe','smoke','gun powder','bleeding','explosion','drill','bare hands','rubbing alcohol','meat cleaver','blender','pillow','overdose','throat slit','hammer','rip and tear','medical procedure','radiation','virus','sulfuric acid','sniper rifle','trophy','pesticide','board game','fork','bow and arrow','spear','frozen','liquid nitrogen','infection','head trauma','building collapse','rail car','farm animal','throwing star','sword','crushed','alcohol poisoning','zoo animal','ice pick','scythe','cesspool','rockslide','tablesaw','forklift','boat propeller','cannon','covid-19','hanging','cooked'
];

const makePlayerCard = (info, type) => {
  return {
    imgURL: `url.${info}`,
    id: info,
    type: type
  };
};

const MEANS_DECK = MEANS_CARD_DATA.map(info => makePlayerCard(info, 'means'));
const EVIDENCE_DECK = EVIDENCE_CARD_DATA.map(info => makePlayerCard(info, 'evidence'));

const CAUSE_LOC_CARD_INFO = [
  {
    type: CAUSE,
    id: 'Cause of Death',
    opts: ['Suffocation', 'Severe Injury', 'Blood Loss', 'Illness', 'Poison', 'Accident']
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
    type: LOCATION,
    id: 'Location',
    opts: ['vacation home', 'park', 'supermarket', 'school', 'forest', 'bank']
  },
  {
    type: LOCATION,
    id: 'Location',
    opts: ['living room', 'bedroom', 'pantry', 'bathroom', 'kitchen', 'driveway']
  }
];

const CLUE_CARD_DATA = [
  'victim\'s build:large,thin,tall,short,disfigured,athletic',
  'trace at scene:fingerprint,footprint,bruise,blood stain,bodily fluid,scar',
  'killer\'s personality:arrogant,despicable,angry,greedy,stubborn,perverted',
  'day of crime:weekday,weekend,spring,summer,fall,winter',
  'evidence left behind:natural,artistic,written,synthetic,personal,unrelated',
  'victim\'s clothes:neat,dirty,elegant,shabby,bizarre,naked',
  'noticed by bystander:sudden sound,prolonged sound,smell,visual,action,nothing',
  'time of death:dawn,morning,noon,afternoon,evening,midnight',
  'state of the scene:bits and pieces,ashes,liquid damage,cracked,disorderly,clean',
  'weather:sunny,stormy,dry,humid,cold,hot',
  'victim\'s occupation:boss,professional,amateur,student,unemployed,retired',
  'condition of corpse:still warm,stiff,decayed,incomplete,intact,twisted',
  'victim\'s identity:child,young adult,middle-aged,senior,man,woman',
  'sudden incident:power failure,fire,conflict,scattering,scream,nothing',
  'Motive:Hatred,Power,Money,Love,Envy,Justice',
  'In Progress:Entertainment,Relaxation,Assembly,Trading,Visit,Dining',
  'Duration:Instant,Brief,Gradual,Prolonged,A Few Days,Unclear',
  'General Impression:Common,Creative,Fishy,Cruel,Horrific,Suspensful',
  'Relationship:Relatives,Friends,Colleagues,Competitors,Lovers,Strangers',
  'Victim\'s Expression:Peaceful,Struggling,Frightened,In Pain,Blank,Angry',
  'Hint on Corpse:Head,Chest,Hand,Leg,Partial,All-over'
];

const makeClueCard = (info) => {
  return {
    type: CLUE,
    id: info.split(':')[0],
    opts: info.split(':')[1].split(',')
  };
};

const CLUE_CARD_INFO = CLUE_CARD_DATA.map(info => makeClueCard(info));

const GHOST_CARD_INFO = CAUSE_LOC_CARD_INFO.concat(CLUE_CARD_INFO);

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

exports.isDevEnv = isDevEnv;
exports.servName = servName;
exports.devPort = devPort;
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
