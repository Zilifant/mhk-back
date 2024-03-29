// Admin Routes

const express = require('express');
const router = express.Router();
const { LOBBIES } = require('../utils/utils');
const { sendNodeHttpsRequest } = require('../utils/sendNodeHttpsRequest');

// Temporary implementation.
const getLobbies = async (req, res, next) => {
  res.json({ lobbies: LOBBIES });
};

// ***** Not used by MHK app. *****
// Used by personal portfolio website to fetch content from JSON database.
const getPortfolio = async (req, res, next) => {
  sendNodeHttpsRequest(
    {
      hostname: 'api.jsonbin.io',
      path: `/v3/b/${process.env.PORTFOLIO_BIN_ID}/latest`,
      headers: { 'X-Master-Key': process.env.JSIO_KEY },
    },
    (data) => res.json({ data }),
  );
};

const getCookies = async (req, res, next) => {
  const cookies = req.get('Cookie');
  console.log('cookies:', cookies);

  res.json({ cookies: cookies });
};

router.get('/lobbies', getLobbies);
router.get('/portfolio', getPortfolio);
router.get('/cookies', getCookies);

module.exports = router;
