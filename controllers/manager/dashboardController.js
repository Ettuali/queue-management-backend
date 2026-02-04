const KPI = require('../../models/manager/kpiModel');
const BranchPerformance = require('../../models/manager/branchPerformanceModel');
const ServicePerformance = require('../../models/manager/servicePerformanceModel');
const AgentPerformance = require('../../models/manager/agentPerformanceModel');

const getManagerDashboard = async (req, res) => {
  try {
    // Optional debug
    console.log('USER:', req.user);

    const locationId = req.query.location_id ?? null;

    // 1️⃣ KPIs
    const kpis = await KPI.getKPIs(locationId);

    // 2️⃣ Branch performance
    const branches = await BranchPerformance.getBranchPerformance();

    // 3️⃣ Service performance
    const services = await ServicePerformance.getServicePerformance();

    // 4️⃣ Agent performance
    const agents = await AgentPerformance.getAgentsSummaryPerformance();

    const topAgents = agents
      .sort((a, b) => Number(b.served) - Number(a.served))
      .slice(0, 5);

    res.json({
      success: true,
      scope: locationId ? 'BRANCH' : 'ALL',
      kpis,
      agents: {
        summary: {
          totalCalls: agents.reduce((s, a) => s + Number(a.totalCalls || 0), 0),
          totalServed: agents.reduce((s, a) => s + Number(a.served || 0), 0)
        },
        topAgents
      },
      branches,
      services
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

module.exports = { getManagerDashboard };
