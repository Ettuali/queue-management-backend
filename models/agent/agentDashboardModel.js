const db = require("../../config/db");

/**
 * CURRENT ACTIVE SESSION (counter + break)
 */
const getActiveSession = async (agentId) => {
  const [rows] = await db.query(`
    SELECT 
      s.counter_id,
      c.name AS counter_name,
      s.break_start_time
    FROM agent_sessions s
    LEFT JOIN counters c ON c.id = s.counter_id
    WHERE s.agent_id = ?
      AND s.logout_time IS NULL
    ORDER BY s.login_time DESC
    LIMIT 1
  `, [agentId]);

  return rows[0] || null;
};

/**
 * CURRENT TICKET (CALLED / SERVING)
 */
const getCurrentTicket = async (agentId, locationId) => {
  const [rows] = await db.query(`
    SELECT 
      t.id,
      t.ticket_number,
      t.status
    FROM tickets t
    WHERE t.agent_id = ?
      AND t.location_id = ?
      AND t.status IN ('CALLED','SERVING')
    ORDER BY t.called_at DESC
    LIMIT 1
  `, [agentId, locationId]);

  return rows[0] || null;
};

/**
 * WAITING QUEUE (BRANCH)
 */
const getWaitingTickets = async (locationId) => {
  const [rows] = await db.query(`
    SELECT 
      t.id,
      t.ticket_number,
      t.created_at,
      s.name AS service_name
    FROM tickets t
    LEFT JOIN services s ON s.id = t.service_id
    WHERE t.status = 'WAITING'
      AND t.location_id = ?
    ORDER BY t.created_at ASC
  `, [locationId]);

  return rows;
};

/**
 * KPI STATS (TODAY)
 */
const getTodayStats = async (agentId) => {
const [[calls]] = await db.query(`
  SELECT COUNT(*) AS totalCalls
  FROM tickets
  WHERE agent_id = ?
    AND DATE(COALESCE(completed_at, called_at)) = CURDATE()
`, [agentId]);

const [[served]] = await db.query(`
  SELECT COUNT(*) AS servedToday
  FROM tickets
  WHERE agent_id = ?
    AND status = 'COMPLETED'
    AND DATE(completed_at) = CURDATE()
`, [agentId]);

  const [[avg]] = await db.query(`
    SELECT SEC_TO_TIME(
      AVG(
        TIMESTAMPDIFF(SECOND, started_at, completed_at)
      )
    ) AS avgTime
    FROM tickets
    WHERE agent_id = ?
      AND status = 'COMPLETED'
      AND DATE(completed_at) = CURDATE()
  `, [agentId]);

  const [[active]] = await db.query(`
    SELECT SEC_TO_TIME(
      SUM(
        TIMESTAMPDIFF(
          SECOND,
          login_time,
          COALESCE(logout_time, NOW())
        )
      )
    ) AS activeTime
    FROM agent_sessions
    WHERE agent_id = ?
      AND DATE(login_time) = CURDATE()
  `, [agentId]);

  const [[breaks]] = await db.query(`
    SELECT SEC_TO_TIME(
      SUM(total_break_minutes * 60)
    ) AS breakTime
    FROM agent_sessions
    WHERE agent_id = ?
      AND DATE(login_time) = CURDATE()
  `, [agentId]);

  return {
    totalCalls: calls?.totalCalls || 0,
    servedToday: served?.servedToday || 0,
    avgTime: avg?.avgTime || "00:00:00",
    activeTime: active?.activeTime || "00:00:00",
    breakTime: breaks?.breakTime || "00:00:00",
    efficiency: "100%"
  };
};

module.exports = {
  getActiveSession,
  getCurrentTicket,
  getWaitingTickets,
  getTodayStats
};
