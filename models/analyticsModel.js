const db = require("../config/db");

const Analytics = {
  // 1. Get Global Counts
  getSystemCounts: async () => {
    const [rows] = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM tickets) as totalTickets,
        (SELECT COUNT(*) FROM tickets WHERE status = 'COMPLETED') as completedTickets,
        (SELECT COUNT(*) FROM locations) as totalBranches,
        (SELECT COUNT(*) FROM users WHERE role_id = 2) as totalAgents,
        (SELECT COUNT(*) FROM counters WHERE status = 'active') as activeCounters
    `);
    return rows[0];
  },

  // 2. Get Periodic Trends (Dashboard)
  getTrends: async (period) => {
    let dateFormat = "%Y-%m-%d";
    let interval = "7 DAY";

    if (period === "monthly") {
      dateFormat = "%b %d";
      interval = "30 DAY";
    } else if (period === "yearly") {
      dateFormat = "%M";
      interval = "1 YEAR";
    }

    const [rows] = await db.query(
      `
      SELECT DATE_FORMAT(created_at, ?) as label, COUNT(*) as value
      FROM tickets
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY label
      ORDER BY MIN(created_at) ASC
    `,
      [dateFormat],
    );
    return rows;
  },

  // 3. Performance Rankings
  getRankings: async () => {
    const [agents] = await db.query(`
      SELECT u.name, COUNT(t.id) as served, 
      ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.started_at, t.completed_at)), 1) as avgServiceTime
      FROM users u
      JOIN tickets t ON u.id = t.agent_id
      WHERE t.status = 'COMPLETED'
      GROUP BY u.id ORDER BY served DESC LIMIT 5
    `);

    const [branches] = await db.query(`
      SELECT l.name, COUNT(t.id) as volume,
      ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.called_at)), 1) as avgWait
      FROM locations l
      LEFT JOIN tickets t ON l.id = t.location_id
      GROUP BY l.id ORDER BY volume DESC
    `);

    return { agents, branches };
  },

  // 4. Manager Performance
  getManagerPerformance: async () => {
    const [rows] = await db.query(`
      SELECT 
        u.name AS managerName,
        COALESCE(l.name, 'Global / All Branches') AS branchName,
        (SELECT COUNT(*) FROM users WHERE location_id = l.id AND role_id = 2) as staffCount,
        COUNT(t.id) as totalTickets,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.called_at)), 1) as avgWaitTime,
        SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END) as completedTickets
      FROM users u
      LEFT JOIN locations l ON u.location_id = l.id
      LEFT JOIN tickets t ON (u.location_id IS NULL OR t.location_id = u.location_id)
      WHERE u.role_id = 4 
      GROUP BY u.id, l.id
      ORDER BY totalTickets DESC
    `);
    return rows;
  },

  // 5. Agent List Report (Main Table)
  getAgentDetailedReport: async (range) => {
    let interval = "1 DAY";
    if (range === "weekly") interval = "7 DAY";
    else if (range === "monthly") interval = "30 DAY";
    else if (range === "yearly") interval = "1 YEAR";

    const [rows] = await db.query(`
      SELECT 
        u.id, u.name as agentName, COALESCE(l.name, 'Floating') as branchName,
        COUNT(t.id) as ticketsServed,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.started_at, t.completed_at)), 1) as avgServiceTime
      FROM users u
      LEFT JOIN tickets t ON u.id = t.agent_id AND t.status = 'COMPLETED' AND t.completed_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.role_id = 2 
      GROUP BY u.id, l.id
    `);
    return rows;
  },

  // 6. Wait Trends
  getWaitTrends: async (range) => {
    let format = "%H:00";
    let interval = "1 DAY";
    if (range === "weekly") {
      format = "%W";
      interval = "7 DAY";
    } else if (range === "monthly") {
      format = "%b %d";
      interval = "30 DAY";
    } else if (range === "yearly") {
      format = "%M";
      interval = "1 YEAR";
    }

    const [rows] = await db.query(
      `
      SELECT DATE_FORMAT(created_at, ?) as label, ROUND(AVG(TIMESTAMPDIFF(MINUTE, created_at, called_at)), 1) as avgWait
      FROM tickets WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY label ORDER BY MIN(created_at) ASC
    `,
      [format],
    );
    return rows;
  },

  // 7. NEW: Individual Agent Drill-Down (The fix for the "View" button)
  getIndividualAgentStats: async (agentId, range) => {
    let interval = "1 DAY";
    let dateFormat = "%H:00";

    if (range === "weekly") {
      interval = "7 DAY";
      dateFormat = "%W";
    } else if (range === "monthly") {
      interval = "30 DAY";
      dateFormat = "%b %d";
    } else if (range === "yearly") {
      interval = "1 YEAR";
      dateFormat = "%M";
    }

    const [summary] = await db.query(
      `
      SELECT u.name, u.email, COALESCE(l.name, 'Floating') as branch,
        COUNT(t.id) as totalServed,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.started_at, t.completed_at)), 1) as avgSpeed
      FROM users u
      LEFT JOIN tickets t ON u.id = t.agent_id AND t.status = 'COMPLETED' AND t.completed_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      LEFT JOIN locations l ON u.location_id = l.id
      WHERE u.id = ? GROUP BY u.id, l.name
    `,
      [agentId],
    );

    const [trend] = await db.query(
      `
      SELECT DATE_FORMAT(completed_at, ?) as label, COUNT(*) as value
      FROM tickets
      WHERE agent_id = ? AND status = 'COMPLETED' AND completed_at >= DATE_SUB(NOW(), INTERVAL ${interval})
      GROUP BY label ORDER BY MIN(completed_at) ASC
    `,
      [dateFormat, agentId],
    );

    return { summary: summary[0], trend };
  },
};

module.exports = Analytics;
