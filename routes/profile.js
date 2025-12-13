const express = require('express');
const router = express.Router();
const requireLogin = require('../middleware/requireLogin');
const profileController = require('../controllers/profileController');

router.get('/', requireLogin, profileController.showProfile);
router.post('/', requireLogin, profileController.updateProfile); // FIXED: Changed from /update to /

module.exports = router;
