const KPI = require("../../models/manager/kpiModel");

const getKPIs = async (req, res) => {
  try {
    const role = req.user.role;

    // MANAGER / ADMIN → cross-branch OR specific branch
    // AGENT → forced to own branch
    const locationId =
      role === "MANAGER" || role === "ADMIN"
        ? req.query.location_id ?? null
        : req.user.location_id;

    const data = await KPI.getKPIs(locationId);

    res.json({
      success: true,
      scope: locationId ? "BRANCH" : "ALL",
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
  getKPIs
};
