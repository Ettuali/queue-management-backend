const AgentPerformance = require("../../models/manager/agentPerformanceModel");

exports.getMyPerformance = async (req, res) => {
  try {
    const agentId = req.user.id; 
    const agentStats = await AgentPerformance.getAgentLifetimePerformance(agentId);

    res.json({
      success: true,
      agent: {
        agentName: agentStats.agentName || req.user.name,
        counter: agentStats.counter || 'N/A',
        totalCalls: agentStats.ticketsServed || 0,
        served: agentStats.ticketsServed || 0,
        waiting: 0, 
        activeTime: agentStats.totalActiveTime || '00:00:00',
        breakTime: agentStats.totalBreakTime || '00:00:00',
        avgServiceTime: agentStats.avgServiceTime || '00:00:00'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getWeeklyPerformance = async (req, res) => {
  try {
    const agentId = req.user.id;
    const { range } = req.query;
    let logs;

    if (range === 'daily') {
      logs = await AgentPerformance.getAgentDailyHourlyPerformance(agentId);
      const formatted = logs.map(log => ({
        name: log.hour > 12 ? `${log.hour - 12} PM` : log.hour === 12 ? "12 PM" : log.hour === 0 ? "12 AM" : `${log.hour} AM`,
        served: parseInt(log.ticketsServed) || 0
      }));
      return res.json({ success: true, data: formatted });
    }

    const currentMonth = new Date().toISOString().slice(0, 7);
    logs = await AgentPerformance.getAgentMonthlyPerformance(agentId, currentMonth);
    const formattedData = (logs || []).map(log => ({
      name: new Date(log.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      served: parseInt(log.ticketsServed) || 0 
    }));

    res.json({ success: true, data: formattedData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getMonthlyPerformance = async (req, res) => {
  try {
    const agentId = req.user.id;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const logs = await AgentPerformance.getAgentMonthlyPerformance(agentId, currentMonth);
    const formattedData = (logs || []).map(log => ({
      name: new Date(log.date).toLocaleDateString('en-US', { day: 'numeric' }),
      served: parseInt(log.ticketsServed) || 0
    }));
    res.json({ success: true, data: formattedData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};