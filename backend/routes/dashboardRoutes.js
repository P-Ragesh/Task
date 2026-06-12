const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Admin exclusive analytics
router.get('/admin', restrictTo('admin'), dashboardController.getAdminDashboardStats);

// Employee exclusive metrics
router.get('/employee', restrictTo('employee'), dashboardController.getEmployeeDashboardStats);

module.exports = router;
