
const express = require('express');
const router = express.Router();
const userControl = require('../controllers/user-ctrl');

router.post(
  '/new',
  userControl.addUserToLobby
);

router.get(
  '/cookie',
  userControl.checkForCookie
);

module.exports = router;