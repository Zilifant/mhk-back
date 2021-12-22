// Lobby Routes

const express = require('express');
const { check } = require('express-validator');

module.exports = () => {

  const router = express.Router();
  const { createLobby, getLobby } = require('../controllers/lobby-ctrl')();

  router.post(
    '/new',
    [ check('userName').not().isEmpty() ],
    createLobby
  );

  router.post(
    '/get',
    getLobby
  );

  return router;
};