const router = require('express').Router();
const { lobbies } = require('../data');

const getData = async (req, res, next) => {
  console.log('getData');
  res.json({
    lobbies: lobbies
  });
};

router.get('/data', getData);

// router.post('/admin', );

module.exports = router;