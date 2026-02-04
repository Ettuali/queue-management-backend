const Analytics = require("../models/analyticsModel");

// controllers/analyticsController.js

const getFullAdminDashboard = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;

    const [counts, trends, rankings, managerPerformance] = await Promise.all([
      Analytics.getSystemCounts(),
      Analytics.getTrends(period),
      Analytics.getRankings(),
      Analytics.getManagerPerformance() // New Query
    ]);

    res.json({
      success: true,
      summary: counts,
      trends,
      rankings,
      managerPerformance // Data for the new UI section
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getFullAdminDashboard };