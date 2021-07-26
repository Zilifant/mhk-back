
const { customAlphabet } = require('nanoid');

const alpha = '1234567890';
const nanoid = customAlphabet(alpha, 4);

const uniqUserID = (userName) => {
  if (userName === 'a') return 'Ali-0000';
  if (userName === 's') return 'Ainsley-0000';
  if (userName === 'd') return 'Amber-0000';
  return userName + '-' + nanoid();
};

exports.uniqUserID = uniqUserID;