// agentRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware');
const performanceController = require('../controllers/agent/performanceController');

// Standardized Agent POV Routes
router.get('/performance', verifyToken, performanceController.getMyPerformance);
router.get('/performance/weekly', verifyToken, performanceController.getWeeklyPerformance);
router.get('/performance/monthly', verifyToken, performanceController.getMonthlyPerformance);

module.exports = router;