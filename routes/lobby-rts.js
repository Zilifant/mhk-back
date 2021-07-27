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

router.post(
  '/:lobbyUrlRoute',
  lobbyControl.getLobby
);


module.exports = router;