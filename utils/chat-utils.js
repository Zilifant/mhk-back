
const JOIN = ' has joined.',
      LEAVE = ' has left.',
      READY = ' is ready.',
      UNREADY = ' is not ready',
      ANNOUNCE_CLS = 'announcement',
      DEFAULT_CLS = ANNOUNCE_CLS,
      TIMESTAMP_CLS = `${ANNOUNCE_CLS}--timestamp`,
      USERNAME_CLS = `${ANNOUNCE_CLS}--username`,
      KEYWORD_CLS = `${ANNOUNCE_CLS}--keyword`;

// function styledTextElement(text, style) {
//   return { text: text, style: style };
// };

function msgTime() {
  return { text: `${new Date().toLocaleTimeString().slice(0,-6)} `, style: TIMESTAMP_CLS };
};

function userNameObj(username) {
  return { text: username.slice(0,-5), style: USERNAME_CLS };
};

function defaultObj(text) {
  return { text: text, style: DEFAULT_CLS };
};

function keywordObj(keyword) {
  return { text: keyword, style: KEYWORD_CLS };
}

const announce = (() => {

  const userMessage = (user, text) => [
    msgTime(),
    userNameObj(user),
    defaultObj(`: ${text}`)
  ];

  const join = (user) => [
    msgTime(),
    userNameObj(user),
    defaultObj(JOIN)
  ];

  const leave = (user) => [
    msgTime(),
    userNameObj(user),
    defaultObj(LEAVE)
  ];

  const ready = (user, ready) => {
    if (ready) return [
      msgTime(),
      userNameObj(user),
      defaultObj(READY)
    ];
    return [
      msgTime(),
      userNameObj(user),
      defaultObj(UNREADY)
    ];
  };

  const newLeader = (user) => [
    msgTime(),
    userNameObj(user),
    defaultObj(' is the new'),
    keywordObj(' leader.')
  ];

  const accusation = ({ accuser, accusee, evidence: [ev1, ev2] }) => [
    msgTime(),
    userNameObj(accuser),
    defaultObj(' accuses '),
    userNameObj(accusee),
    defaultObj('! The evidence: '),
    keywordObj(ev1),
    defaultObj(' and '),
    keywordObj(ev2),
    defaultObj('.')
  ];

  const accusationWrong = (accuser) => [
    msgTime(),
    userNameObj(accuser),
    defaultObj(' is wrong!')
  ];

  const accusationRight = (accuser, accusee) => [
    msgTime(),
    userNameObj(accuser),
    defaultObj(' is correct. '),
    userNameObj(accusee),
    keywordObj(' loses!')
  ];

  const advanceTo = (stage) => {
    if (stage === 2) return [msgTime(), defaultObj('Starting Round One.')];
  };

  const gameStart = () => [
    msgTime(),
    defaultObj('Game started. Waiting for the'),
    keywordObj(' Killer'),
    defaultObj(' to select key evidence.')
  ];

  const clueChosen = (clue) => [
    msgTime(),
    defaultObj('The Ghost has chosen a clue: '),
    keywordObj(clue),
    defaultObj('.')
  ];

  return {
    userMessage,
    join, leave, ready,
    newLeader,
    advanceTo,
    gameStart,
    clueChosen,
    accusation, accusationRight, accusationWrong
  };
})();

exports.announce = announce;