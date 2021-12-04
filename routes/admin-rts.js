// Admin Routes

const router = require('express').Router();
const { LOBBIES } = require('../utils/utils');

// Temporary implementation.
const getLobbies = async (req, res, next) => {
  res.json({ lobbies: LOBBIES });
};

router.get('/lobbies', getLobbies);

module.exports = router;