const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => res.render('login'));
router.get('/register', (req, res) => res.render('register'));
router.get('/dashboard', (req, res) => res.render('dashboard', {
    user: { firstName: 'Demo', lastName: 'User', household: {}, },
    resources: [],
    neighborhoods: [],
    householdMembers: []
}));
router.get('/household', (req, res) => res.render('household', { user: { firstName: 'Demo' }, household: {} }));
router.get('/resources', (req, res) => res.render('resources', { user: { firstName: 'Demo' }, resources: [] }));
router.get('/resources/add', (req, res) => res.render('resource-form', { user: { firstName: 'Demo' }, resourceTypes: [], isEdit: false }));
router.get('/directory', (req, res) => res.render('directory', { user: { firstName: 'Demo' }, households: [], neighborhoods: [] }));

module.exports = router;
