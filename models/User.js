const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    userName: { type: String, required: true },
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    myLobby: { type: String, required: true, ref: 'Lobby' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);