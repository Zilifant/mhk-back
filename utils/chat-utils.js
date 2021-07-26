
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

// const JOIN = ' has joined.',
//       LEAVE = ' has left.',
//       READY = ' is ready.',
//       UNREADY = ' is not ready',
//       ANNOUNCE_CLS = 'announcement',
//       DEFAULT_CLS = ANNOUNCE_CLS,
//       TIMESTAMP_CLS = `${ANNOUNCE_CLS}--timestamp`,
//       USERNAME_CLS = `${ANNOUNCE_CLS}--username`,
//       KEYWORD_CLS = `${ANNOUNCE_CLS}--keyword`;

const timestamp = () => new Date().toLocaleTimeString().slice(0,-6);
const username = (userId) => userId.slice(0,-5);

const announce = (() => {

  const userMessage = (user, text) => {
    const str = `_t_${timestamp()} ^_u_${username(user)}^_m_: ${text}`;
    return parseSMD(str);
  };

  const join = (user) => {
    const str = `_t_${timestamp()} ^_u_${username(user)}^ joined.`;
    return parseSMD(str);
  };

  const leave = (user) => {
    const str = `_t_${timestamp()} ^_u_${username(user)}^ left.`;
    return parseSMD(str);
  };

  const ready = (user, ready) => {
    const str = `_t_${timestamp()} ^_u_${username(user)}^ is ${ready ? 'ready' : 'not ready'}.`;
    return parseSMD(str);
  };

  const newLeader = (user) => {
    const str = `_t_${timestamp()} ^_u_${username(user)}^ is the new leader.`;
    return parseSMD(str);
  };

  const accusation = ({ accuser, accusee, evidence: [ev1, ev2] }) => {
    const str = `_t_${timestamp()} ^_u_${username(accuser)}^ accuses ^_u_${username(accusee)}^ with evidence: ^_k_${ev1}^ and ^_k_${ev2}^.`;
    return parseSMD(str);
  };

  const accusationWrong = (accuser) => {
    const str = `_t_${timestamp()} ^_u_${username(accuser)}^ is wrong.`;
    return parseSMD(str);
  };

  const accusationRight = (accuser, accusee) => {
    const str = `_t_${timestamp()} ^_u_${username(accuser)}^ is correct! ^_u_${username(accusee)}^ is the Killer.`;
    return parseSMD(str);
  };

  const advanceTo = (stage) => {
    const str = `_t_${timestamp()} ^Starting ^_k_${stage}^.`;
    return parseSMD(str);
  }

  const gameStart = () => {
    const str = `_t_${timestamp()} ^Game started. Waiting for the Killer to select key evidence.`;
    return parseSMD(str);
  };

  const gameEnd = (reason) => {
    if (reason === 'emergencyStop') {
      const str = `_t_${timestamp()} ^The lobby leader ended the game.`;
      return parseSMD(str);
    };
    const str = `_t_${timestamp()} ^The game ended for an unknown reason.`;
    return parseSMD(str);
  };

  const clueChosen = (clue) => {
    const str = `_t_${timestamp()} ^The Ghost has chosen a clue: ^_k_${clue}^.`;
    return parseSMD(str);
  };

  const ghostAssigned = (userId) => {
    let str;
    userId ? str = `_t_${timestamp()} ^_u_${username(userId)}^ is assigned to Ghost.`
           : str = `_t_${timestamp()} ^Ghost unassigned.`;
    return parseSMD(str);
  }

  return {
    userMessage,
    join, leave, ready,
    ghostAssigned,
    newLeader,
    advanceTo,
    gameStart, gameEnd,
    clueChosen,
    accusation, accusationRight, accusationWrong
  };
})();

exports.announce = announce;
exports.parseSMD = parseSMD;