const BranchPerformance = require('../../models/manager/branchPerformanceModel');

const getBranchPerformance = async (req, res) => {
  try {
    const branches = await BranchPerformance.getBranchPerformance();

    res.json({
      success: true,
      count: branches.length,
      branches
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

module.exports = { getBranchPerformance };
