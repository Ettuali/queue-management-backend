const ServicePerformance = require('../../models/manager/servicePerformanceModel');

const getServicePerformance = async (req, res) => {
  try {
    const services = await ServicePerformance.getServicePerformance();

    res.json({
      success: true,
      count: services.length,
      services
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

module.exports = { getServicePerformance };
