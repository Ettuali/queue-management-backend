const db = require("../config/db");
const bcrypt = require("bcrypt");

/**
 * GET paginated and sorted users
 * @param {number} limit - Items per page
 * @param {number} offset - Number of items to skip
 */
const getPaginatedUsers = async (limit, offset) => {
  const [rows] = await db.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      r.name AS role,
      u.status,
      u.location_id
    FROM users u
    JOIN roles r ON u.role_id = r.id
    ORDER BY u.id ASC 
    LIMIT ? OFFSET ?
  `, [parseInt(limit), parseInt(offset)]);

  return rows;
};

/**
 * GET total count of users for pagination math
 */
const getTotalUserCount = async () => {
  const [rows] = await db.query(`SELECT COUNT(*) as total FROM users`);
  return rows[0].total;
};

const getUserById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      u.id, u.name, u.email, r.name AS role, u.status, u.location_id
    FROM users u
    JOIN roles r ON u.role_id = r.id
    WHERE u.id = ?
  `, [id]);
  return rows[0] || null;
};

const createUser = async (name, email, password, roleId, locationId) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  return db.query(
    `INSERT INTO users (name, email, password, role_id, location_id) VALUES (?, ?, ?, ?, ?)`,
    [name, email, hashedPassword, roleId, locationId]
  );
};

const updateUser = async (id, data) => {
  const updateData = { ...data };
  // Ensure locationId matches snake_case if coming from frontend camelCase
  if (updateData.locationId) {
    updateData.location_id = updateData.locationId;
    delete updateData.locationId;
  }
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
  }
  return db.query(`UPDATE users SET ? WHERE id = ?`, [updateData, id]);
};

const deleteUser = async (id) => {
  return db.query(`DELETE FROM users WHERE id = ?`, [id]);
};

module.exports = {
  getPaginatedUsers,
  getTotalUserCount,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};