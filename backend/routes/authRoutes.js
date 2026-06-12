const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public route for authentication
router.post('/login', authController.login);

// Protected route to update credentials
router.put('/profile', authMiddleware, authController.updateProfile);

module.exports = router;
