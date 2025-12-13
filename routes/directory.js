const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directoryController');
const requireLogin = require('../middleware/requireLogin');

router.get('/map-test', (req, res) => {
  res.send('map route works');
});
router.get('/', requireLogin, directoryController.listHouseholds);
router.get('/map', requireLogin, directoryController.showMap);
router.get('/map/data', requireLogin, directoryController.getMapData);

module.exports = router;