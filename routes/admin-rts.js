
const router = require('express').Router();
const { LOBBIES } = require('../utils/utils');

const getData = async (req, res, next) => {
  res.json({
    lobbies: LOBBIES
  });
};

router.get('/data', getData);

module.exports = router;