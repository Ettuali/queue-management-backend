const SupervisorAgent = require('../models/supervisorAgentModel');

const getAgentStatusToday = async (req, res) => {
  try {
    const locationId = req.user.location_id;

    const agents = await SupervisorAgent.getSupervisorAgentStatusToday(locationId);

    res.json({
      success: true,
      date: new Date().toISOString().slice(0, 10),
      count: agents.length,
      agents
    });

  } catch (err) {
    console.error("Supervisor Agent Status Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

module.exports = { getAgentStatusToday };
