const db = require('../config/db');

// Start Session
const startSession = async (agentId, counterId, locationId) => {
  const [result] = await db.query(`
    INSERT INTO agent_sessions (agent_id, counter_id, location_id, login_time, total_break_minutes)
    VALUES (?, ?, ?, NOW(), 0)
  `, [agentId, counterId, locationId]);

  return result;
};

// End Session
const endSession = async (agentId) => {
  await db.query(`
    UPDATE agent_sessions 
    SET logout_time = NOW() 
    WHERE agent_id = ? AND logout_time IS NULL
  `, [agentId]);
};

// Active Session
const getActiveSession = async (agentId) => {
  const [rows] = await db.query(`
    SELECT * FROM agent_sessions 
    WHERE agent_id = ? AND logout_time IS NULL
  `, [agentId]);

  return rows[0] || null;
};

// Start Break
const startBreak = async (agentId) => {
  await db.query(`
    UPDATE agent_sessions 
    SET break_start_time = NOW()
    WHERE agent_id = ? AND logout_time IS NULL AND break_start_time IS NULL
  `, [agentId]);
};

// End Break
const endBreak = async (agentId) => {
  await db.query(`
    UPDATE agent_sessions
    SET total_break_minutes = total_break_minutes + 
      TIMESTAMPDIFF(MINUTE, break_start_time, NOW()),
      break_start_time = NULL
    WHERE agent_id = ? AND logout_time IS NULL AND break_start_time IS NOT NULL
  `, [agentId]);
};

module.exports = {
  startSession,
  endSession,
  getActiveSession,
  startBreak,
  endBreak
};
