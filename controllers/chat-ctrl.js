const Chat = require('../models/Chat');
const HttpError = require('../models/HttpError');

const getChatMessages = async (req, res, next) => {
  console.log('getChatMessages');

  let chat;
  try {
    chat = await Chat.findById(req.params.chatId);
  } catch (err) {
    const error = new HttpError('Could not retrieve messages.', 500);
    return next(error);
  };
  res.status(200).json(chat.messages);
};

const newChatMessage = async (req, res, next) => {
  console.log('newChatMessage');

  let chat;
  try {
    chat = await Chat.findById(req.params.chatId);
  } catch (err) {
    const error = new HttpError('Error finding chat in database.', 500);
    return next(error);
  };

  try {
    chat.messages.push(req.body);
    chat.save()
    // console.log(chat.messages[(chat.messages.length-1)].toObject({getters: true}));
    res.status(200).json(req.body);
  } catch (err) {
    const error = new HttpError('Error saving message to database.', 500);
    return next(error);
  };
};

exports.getChatMessages = getChatMessages;
exports.newChatMessage = newChatMessage;