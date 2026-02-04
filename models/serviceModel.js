const db = require('../config/db');

// GET paginated and sorted services
const getPaginatedServices = async (limit, offset) => {
  const [rows] = await db.query(
    `SELECT * FROM services ORDER BY id ASC LIMIT ? OFFSET ?`,
    [parseInt(limit), parseInt(offset)]
  );
  return rows;
};

// GET total count for pagination math
const getTotalServiceCount = async () => {
  const [rows] = await db.query(`SELECT COUNT(*) as total FROM services`);
  return rows[0].total;
};

// GET service by ID
const getServiceById = async (id) => {
  const [rows] = await db.query(
    `SELECT * FROM services WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// CREATE service
const createService = async (name, priority_level, estimated_time) => {
  const [result] = await db.query(
    `INSERT INTO services (name, priority_level, estimated_time)
     VALUES (?, ?, ?)`,
    [name, priority_level, estimated_time]
  );
  return result;
};

// UPDATE service
const updateService = async (id, data) => {
  await db.query(`UPDATE services SET ? WHERE id = ?`, [data, id]);

  const [rows] = await db.query(
    `SELECT * FROM services WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
};

// DELETE service
const deleteService = async (id) => {
  return db.query(`DELETE FROM services WHERE id = ?`, [id]);
};

module.exports = {
  getPaginatedServices,
  getTotalServiceCount,
  getServiceById,
  createService,
  updateService,
  deleteService
};