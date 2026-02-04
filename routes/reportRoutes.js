const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Note: verifyToken is already applied in the main router, 
// so you don't need to repeat it here.
router.get('/agents', reportController.getAgentReport);
router.get('/agents/:id', reportController.getSingleAgentProfile); // 🔥 Add this for the 'View' button
router.get('/wait-trends', reportController.getWaitTimeTrends);
router.get('/daily-summary', reportController.getDailySummary);

module.exports = router;