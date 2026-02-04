const express = require('express');
const router = express.Router();

const sessionController = require('../controllers/agentSessionController');
const verifyToken = require('../middleware/authMiddleware');

const performanceController = require("../controllers/performanceController");

// Session Management
router.post('/login', verifyToken, sessionController.loginAgent);
router.post('/logout', verifyToken, sessionController.logoutAgent);
router.get('/status', verifyToken, sessionController.getSessionStatus);

// Break Management
router.post('/break/start', verifyToken, sessionController.startBreak);
router.post('/break/end', verifyToken, sessionController.endBreak);
router.get(
  '/performance',
  verifyToken,
  performanceController.getMyPerformance
);


module.exports = router;
