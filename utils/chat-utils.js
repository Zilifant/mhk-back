
const { parseSMD } = require('./utils');

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
    const str = `_t_${timestamp()} ^_u_${username(accuser)}^ accuses ^_u_${username(accusee)}^! with evidence: ^_k_${ev1}^ and ^_k_${ev2}^.`;
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

  return {
    userMessage,
    join, leave, ready,
    newLeader,
    advanceTo,
    gameStart, gameEnd,
    clueChosen,
    accusation, accusationRight, accusationWrong
  };
})();

exports.announce = announce;