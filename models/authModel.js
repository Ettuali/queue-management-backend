const db = require('../config/db');

const findUserByEmail = async (email) => {
  const [rows] = await db.query(
    `SELECT users.*, roles.name AS role 
     FROM users 
     JOIN roles ON users.role_id = roles.id 
     WHERE email = ?`,
    [email]
  );

  return rows[0] || null;
};

module.exports = { findUserByEmail };
