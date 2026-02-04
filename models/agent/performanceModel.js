const db = require('../../config/db');

/**
 * AGENT — SUMMARY PERFORMANCE
 * (Used on agent dashboard main page)
 */
const getMySummaryPerformance = async (agentId, startDate, endDate) => {
  const start = startDate ;
  const end = endDate ;

  const [rows] = await db.query(`
    SELECT 
      u.id AS agentId,
      u.name AS agentName,

      IFNULL(COUNT(t.id), 0) AS totalCalls,
      IFNULL(SUM(t.status = 'WAITING'), 0) AS waiting,
      IFNULL(SUM(t.status = 'COMPLETED'), 0) AS served,

      SEC_TO_TIME(
        IFNULL(
          AVG(
            CASE 
              WHEN t.started_at IS NOT NULL 
              AND t.completed_at IS NOT NULL
              THEN TIMESTAMPDIFF(SECOND, t.started_at, t.completed_at)
            END
          ), 
        0)
      ) AS avgServiceTime,

      SEC_TO_TIME(
        IFNULL(
          SUM(
            TIMESTAMPDIFF(
              SECOND,
              s.login_time,
              COALESCE(s.logout_time, NOW())
            )
          ), 
        0)
      ) AS activeTime,

      SEC_TO_TIME(
        IFNULL(SUM(IFNULL(s.total_break_minutes, 0) * 60), 0)
      ) AS breakTime,

      IFNULL(DATE_FORMAT(MIN(s.login_time), '%h:%i %p'), '--') AS login,
      IFNULL(DATE_FORMAT(MAX(s.logout_time), '%h:%i %p'), '--') AS logout

    FROM users u

    LEFT JOIN agent_sessions s 
      ON u.id = s.agent_id
      AND s.login_time BETWEEN ? AND ?

    LEFT JOIN tickets t 
      ON t.agent_id = u.id
      AND t.created_at BETWEEN ? AND ?

    WHERE u.id = ?
    GROUP BY u.id
  `, [
    start + ' 00:00:00',
    end + ' 23:59:59',
    start + ' 00:00:00',
    end + ' 23:59:59',
    agentId
  ]);

  return rows[0] || {};
};

/**
 * AGENT — WEEKLY PERFORMANCE (LAST 7 DAYS)
 */
const getMyWeeklyPerformance = async (agentId) => {
  const [rows] = await db.query(`
    WITH RECURSIVE dates AS (
      SELECT CURDATE() - INTERVAL 6 DAY AS date
      UNION ALL
      SELECT DATE_ADD(date, INTERVAL 1 DAY)
      FROM dates
      WHERE date < CURDATE()
    )
    SELECT 
      DATE_FORMAT(d.date, '%Y-%m-%d') AS date,

      IFNULL(COUNT(t.id), 0) AS totalCalls,
      IFNULL(SUM(t.status = 'COMPLETED'), 0) AS served,

      SEC_TO_TIME(
        IFNULL(AVG(
          CASE 
            WHEN t.started_at IS NOT NULL 
            AND t.completed_at IS NOT NULL
            THEN TIMESTAMPDIFF(SECOND, t.started_at, t.completed_at)
          END
        ), 0)
      ) AS avgServiceTime,

      SEC_TO_TIME(
        IFNULL(SUM(
          TIMESTAMPDIFF(
            SECOND,
            s.login_time,
            COALESCE(s.logout_time, NOW())
          )
        ), 0)
      ) AS activeTime,

      SEC_TO_TIME(
        IFNULL(SUM(IFNULL(s.total_break_minutes, 0) * 60), 0)
      ) AS breakTime,

      IFNULL(
        ROUND(
          (SUM(t.status = 'COMPLETED') / NULLIF(COUNT(t.id), 0)) * 100,
        1),
      0) AS efficiency

    FROM dates d

    LEFT JOIN tickets t 
      ON DATE(t.created_at) = d.date
      AND t.agent_id = ?

    LEFT JOIN agent_sessions s 
      ON DATE(s.login_time) = d.date
      AND s.agent_id = ?

    GROUP BY d.date
    ORDER BY d.date ASC
  `, [agentId, agentId]);

  return rows;
};

/**
 * AGENT — MONTHLY PERFORMANCE (CURRENT MONTH)
 */
const getMyMonthlyPerformance = async (agentId) => {
  const [rows] = await db.query(`
    WITH RECURSIVE dates AS (
      SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS date
      UNION ALL
      SELECT DATE_ADD(date, INTERVAL 1 DAY)
      FROM dates
      WHERE date < LAST_DAY(CURDATE())
    )
    SELECT 
      DATE_FORMAT(d.date, '%Y-%m-%d') AS date,

      IFNULL(COUNT(t.id), 0) AS totalCalls,
      IFNULL(SUM(t.status = 'COMPLETED'), 0) AS served,

      SEC_TO_TIME(
        IFNULL(AVG(
          CASE 
            WHEN t.started_at IS NOT NULL 
            AND t.completed_at IS NOT NULL
            THEN TIMESTAMPDIFF(SECOND, t.started_at, t.completed_at)
          END
        ), 0)
      ) AS avgServiceTime,

      SEC_TO_TIME(
        IFNULL(SUM(
          TIMESTAMPDIFF(
            SECOND,
            s.login_time,
            COALESCE(s.logout_time, NOW())
          )
        ), 0)
      ) AS activeTime,

      SEC_TO_TIME(
        IFNULL(SUM(IFNULL(s.total_break_minutes, 0) * 60), 0)
      ) AS breakTime,

      IFNULL(DATE_FORMAT(MIN(s.login_time), '%h:%i %p'), '--') AS login,
      IFNULL(DATE_FORMAT(MAX(s.logout_time), '%h:%i %p'), '--') AS logout,

      IFNULL(
        ROUND(
          (SUM(t.status = 'COMPLETED') / NULLIF(COUNT(t.id), 0)) * 100,
        1),
      0) AS efficiency

    FROM dates d

    LEFT JOIN tickets t 
      ON DATE(t.created_at) = d.date
      AND t.agent_id = ?

    LEFT JOIN agent_sessions s 
      ON DATE(s.login_time) = d.date
      AND s.agent_id = ?

    GROUP BY d.date
    ORDER BY d.date ASC
  `, [agentId, agentId]);

  return rows;
};

module.exports = {
  getMySummaryPerformance,
  getMyWeeklyPerformance,
  getMyMonthlyPerformance
};
