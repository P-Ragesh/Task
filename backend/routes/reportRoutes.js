const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// Restrict all reports endpoints to authenticated Admin accounts
router.use(authMiddleware);
router.use(restrictTo('admin'));

router.get('/filtered', reportController.getFilteredReport);
router.get('/export', reportController.exportCSVReport);

module.exports = router;
