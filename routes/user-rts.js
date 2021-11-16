
const express = require('express');

const userControl = require('../controllers/user-ctrl');

const router = express.Router();

router.post(
  '/new',
  userControl.addUserToLobby
);

router.get(
  '/session',
  userControl.checkForCookie
);

module.exports = router;