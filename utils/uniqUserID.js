
const { customAlphabet } = require('nanoid');

const alpha = '1234567890';
const nanoid = customAlphabet(alpha, 4);

const uniqUserID = (userName) => userName + '-' + nanoid();

exports.uniqUserID = uniqUserID;