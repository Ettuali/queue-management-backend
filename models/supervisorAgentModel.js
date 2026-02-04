const db = require('../config/db');

const getSupervisorAgentStatusToday = async (locationId) => {
  const [rows] = await db.query(`
    SELECT
      u.id AS agentId,
      u.name AS agentName,

      ANY_VALUE(c.name) AS counter,

      IFNULL(DATE_FORMAT(MIN(s.login_time), '%h:%i %p'), '--') AS login,
      IFNULL(DATE_FORMAT(MAX(s.logout_time), '%h:%i %p'), '--') AS logout,

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

      IFNULL(SUM(t.status = 'COMPLETED'), 0) AS servedToday,

      CASE
        WHEN MAX(s.logout_time) IS NOT NULL THEN 'OFFLINE'
        WHEN MAX(s.break_start_time) IS NOT NULL THEN 'ON BREAK'
        WHEN COUNT(s.id) > 0 THEN 'ACTIVE'
        ELSE 'OFFLINE'
      END AS status

    FROM users u

    LEFT JOIN agent_sessions s
      ON u.id = s.agent_id
      AND DATE(s.login_time) = CURDATE()
      AND s.location_id = ?

    LEFT JOIN tickets t
      ON t.agent_id = u.id
      AND DATE(t.created_at) = CURDATE()
      AND t.location_id = ?

    LEFT JOIN counters c
      ON s.counter_id = c.id

    WHERE u.role_id = 2
      AND u.location_id = ?

    GROUP BY u.id
    ORDER BY servedToday DESC
  `, [locationId, locationId, locationId]);

  return rows;
};

module.exports = { getSupervisorAgentStatusToday };
