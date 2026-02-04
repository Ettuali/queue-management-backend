const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const verifyToken = require('../middleware/authMiddleware');

// Login
router.post('/login', authController.login);

// Logout (Protected)
router.post('/logout', verifyToken, authController.logout);

module.exports = router;
