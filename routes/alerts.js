const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');

router.get('/', requireLogin, (req, res) => {
  res.render('alerts', {
    user: req.user,
    currentPage: 'alerts'
  });
});

module.exports = router;