const express = require('express');
const router = express.Router();
const householdController = require('../controllers/householdController');
const requireLogin = require('../middleware/requireLogin');

// /household  → base page
router.get('/', requireLogin, householdController.showHouseholdHome);

// /household/view  → view details page
router.get('/view', requireLogin, householdController.showProfile);

// Edit form (FIXED: removed :id parameter)
router.get('/edit', requireLogin, householdController.showEditForm);

// Save edits
router.post('/update', requireLogin, householdController.updateProfile);

module.exports = router;
