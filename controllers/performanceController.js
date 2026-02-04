const AgentPerformance = require("../models/manager/agentPerformanceModel");
const Session = require("../models/agentSessionModel");

const getMyPerformance = async (req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const agentId = req.user.id;

    // 1. Get Ticket Stats (Served, Waiting, etc.)
    const agents = await AgentPerformance.getAdminAgentPerformance(
      today,
      today,
      agentId,
    );

    // 2. Get Today's Session Info (Break Time, Login Time)
    const activeSession = await Session.getActiveSession(agentId);

    // Fallback if no session found
    const agentStats = agents[0] || {};

    res.json({
      success: true,
      agent: {
        agentName: req.user.name,
        counter: activeSession ? `Counter ${activeSession.counter_id}` : "N/A",
        totalCalls: agentStats.totalCalls || 0,
        served: agentStats.served || 0,
        waiting: agentStats.waiting || 0,
        // We calculate active time if they are logged in
        activeTime: activeSession ? "Active Now" : "Logged Out",
        breakTime: activeSession
          ? `${activeSession.total_break_minutes} mins`
          : "0 mins",
        avgServiceTime: agentStats.avgServiceTime || "00:00:00",
      },
    });
  } catch (err) {
    console.error("Agent POV Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getWeeklyPerformance = async (req, res) => {
  try {
    const agentId = req.user.id;
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const startDateStr = startDate.toISOString().split("T")[0];

    const logs = await AgentPerformance.getAdminAgentPerformance(
      startDateStr,
      endDate,
      agentId,
    );

    // Ensure we return an array for Recharts
    const formattedData = (logs || []).map((log) => ({
      name: log.date
        ? new Date(log.date).toLocaleDateString("en-US", { weekday: "short" })
        : "Day",
      served: parseInt(log.served) || 0,
    }));

    res.json({ success: true, data: formattedData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getMonthlyPerformance = async (req, res) => {
  try {
    const agentId = req.user.id;
    const endDate = new Date().toISOString().split("T")[0];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = startDate.toISOString().split("T")[0];

    const logs = await AgentPerformance.getAdminAgentPerformance(
      startDateStr,
      endDate,
      agentId,
    );

    res.json({ success: true, data: logs || [] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getMyPerformance,
  getWeeklyPerformance,
  getMonthlyPerformance,
};
