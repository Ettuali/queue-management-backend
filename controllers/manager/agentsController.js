const AgentPerformance = require('../../models/manager/agentPerformanceModel');

/**
 * MANAGER — ALL AGENTS PERFORMANCE
 */
const getAllAgentsPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const agents = await AgentPerformance.getAgentsSummaryPerformance(
      startDate,
      endDate
    );

    res.json({
      success: true,
      count: agents.length,
      agents
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

/**
 * MANAGER — SINGLE AGENT MONTHLY PERFORMANCE
 * (TEMP response until monthly model is plugged)
 */
const getAgentMonthlyByManager = async (req, res) => {
  try {
    const { agentId, month } = req.query;

    if (!agentId || !month) {
      return res.status(400).json({
        success: false,
        message: 'agentId and month are required'
      });
    }

    const data =
      await AgentPerformance.getAgentMonthlyPerformance(agentId, month);

    res.json({
      success: true,
      agentId,
      month,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};


module.exports = {
  getAllAgentsPerformance,
  getAgentMonthlyByManager
};
