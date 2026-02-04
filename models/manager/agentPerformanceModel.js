const db = require('../../config/db');

/**
 * MANAGER DASHBOARD — AGENTS SUMMARY (ranking / overview)
 */
const getAgentsSummaryPerformance = async () => {
  const [rows] = await db.query(`
    SELECT
      u.id AS agentId,
      u.name AS agentName,
      l.name AS branchName,

      COUNT(DISTINCT t.id) AS ticketsServed,

      ROUND(COUNT(DISTINCT t.id), 2) AS kpiScore

    FROM users u
    LEFT JOIN locations l ON l.id = u.location_id
    LEFT JOIN tickets t
      ON t.agent_id = u.id
     AND t.status = 'COMPLETED'

    WHERE u.role_id = 2
    GROUP BY u.id
    ORDER BY kpiScore DESC
  `);

  // 🔥 Add ranking in backend
  return rows.map((agent, index) => ({
    ...agent,
    rank: index + 1
  }));
};


/**
 * MANAGER — SINGLE AGENT LIFETIME PERFORMANCE
 * (View Agent)
 */
const getAgentLifetimePerformance = async (agentId) => {
  const [rows] = await db.query(`
    SELECT
      u.id AS agentId,
      u.name AS agentName,
      COUNT(DISTINCT t.id) AS ticketsServed,
      SEC_TO_TIME(
        IFNULL(
          AVG(
            CASE
              WHEN t.started_at IS NOT NULL
              AND t.completed_at IS NOT NULL
              THEN TIMESTAMPDIFF(SECOND, t.started_at, t.completed_at)
            END
          ), 0
        )
      ) AS avgServiceTime,
      SEC_TO_TIME(
        IFNULL(
          SUM(
            TIMESTAMPDIFF(
              SECOND,
              s.login_time,
              COALESCE(s.logout_time, NOW())
            )
          ), 0
        )
      ) AS totalActiveTime,
      SEC_TO_TIME(
        IFNULL(SUM(IFNULL(s.total_break_minutes, 0) * 60), 0)
      ) AS totalBreakTime,
      DATE_FORMAT(MIN(s.login_time), '%Y-%m-%d %h:%i %p') AS firstLogin,
      DATE_FORMAT(MAX(s.logout_time), '%Y-%m-%d %h:%i %p') AS lastLogout
    FROM users u
    LEFT JOIN tickets t ON t.agent_id = u.id
    LEFT JOIN agent_sessions s ON s.agent_id = u.id
    WHERE u.id = ? AND u.role_id = 2
    GROUP BY u.id
  `, [agentId]);

  return rows[0] || {};
};

const getAgentMonthlyPerformance = async (agentId, month) => {
  const [rows] = await db.query(`
    SELECT
      DATE(t.completed_at) AS date,
      COUNT(t.id) AS ticketsServed,
      ROUND(
        AVG(
          TIMESTAMPDIFF(
            SECOND,
            t.started_at,
            t.completed_at
          )
        ), 2
      ) AS avgServiceTime
    FROM tickets t
    WHERE t.agent_id = ?
      AND t.status = 'COMPLETED'
      AND DATE_FORMAT(t.completed_at, '%Y-%m') = ?
    GROUP BY DATE(t.completed_at)
    ORDER BY date ASC
  `, [agentId, month]);

  return rows;
};


const getAgentDailyHourlyPerformance = async (agentId) => {
  const [rows] = await db.query(`
    SELECT 
      HOUR(t.completed_at) AS hour,
      COUNT(t.id) AS ticketsServed
    FROM tickets t
    WHERE t.agent_id = ? 
      AND t.status = 'COMPLETED'
      AND DATE(t.completed_at) = CURDATE()
    GROUP BY HOUR(t.completed_at)
    ORDER BY hour ASC
  `, [agentId]);
  return rows;
};

module.exports = {
  getAgentsSummaryPerformance,
  getAgentLifetimePerformance,
  getAgentMonthlyPerformance,
  getAgentDailyHourlyPerformance // 🔥 Added
};
