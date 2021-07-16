const express = require('express');
const { check } = require('express-validator');

const landingControl = require('../controllers/landing-ctrl');

const router = express.Router();

// create new lobby
router.post(
  '/',
  [ check('userName').not().isEmpty() ],
  landingControl.createLobby
);

module.exports = router;