const Dashboard = require("../../models/agent/agentDashboardModel");

exports.getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;
    const locationId = req.user.location_id;

    const [
      session,
      currentTicket,
      waitingTickets,
      stats
    ] = await Promise.all([
      Dashboard.getActiveSession(agentId),
      Dashboard.getCurrentTicket(agentId, locationId),
      Dashboard.getWaitingTickets(locationId),
      Dashboard.getTodayStats(agentId)
    ]);

    res.json({
      success: true,
      data: {
        currentTicket,
        waitingTickets,
        stats,
        session: session
          ? {
              counter_id: session.counter_id,
              counter_name: session.counter_name,
              break_start_time: session.break_start_time
            }
          : null
      }
    });
  } catch (err) {
    console.error("Agent Dashboard Error:", err);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};
