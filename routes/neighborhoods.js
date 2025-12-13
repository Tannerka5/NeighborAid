const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');

router.get('/', requireLogin, (req, res) => {
  res.render('neighborhoods', {
    user: req.user,
    currentPage: 'neighborhoods'
  });
});

module.exports = router;