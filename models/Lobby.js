const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const lobbySchema = new Schema(
  {
    creator: { type: String, required: false },
    _id: { type: String, required: true },
    lobbyURL: { type: String, required: true },
    members: [{ type: String, required: true, ref: 'User' }],
    chat: { type: String, required: false, ref: 'Chat' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lobby', lobbySchema);