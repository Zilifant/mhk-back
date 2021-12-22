// Static Game Data //
// Used to create game components.

const GHOST_CARD_DATA = [
  {
    type: 'cause',
    id: 'Cause of Death',
    opts: ['Suffocation', 'Severe Injury', 'Blood Loss', 'Illness', 'Poison', 'Accident']
  },
  {
    type: 'location',
    id: 'Location',
    opts: ['Playground', 'Classroom', 'Dormitory', 'Cafeteria', 'Elevator', 'Toilet']
  },
  {
    type: 'location',
    id: 'Location',
    opts: ['Pub', 'Restaurant', 'Bookstore', 'Hotel', 'Hospital', 'Building Site']
  },
  {
    type: 'location',
    id: 'Location',
    opts: ['vacation home', 'park', 'supermarket', 'school', 'forest', 'bank']
  },
  {
    type: 'location',
    id: 'Location',
    opts: ['living room', 'bedroom', 'pantry', 'bathroom', 'kitchen', 'driveway']
  },
  {
    type: 'clue',
    id: "victim's build",
    opts: [ 'large', 'thin', 'tall', 'short', 'disfigured', 'athletic' ]
  },
  {
    type: 'clue',
    id: 'trace at scene',
    opts: [
      'fingerprint',
      'footprint',
      'bruise',
      'blood stain',
      'bodily fluid',
      'scar'
    ]
  },
  {
    type: 'clue',
    id: "killer's personality",
    opts: [
      'arrogant',
      'despicable',
      'angry',
      'greedy',
      'stubborn',
      'perverted'
    ]
  },
  {
    type: 'clue',
    id: 'day of crime',
    opts: [ 'weekday', 'weekend', 'spring', 'summer', 'fall', 'winter' ]
  },
  {
    type: 'clue',
    id: 'evidence left behind',
    opts: [
      'natural',
      'artistic',
      'written',
      'synthetic',
      'personal',
      'unrelated'
    ]
  },
  {
    type: 'clue',
    id: "victim's clothes",
    opts: [ 'neat', 'dirty', 'elegant', 'shabby', 'bizarre', 'naked' ]
  },
  {
    type: 'clue',
    id: 'noticed by bystander',
    opts: [
      'sudden sound',
      'prolonged sound',
      'smell',
      'visual',
      'action',
      'nothing'
    ]
  },
  {
    type: 'clue',
    id: 'time of death',
    opts: [ 'dawn', 'morning', 'noon', 'afternoon', 'evening', 'midnight' ]
  },
  {
    type: 'clue',
    id: 'state of the scene',
    opts: [
      'bits and pieces',
      'ashes',
      'liquid damage',
      'cracked',
      'disorderly',
      'clean'
    ]
  },
  {
    type: 'clue',
    id: 'weather',
    opts: [ 'sunny', 'stormy', 'dry', 'humid', 'cold', 'hot' ]
  },
  {
    type: 'clue',
    id: "victim's occupation",
    opts: [
      'boss',
      'professional',
      'amateur',
      'student',
      'unemployed',
      'retired'
    ]
  },
  {
    type: 'clue',
    id: 'condition of corpse',
    opts: [
      'still warm',
      'stiff',
      'decayed',
      'incomplete',
      'intact',
      'twisted'
    ]
  },
  {
    type: 'clue',
    id: "victim's identity",
    opts: [ 'child', 'young adult', 'middle-aged', 'senior', 'man', 'woman' ]
  },
  {
    type: 'clue',
    id: 'sudden incident',
    opts: [
      'power failure',
      'fire',
      'conflict',
      'scattering',
      'scream',
      'nothing'
    ]
  },
  {
    type: 'clue',
    id: 'Motive',
    opts: [ 'Hatred', 'Power', 'Money', 'Love', 'Envy', 'Justice' ]
  },
  {
    type: 'clue',
    id: 'In Progress',
    opts: [
      'Entertainment',
      'Relaxation',
      'Assembly',
      'Trading',
      'Visit',
      'Dining'
    ]
  },
  {
    type: 'clue',
    id: 'Duration',
    opts: [
      'Instant',
      'Brief',
      'Gradual',
      'Prolonged',
      'A Few Days',
      'Unclear'
    ]
  },
  {
    type: 'clue',
    id: 'General Impression',
    opts: [
      'Common',
      'Creative',
      'Fishy',
      'Cruel',
      'Horrific',
      'Suspensful'
    ]
  },
  {
    type: 'clue',
    id: 'Relationship',
    opts: [
      'Relatives',
      'Friends',
      'Colleagues',
      'Competitors',
      'Lovers',
      'Strangers'
    ]
  },
  {
    type: 'clue',
    id: "Victim's Expression",
    opts: [
      'Peaceful',
      'Struggling',
      'Frightened',
      'In Pain',
      'Blank',
      'Angry'
    ]
  },
  {
    type: 'clue',
    id: 'Hint on Corpse',
    opts: [ 'Head', 'Chest', 'Hand', 'Leg', 'Partial', 'All-over' ]
  }
];

