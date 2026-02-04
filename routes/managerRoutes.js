const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/authMiddleware');

// Manager controllers
const dashboardController = require('../controllers/manager/dashboardController');
const agentsController = require('../controllers/manager/agentsController');
const kpiController = require('../controllers/manager/kpiController');
const branchController = require('../controllers/manager/branchController');
const serviceController = require('../controllers/manager/serviceController');

// =========================
// MANAGER — DASHBOARD
// =========================
router.get(
  '/dashboard',
  verifyToken,
  dashboardController.getManagerDashboard
);

// =========================
// MANAGER — AGENTS
// =========================

// All agents (ranking, least performers, etc.)
router.get(
  '/agents',
  verifyToken,
  agentsController.getAllAgentsPerformance
);

// Single agent — monthly drill-down
router.get(
  '/agents/performance/monthly',
  verifyToken,
  agentsController.getAgentMonthlyByManager
);

// =========================
// MANAGER — ANALYTICS
// =========================
router.get(
  '/kpis',
  verifyToken,
  kpiController.getKPIs
);

router.get(
  '/branches',
  verifyToken,
  branchController.getBranchPerformance
);

router.get(
  '/services',
  verifyToken,
  serviceController.getServicePerformance
);

module.exports = router;
