const db = require('../config/db');

// GET paginated and sorted branches
const getPaginatedBranches = async (limit, offset) => {
  const [rows] = await db.query(
    `SELECT * FROM locations ORDER BY id ASC LIMIT ? OFFSET ?`,
    [parseInt(limit), parseInt(offset)]
  );
  return rows;
};

// GET total count for pagination math
const getTotalBranchCount = async () => {
  const [rows] = await db.query(`SELECT COUNT(*) as total FROM locations`);
  return rows[0].total;
};

// GET branch by ID
const getBranchById = async (id) => {
  const [rows] = await db.query(`SELECT * FROM locations WHERE id = ?`, [id]);
  return rows[0] || null;
};

// CREATE branch
const createBranch = async (name, address) => {
  const [result] = await db.query(
    `INSERT INTO locations (name, address) VALUES (?, ?)`,
    [name, address]
  );
  return result;
};

// UPDATE branch
const updateBranch = async (id, data) => {
  await db.query(`UPDATE locations SET ? WHERE id = ?`, [data, id]);
  const [rows] = await db.query(`SELECT * FROM locations WHERE id = ?`, [id]);
  return rows[0] || null;
};

// DELETE branch
const deleteBranch = async (id) => {
  return db.query(`DELETE FROM locations WHERE id = ?`, [id]);
};

module.exports = {
  getPaginatedBranches,
  getTotalBranchCount,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch
};