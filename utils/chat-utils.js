const { GAME_OUTCOMES } = require('../utils/constants');

function parseSMDString({str, meta}, opts) {
  const defStyle = opts.default || 'default';
  const st = opts.splitTextOn || '^';
  const sc = opts.splitClsOn || '_';
  const metaData = { metaData: meta }

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
  return [metaData, ...result];
};

const SMDopts = {
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

const parseSMD = ({str, meta}) => {
  return parseSMDString({str, meta}, SMDopts);
};

const ts = () => new Date().toLocaleTimeString().slice(0,-6);
const name = (userId) => userId.slice(0,-5);
const meta = 'announce';

const announce = (() => {

  const welcome = (lobby) => {
    const lobbyId = lobby === 'z' ? 'splendid-monolith-9978' : lobby
    const str = `_t_${ts()} ^_m_Welcome to ^_k_${lobbyId}^.`;
    return parseSMD({str, meta});
  }

  const userMessage = (user, text) => {
    const str = `_t_${ts()} ^_u_${name(user)}^_m_: ${text}`;
    const meta = 'user-message'
    return parseSMD({str, meta});
  };

  const join = (user) => {
    const str = `_t_${ts()} ^_u_${name(user)}^ joined.`;
    return parseSMD({str, meta});
  };

  const leave = (user, newLeader) => {
    let str;
    !!newLeader ? str = `_t_${ts()} ^_u_${name(user)}^ left; ^_u_${name(newLeader)}^ is the new leader.`
                : str = `_t_${ts()} ^_u_${name(user)}^ left.`;
    return parseSMD({str, meta});
  };

  const ready = (user, ready) => {
    const str = `_t_${ts()} ^_u_${name(user)}^ is ${ready ? 'ready' : 'not ready'}.`;
    return parseSMD({str, meta});
  };

  const newLeader = (user) => {
    const str = `_t_${ts()} ^_u_${name(user)}^ is the new leader.`;
    return parseSMD({str, meta});
  };

  const accusation = ({ accuser, accusee, evidence: [ev1, ev2] }) => {
    const str = `_t_${ts()} ^_u_${name(accuser)}^ accuses ^_u_${name(accusee)}^ with evidence: ^_k_${ev1}^ and ^_k_${ev2}^.`;
    return parseSMD({str, meta});
  };

  const accusationWrong = (accuser) => {
    const str = `_t_${ts()} ^_u_${name(accuser)}^ is wrong.`;
    return parseSMD({str, meta});
  };

  const accusationRight = (accuser, accusee) => {
    const str = `_t_${ts()} ^_u_${name(accuser)}^ is correct! ^_u_${name(accusee)}^ is the Killer.`;
    return parseSMD({str, meta});
  };

  const advanceTo = (stage) => {
    let str;
    switch (stage.id) {
      case 'setup':
        str = `_t_${ts()} ^Game started. Waiting for the Killer to select key evidence...`;
        break;
      case 'round-1':
        str = `_t_${ts()} ^The Killer has chosen key evidence. ^_k_${stage.display}^ started.`;
        break;
      case 'round-2-start':
        str = `_t_${ts()} ^Starting ^_k_${stage.display}^. Waiting for the Ghost to choose a new scene...`;
        break;
      case 'round-2':
        str = `_t_${ts()} ^The Ghost has selected a new scene. ^_k_${stage.display}^ started.`;
        break;
      case 'round-3-start':
        str = `_t_${ts()} ^Starting ^_k_${stage.display}^. Waiting for the Ghost to choose a new scene...`;
        break;
      case 'round-3':
        str = `_t_${ts()} ^The Ghost has selected a new scene. ^_k_${stage.display}^ started.`;
        break;
      case 'second-murder':
        str = `_t_${ts()} ^The Killer has been identified. But they can still win if they identify the Witness...`;
        break;
      case 'game-over': // should never get called
        str = `${stage.display}`
        break;
      default: break;
    }
    return parseSMD({str, meta});
  };

  const clearGame = () => {
    const str = `_t_${ts()} ^The lobby leader ended the game.`;
    return parseSMD({str, meta});
  };

  const clueChosen = (clue) => {
    const str = `_t_${ts()} ^The Ghost has chosen a clue: ^_k_${clue}^.`;
    return parseSMD({str, meta});
  };

  const ghostAssigned = (userId, unAssign) => {
    let str;
    unAssign ? str = `_t_${ts()} ^Ghost unassigned.`
             : str = `_t_${ts()} ^_u_${name(userId)}^ is assigned to Ghost.`;
    return parseSMD({str, meta});
  };

  const resolveGame = (result) => {
    const str = `_t_${ts()} ^Result: ^_k_${GAME_OUTCOMES[result]}`;
    return parseSMD({str, meta});
  };

  return {
    userMessage,
    welcome,
    join, leave, ready,
    ghostAssigned,
    newLeader,
    advanceTo,
    resolveGame, clearGame,
    clueChosen,
    accusation, accusationRight, accusationWrong
  };
})();

exports.announce = announce;
exports.parseSMD = parseSMD;