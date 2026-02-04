const express = require("express");
const router = express.Router();

const verifyToken = require("../middleware/authMiddleware");
const dashboardController = require("../controllers/agent/agentDashboardController");

router.get(
  "/dashboard",
  verifyToken,
  dashboardController.getAgentDashboard
);

module.exports = router;
