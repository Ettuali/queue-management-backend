const Analytics = require("../models/analyticsModel");

const getAgentReport = async (req, res) => {
  try {
    const { range = 'daily' } = req.query;
    const reportData = await Analytics.getAgentDetailedReport(range);
    
    res.json({ success: true, data: reportData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getWaitTimeTrends = async (req, res) => {
  try {
    const { range = 'daily' } = req.query;
    const trends = await Analytics.getWaitTrends(range);
    
    res.json({ success: true, data: trends });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getDailySummary = async (req, res) => {
  try {
    // Daily summary is usually a snapshot of "Today"
    const summary = await Analytics.getSystemCounts(); 
    // You can also add a specific query for status breakdown (Created vs Completed)
    res.json({ success: true, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
const getSingleAgentProfile = async (req, res) => {
  try {
    const { id } = req.params; // Agent ID from URL
    const { range = 'daily' } = req.query;
    
    const profile = await Analytics.getIndividualAgentStats(id, range);
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = { getAgentReport, getWaitTimeTrends, getDailySummary, getSingleAgentProfile };