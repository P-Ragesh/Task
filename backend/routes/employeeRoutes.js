const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// Protect all routes under employees
router.use(authMiddleware);

router.get('/', restrictTo('admin', 'employee'), employeeController.getAllEmployees);
router.get('/validate-email', restrictTo('admin', 'employee'), employeeController.validateEmailRealWorld);
router.post('/', restrictTo('admin'), employeeController.createEmployee);
router.put('/:id', restrictTo('admin'), employeeController.updateEmployee);
router.delete('/:id', restrictTo('admin', 'employee'), employeeController.deleteEmployee);
router.post('/:id/reset-password', restrictTo('admin'), employeeController.resetEmployeePassword);

module.exports = router;
