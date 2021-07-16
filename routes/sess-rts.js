const express = require('express');

const router = express.Router();

router.post('/destroy', async (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;