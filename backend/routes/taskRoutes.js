const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');

// Protect all task endpoints
router.use(authMiddleware);

// Retrieve tasks (admin gets all, employee gets assigned)
router.get('/', taskController.getAllTasks);

// Status update (accessible by both role controllers, checked at database logic level)
router.patch('/:id/status', taskController.updateTaskStatus);

// CRUD routes
router.post('/', restrictTo('admin'), taskController.createTask);
router.put('/:id', restrictTo('admin', 'employee'), taskController.updateTask);
router.delete('/:id', restrictTo('admin', 'employee'), taskController.deleteTask);

module.exports = router;
