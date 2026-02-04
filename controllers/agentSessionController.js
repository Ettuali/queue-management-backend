const Session = require('../models/agentSessionModel');

const loginAgent = async (req, res) => {
  try {
    const { counterId } = req.body;
    const agentId = req.user.id;
    const locationId = req.user.location_id;

    const existing = await Session.getActiveSession(agentId);
    if (existing) {
      return res.status(409).json({ success: false, error: "Session already active" });
    }

    await Session.startSession(agentId, counterId, locationId);

    res.json({ success: true, message: "Agent logged in" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const logoutAgent = async (req, res) => {
  try {
    const agentId = req.user.id;
    await Session.endSession(agentId);

    res.json({ success: true, message: "Logged out" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getSessionStatus = async (req, res) => {
  try {
    const agentId = req.user.id;
    const session = await Session.getActiveSession(agentId);

    res.json({ success: true, isActive: !!session, session });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const startBreak = async (req, res) => {
  try {
    const agentId = req.user.id;
    await Session.startBreak(agentId);

    res.json({ success: true, message: "Break started" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const endBreak = async (req, res) => {
  try {
    const agentId = req.user.id;
    await Session.endBreak(agentId);

    res.json({ success: true, message: "Break ended" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  loginAgent,
  logoutAgent,
  getSessionStatus,
  startBreak,
  endBreak
};
