const Supervisor = require('../models/supervisorModel');

const getLiveQueueDashboard = async (req, res) => {
  try {
    const locationId = req.user.location_id;

    const data = await Supervisor.getLiveQueueDashboard(locationId);

    res.json({
      success: true,
      message: "Supervisor Live Queue Dashboard",
      data
    });

  } catch (err) {
    console.error("Supervisor Dashboard Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

const getSupervisorReports = async (req, res) => {
  try {
    const locationId = req.user.location_id;
    const range = req.query.range || 'today';

    const data = await Supervisor.getBranchReports(locationId, range);

    res.json({
      success: true,
      range,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};



module.exports = { getLiveQueueDashboard, getSupervisorReports };
