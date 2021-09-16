const express = require('express');
const { check } = require('express-validator');

module.exports = () => {

  const { createLobby, getLobby } = require('../controllers/lobby-ctrl')();

  const router = express.Router();

  // create new lobby
  router.post(
    '/new',
    [ check('userName').not().isEmpty() ],
    createLobby
  );

  // get lobby (needs to know userId to recieve user/role-specific lobby/game data)
  router.post(
    '/:lobbyUrlRoute',
    getLobby
  );

  return router

}