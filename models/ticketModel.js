const db = require("../config/db");

// CREATE TICKET
const createTicket = async (ticketNumber, serviceId, locationId) => {
  const [result] = await db.query(
    `INSERT INTO tickets 
     (ticket_number, service_id, location_id, status, created_at)
     VALUES (?, ?, ?, 'WAITING', NOW())`,
    [ticketNumber, serviceId, locationId]
  );
  return result;
};

// CALL NEXT (LOCKED + SAFE)
const callNext = async (agentId, counterId, locationId) => {
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(`
      SELECT id 
      FROM tickets
      WHERE status = 'WAITING'
        AND location_id = ?
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE
    `, [locationId]);

    if (!rows.length) {
      await conn.rollback();
      return null;
    }

    const ticketId = rows[0].id;

    await conn.query(`
      UPDATE tickets
      SET status = 'CALLED',
          agent_id = ?,
          counter_id = ?,
          called_at = NOW()
      WHERE id = ?
    `, [agentId, counterId, ticketId]);

    await conn.commit();
    return getTicketById(ticketId);

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

// START SERVING
const startServingTicket = async (ticketId) => {
  await db.query(`
    UPDATE tickets 
    SET status = 'SERVING', started_at = NOW()
    WHERE id = ? AND status = 'CALLED'
  `, [ticketId]);

  return getTicketById(ticketId);
};

// COMPLETE
const completeTicket = async (ticketId) => {
  await db.query(`
    UPDATE tickets 
    SET status = 'COMPLETED', completed_at = NOW()
    WHERE id = ? AND status = 'SERVING'
  `, [ticketId]);

  return getTicketById(ticketId);
};

// GET BY ID
const getTicketById = async (ticketId) => {
  const [rows] = await db.query(
    `SELECT * FROM tickets WHERE id = ?`,
    [ticketId]
  );
  return rows[0] || null;
};

// WAITING BY LOCATION
const getWaitingTickets = async (locationId) => {
  const [rows] = await db.query(`
    SELECT * FROM tickets
    WHERE status = 'WAITING' AND location_id = ?
    ORDER BY created_at ASC
  `, [locationId]);

  return rows;
};

// AGENT DASHBOARD
const getAgentDashboard = async (agentId, locationId) => {
  const [current] = await db.query(`
    SELECT t.*, s.name AS service_name
    FROM tickets t
    LEFT JOIN services s ON t.service_id = s.id
    WHERE t.agent_id = ?
      AND t.location_id = ?
      AND t.status IN ('CALLED','SERVING')
    ORDER BY t.called_at DESC
    LIMIT 1
  `, [agentId, locationId]);

  const [waiting] = await db.query(`
    SELECT t.*, s.name AS service_name
    FROM tickets t
    LEFT JOIN services s ON t.service_id = s.id
    WHERE t.status = 'WAITING'
      AND t.location_id = ?
    ORDER BY t.created_at ASC
  `, [locationId]);

  const [completed] = await db.query(`
    SELECT id FROM tickets
    WHERE agent_id = ?
      AND status = 'COMPLETED'
      AND DATE(completed_at) = CURDATE()
  `, [agentId]);

  return {
    currentTicket: current[0] || null,
    waitingTickets: waiting || [],
    completedTickets: completed || []
  };
};

// SUPERVISOR QUEUE
const getSupervisorQueue = async (locationId) => {
  const [waiting] = await db.query(`
    SELECT * FROM tickets
    WHERE status = 'WAITING' AND location_id = ?
  `, [locationId]);

  const [active] = await db.query(`
    SELECT * FROM tickets
    WHERE status IN ('CALLED','SERVING') AND location_id = ?
  `, [locationId]);

  return { waiting, active };
};

// MANAGER REPORTS
const getManagerReports = async (locationId) => {
  const [stats] = await db.query(`
    SELECT 
      COUNT(*) AS totalTickets,
      SUM(status = 'COMPLETED') AS completedTickets,
      ROUND(AVG(TIMESTAMPDIFF(SECOND, created_at, called_at)), 2) AS avgWaitTime,
      ROUND(AVG(TIMESTAMPDIFF(SECOND, started_at, completed_at)), 2) AS avgServiceTime
    FROM tickets
    WHERE location_id = ?
  `, [locationId]);

  return stats[0];
};

const getWaitingCount = async (locationId) => {
  const [rows] = await db.query(
    `
    SELECT COUNT(*) AS count
    FROM tickets
    WHERE location_id = ?
      AND status IN ('WAITING', 'CALLED')
    `,
    [locationId]
  );

  return rows[0]?.count || 0;
};

module.exports = {
  createTicket,
  callNext,
  startServingTicket,
  completeTicket,
  getTicketById,
  getWaitingTickets,
  getAgentDashboard,
  getSupervisorQueue,
  getWaitingCount,
  getManagerReports
};
