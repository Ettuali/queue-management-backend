const express = require('express');
const router = express.Router();

const supervisorController = require('../controllers/supervisorController');
const supervisorAgentController = require('../controllers/supervisorAgentController');
const verifyToken = require('../middleware/authMiddleware');

// Live Queue Dashboard
router.get(
  '/dashboard',
  verifyToken,
  supervisorController.getLiveQueueDashboard
);

// Supervisor Agent Status (TODAY)
router.get(
  '/agents/status',
  verifyToken,
  supervisorAgentController.getAgentStatusToday
);

// ✅ ADD THIS — Supervisor Reports (Today / Week / Month)
router.get(
  '/reports',
  verifyToken,
  supervisorController.getSupervisorReports
);

module.exports = router;
