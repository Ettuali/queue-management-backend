const db = require('../config/db');

const getLiveQueueDashboard = async (locationId) => {

  // Waiting tickets (branch-specific)
  const [waiting] = await db.query(`
    SELECT *
    FROM tickets
    WHERE status = 'WAITING'
      AND location_id = ?
    ORDER BY created_at ASC
  `, [locationId]);

  // Active tickets (branch-specific)
  const [active] = await db.query(`
    SELECT *
    FROM tickets
    WHERE status IN ('CALLED', 'SERVING')
      AND location_id = ?
    ORDER BY called_at ASC
  `, [locationId]);

  // Counters load (branch-specific)
  const [counters] = await db.query(`
    SELECT 
      c.id,
      c.name,
      c.status,
      COUNT(t.id) AS waitingCount,
      CASE 
        WHEN EXISTS (
          SELECT 1 FROM tickets t2
          WHERE t2.counter_id = c.id 
            AND t2.status IN ('CALLED','SERVING')
        ) THEN 'BUSY'
        ELSE 'FREE'
      END AS load_status
    FROM counters c
    LEFT JOIN tickets t 
      ON t.counter_id = c.id 
     AND t.status = 'WAITING'
     AND t.location_id = ?
    WHERE c.location_id = ?
    GROUP BY c.id
  `, [locationId, locationId]);

  // Live agents (branch-specific)
  const [agents] = await db.query(`
    SELECT 
      u.id AS agentId,
      u.name AS agentName,
      c.name AS counter,
      CASE
        WHEN s.logout_time IS NOT NULL THEN 'OFFLINE'
        WHEN s.break_start_time IS NOT NULL THEN 'ON BREAK'
        WHEN s.agent_id IS NOT NULL THEN 'ACTIVE'
        ELSE 'OFFLINE'
      END AS status,
      t.ticket_number
    FROM users u
    LEFT JOIN agent_sessions s 
      ON u.id = s.agent_id 
     AND s.logout_time IS NULL
     AND s.location_id = ?
    LEFT JOIN tickets t 
      ON t.agent_id = u.id 
     AND t.status IN ('CALLED','SERVING')
     AND t.location_id = ?
    LEFT JOIN counters c 
      ON s.counter_id = c.id
    WHERE u.role_id = 2
      AND u.location_id = ?
  `, [locationId, locationId, locationId]);

  // Queue health (branch-specific)
  const [[health]] = await db.query(`
    SELECT 
      COUNT(CASE WHEN status = 'WAITING' THEN 1 END) AS totalWaiting,
      COUNT(CASE WHEN status IN ('CALLED','SERVING') THEN 1 END) AS activeTickets,
      AVG(
        CASE 
          WHEN called_at IS NOT NULL 
          THEN TIMESTAMPDIFF(SECOND, created_at, called_at)
        END
      ) AS avgWaitTime
    FROM tickets
    WHERE location_id = ?
  `, [locationId]);

  return {
    waitingTickets: waiting,
    activeTickets: active,
    countersLoad: counters,
    agentsStatus: agents,
    queueHealth: {
      totalWaiting: health.totalWaiting || 0,
      activeTickets: health.activeTickets || 0,
      avgWaitTime: Math.round(health.avgWaitTime || 0),
      queueStatus:
        health.totalWaiting > 10 ? "HIGH LOAD" :
        health.totalWaiting > 5 ? "MODERATE LOAD" :
        "NORMAL"
    }
  };
};

const getBranchReports = async (locationId, range) => {
  let dateCondition = '';
  let selectTime = '';

  switch (range) {
    case 'today':
      dateCondition = 'DATE(t.created_at) = CURDATE()';
      selectTime = 'DATE_FORMAT(t.created_at, "%H:00") AS time';
      break;
    case 'week':
      dateCondition = 't.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      selectTime = 'DAYNAME(t.created_at) AS time';
      break;
    case 'month':
      // Updated to show the last 30 days so your Jan 28-30 data shows up
      dateCondition = 't.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
      selectTime = 'DATE_FORMAT(t.created_at, "%d %b") AS time';
      break;
    default:
      dateCondition = 'DATE(t.created_at) = CURDATE()';
      selectTime = 'DATE_FORMAT(t.created_at, "%H:00") AS time';
  }

  // 1. Get Summary Cards
  const [summaryRows] = await db.query(`
    SELECT
      COUNT(t.id) AS totalTickets,
      COUNT(CASE WHEN t.status = 'COMPLETED' THEN 1 END) AS served,
      COUNT(CASE WHEN t.status = 'WAITING' THEN 1 END) AS waiting,
      COUNT(CASE WHEN t.status = 'CANCELLED' THEN 1 END) AS cancelled,
      AVG(CASE WHEN t.called_at IS NOT NULL THEN TIMESTAMPDIFF(SECOND, t.created_at, t.called_at) END) AS avgWaitTime
    FROM tickets t
    WHERE t.location_id = ? AND ${dateCondition}
  `, [locationId]);

  const summary = summaryRows[0] || {};

  // 2. Get Chart Data (The fix for the empty charts)
  // We wrap the selectTime in a subquery or group by the raw alias to ensure MySQL compatibility
  const [stats] = await db.query(`
    SELECT 
      ${selectTime},
      COUNT(t.id) AS customers
    FROM tickets t
    WHERE t.location_id = ? AND ${dateCondition}
    GROUP BY time
    ORDER BY MIN(t.created_at) ASC
  `, [locationId]);

  return {
    totalTickets: Number(summary.totalTickets || 0),
    served: Number(summary.served || 0),
    waiting: Number(summary.waiting || 0),
    cancelled: Number(summary.cancelled || 0),
    avgWaitTime: Math.round(summary.avgWaitTime || 0),
    hourlyStats: stats || []
  };
};


module.exports = { getLiveQueueDashboard, getBranchReports };
