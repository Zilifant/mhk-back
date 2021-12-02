// Admin Routes

const router = require('express').Router();

// Placeholder
const getData = async (req, res, next) => {
  res.json({ data: 'data' });
};

router.get('/data', getData);

module.exports = router;