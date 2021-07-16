const router = require('express').Router();

const chatControl = require('../controllers/chat-ctrl');

router.get(
  '/:chatId/messages',
  chatControl.getChatMessages
);

router.post(
  '/:chatId/newmessage',
  chatControl.newChatMessage
);

module.exports = router;

//new conv

// router.post("/", async (req, res) => {
//   const newChat = new Chat({
//     members: [req.body.senderId, req.body.receiverId],
//   });

//   try {
//     const savedChat = await newChat.save();
//     res.status(200).json(savedChat);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

//get conv of a user

// router.get("/:userId", async (req, res) => {
//   try {
//     const chat = await Chat.find({
//       members: { $in: [req.params.userId] },
//     });
//     res.status(200).json(chat);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// get conv bt two specific users

// router.get("/find/:firstUserId/:secondUserId", async (req, res) => {
//   try {
//     const chat = await Chat.findOne({
//       members: { $all: [req.params.firstUserId, req.params.secondUserId] },
//     });
//     res.status(200).json(chat)
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

module.exports = router;