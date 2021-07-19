
const JOIN = ' has joined.',
      LEAVE = ' has left.',
      READY = ' is ready.',
      UNREADY = ' is not ready',
      ANNOUNCE_CLS = 'announcement',
      DEFAULT_CLS = ANNOUNCE_CLS,
      USERNAME_CLS = `${ANNOUNCE_CLS}--username`,
      KEYWORD_CLS = `${ANNOUNCE_CLS}--keyword`

// function styledTextElement(text, style) {
//   return { text: text, style: style };
// };

function userNameObj(username) {
  return { text: username, style: USERNAME_CLS };
};

function defaultObj(text) {
  return { text: text, style: DEFAULT_CLS };
};

function keywordObj(keyword) {
  return { text: keyword, style: KEYWORD_CLS };
}

const announce = (() => {

  const join = (user) => [userNameObj(user), defaultObj(JOIN)];

  const leave = (user) => [userNameObj(user), defaultObj(LEAVE)];

  const ready = (user) => [userNameObj(user), defaultObj(READY)];

  const unready = (user) => [userNameObj(user), defaultObj(UNREADY)];

  const accusation = ({ accuser, accusee, evidence: [ev1, ev2] }) => [
    userNameObj(accuser),
    defaultObj(' accuses '),
    userNameObj(accusee),
    defaultObj('! The evidence: '),
    keywordObj(ev1),
    defaultObj(' and '),
    keywordObj(ev2),
    defaultObj('.')
  ];

  return {
    join,
    leave,
    ready,
    unready,
    accusation
  };
})();

exports.announce = announce;