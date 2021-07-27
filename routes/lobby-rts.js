const express = require('express');
const { check } = require('express-validator');

const lobbyControl = require('../controllers/lobby-ctrl');

const router = express.Router();

// router.get(
//   '/:lobbyUrlRoute',
//   lobbyControl.getLobby
// );

// create new lobby
router.post(
  '/new',
  [ check('userName').not().isEmpty() ],
  lobbyControl.createLobby
);

// get lobby (needs to know userId to recieve user/role-specific lobby/game data)
router.post(
  '/:lobbyUrlRoute',
  lobbyControl.getLobby
);

module.exports = router;