// Unique User ID
// Appends '-' + four random numbers to the given username.

const { customAlphabet } = require('nanoid');

const nanoid = customAlphabet('1234567890', 4);

const uniqUserID = (userName) => userName + '-' + nanoid();

exports.uniqUserID = uniqUserID;