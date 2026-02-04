const db = require('../config/db');

// GET paginated and sorted counters with branch names
const getPaginatedCounters = async (limit, offset) => {
  const [rows] = await db.query(`
    SELECT c.id, c.name, c.status, c.location_id,
           l.name AS branch
    FROM counters c
    JOIN locations l ON c.location_id = l.id
    ORDER BY c.id ASC 
    LIMIT ? OFFSET ?
  `, [parseInt(limit), parseInt(offset)]);
  return rows;
};

// GET total count for pagination math
const getTotalCounterCount = async () => {
  const [rows] = await db.query(`SELECT COUNT(*) as total FROM counters`);
  return rows[0].total;
};

// GET counters for agent (filtered by their assigned branch)
const getCountersForAgent = async (agentId) => {
  const [rows] = await db.query(`
    SELECT DISTINCT c.id, c.name, c.status, l.name AS branch
    FROM counters c
    JOIN locations l ON c.location_id = l.id
    JOIN users u ON u.location_id = l.id
    WHERE u.id = ? AND c.status = 'active'
    ORDER BY c.name ASC
  `, [agentId]);
  return rows;
};

// GET counter by ID
const getCounterById = async (id) => {
  const [rows] = await db.query(`
    SELECT c.id, c.name, c.status, c.location_id,
           l.name AS branch
    FROM counters c
    JOIN locations l ON c.location_id = l.id
    WHERE c.id = ?
  `, [id]);
  return rows[0] || null;
};

// CREATE counter
const createCounter = async (name, locationId) => {
  const [result] = await db.query(
    `INSERT INTO counters (name, location_id) VALUES (?, ?)`,
    [name, locationId]
  );
  return result;
};

// UPDATE counter
const updateCounter = async (id, data) => {
  // Ensure location_id mapping if frontend sends locationId
  const updateData = { ...data };
  if (updateData.locationId) {
    updateData.location_id = updateData.locationId;
    delete updateData.locationId;
  }

  await db.query(`UPDATE counters SET ? WHERE id = ?`, [updateData, id]);
  return getCounterById(id);
};

// DELETE counter
const deleteCounter = async (id) => {
  return db.query(`DELETE FROM counters WHERE id = ?`, [id]);
};

module.exports = {
  getPaginatedCounters,
  getTotalCounterCount,
  getCountersForAgent,
  getCounterById,
  createCounter,
  updateCounter,
  deleteCounter
};