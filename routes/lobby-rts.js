// Lobby Routes

const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const lobbyControl = require('../controllers/lobby-ctrl');

router.post(
  '/new',
  [ check('userName').not().isEmpty() ],
  lobbyControl.createLobby
);

router.post(
  '/get',
  lobbyControl.getLobby
);

module.exports = router;