const EVIDENCE_CARD_DATA = [
  'love letter','rain coat','broken glass','wine glass','motor oil','thread','mirror','fish tank','tire','bicycle','computer','umbrella','keyboard','flowers','apple','plane ticket','telephone','envelope','chalk','ballet slippers','computer mouse','gift','tooth picks','bullet','fiber optics','sock','gloves','mosquito netting','candy','sewing kit','watch','antique furniture','eggs','spices','tattoo','skull','table lamp','map','gear','flyer','numbers','tea leaves','notebook','hour glass','receipt','towel','tool box','cardboard box','toy blocks','painting','nail','gift wrap','fruit juice','surgical mask','clothing iron','bone','test tube','perfume','panties','boxer shorts','white powder','black powder','red powder','antique vase','watch','candy','campfire','gloves','computer cable','cigarette ash','paperwork','cigarette butt','lunch box','light switch','postage stamp','button','paper money','dice','mobile phone','blood','earrings','handcuffs','exam paper','lipstick','wallet','costume mask','tweezers','maze','apple','ants','safety pin','paper bag','clothes hanger','doctor\'s note','shoe','sandals','cotton balls','bell','bread','sponge','electric parts','signature','tissues','peanuts','poker chips','diary','flute','coffee','wedding ring','bandage','hat','violin','flash light','badge','dentures','light bulb','suit','cigar','sunglasses','space heater','spy camera','book','key','luggage','cockroach','syringe','bracelet','earbuds','game console','office supplies','insect','calendar','laptop','teacup','high heel','puppet','stuffed animal','stockings','dog fur','cat fur','leash','vegetables','newspaper','paint','comic books','rose','wedding invite','rat','dust','human hair','oil stain','finger nails','cake','plastic bottle','photograph','dirt','ice','slinky','playing cards','spider','tie','soap','shampoo','puzzle pieces','diamond','curtains','leaf','camp fire','broom','glue','menu','sand','fan','dictonary','library card','wig','riddle','magazine','padlock','hairpin','helmet','lottery ticket','black cat','graffiti','lens','sticky note','speaker','sawdust','bullseye','herbal medicine','house plant','coins'
];

const MEANS_CARD_DATA = [
  'pocket knife','pistol','pills','falling debris','animal bite','power tool','machine','motor vehicle','plastic bag','brick','axe','crowbar','drowned','hunting rifle','heart attack','crutch','razor blade','cattle prod','scarf','liquid drug','machete','potted plant','wine','dirty water','plague','dumbbell','ice skates','candle stick','matches','belt','venomous insect','lighter','wrench','starved','electric shock','scissors','machinery','chemicals','metal wire','illegal drugs','fish hook','sculpture','powder drug','dismember','injection','baseball bat','towel','box cutter','rope','pills','metal chain','mercury','poisoned needle','stone','amoeba','arson','locked room','dagger','chainsaw','kerosene','wire','arsenic','noxious gas','folding chair','buried','packing tape','steel pipe','smoke','gun powder','bleeding','explosion','drill','bare hands','rubbing alcohol','meat cleaver','blender','pillow','overdose','throat slit','hammer','ripped apart','medical procedure','radiation','virus','sulfuric acid','sniper rifle','trophy','pesticide','board game','fork','arrow','spear','frozen','liquid nitrogen','infection','head trauma','building collapse','rail car','farm animal','throwing star','sword','crushed','alcohol poisoning','zoo animal','ice pick','scythe','cesspool','rockslide','tablesaw','forklift','boat propeller','cannon','covid-19','hanging','cooked'
];

module.exports = {
  GHOST_CARD_DATA,
  EVIDENCE_CARD_DATA,
  MEANS_CARD_DATA
};