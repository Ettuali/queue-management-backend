const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');

// This will map to: /api/admin/analytics/dashboard-stats
router.get('/dashboard-stats', analyticsController.getFullAdminDashboard);

// If you want a "Live Pulse" API later, it would be: /api/admin/analytics/pulse
// router.get('/pulse', analyticsController.getLivePulse);

module.exports = router;