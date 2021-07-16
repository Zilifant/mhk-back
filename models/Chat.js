const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    text: { type: String, required: true },
    createdAt: { type: String, required: true }
  },
);

const ChatSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    lobby: { type: String, required: true, ref: 'Lobby' },
    messages: [MessageSchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", MessageSchema);
module.exports = mongoose.model("Chat", ChatSchema);