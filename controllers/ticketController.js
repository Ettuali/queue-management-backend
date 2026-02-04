const Ticket = require("../models/ticketModel");
const db = require("../config/db");

// CREATE
const createTicket = async (req, res) => {
  try {
    const { serviceId } = req.body;
    const locationId = req.user.location_id;

    if (!serviceId) {
      return res.status(400).json({ success: false, error: "serviceId required" });
    }

    const ticketNumber = "Q" + Date.now().toString().slice(-6);
    const result = await Ticket.createTicket(ticketNumber, serviceId, locationId);

    res.status(201).json({
      success: true,
      ticketNumber,
      ticketId: result.insertId
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// CALL NEXT
const callNextTicket = async (req, res) => {
  try {
    const { counterId } = req.body;
    const agentId = req.user.id;
    const locationId = req.user.location_id;

    const ticket = await Ticket.callNext(agentId, counterId, locationId);

    if (!ticket) {
      return res.status(404).json({ success: false, message: "No waiting tickets" });
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// START SERVING
const startServing = async (req, res) => {
  const { ticketId } = req.body;
  const ticket = await Ticket.getTicketById(ticketId);

  if (!ticket || ticket.status !== "CALLED") {
    return res.status(400).json({ success: false, error: "Invalid ticket state" });
  }

  const updated = await Ticket.startServingTicket(ticketId);
  res.json({ success: true, ticket: updated });
};

// COMPLETE
const completeTicket = async (req, res) => {
  const { ticketId } = req.body;
  const ticket = await Ticket.getTicketById(ticketId);

  if (!ticket || ticket.status !== "SERVING") {
    return res.status(400).json({ success: false, error: "Invalid ticket state" });
  }

  const updated = await Ticket.completeTicket(ticketId);
  res.json({ success: true, ticket: updated });
};

// AGENT DASHBOARD
const getAgentDashboard = async (req, res) => {
  try {
    const agentId = req.user.id;
    const locationId = req.user.location_id;

    const ticketData = await Ticket.getAgentDashboard(agentId, locationId);

    const [perf] = await db.query(`
      SELECT COUNT(id) AS servedToday
      FROM tickets
      WHERE agent_id = ?
        AND status = 'COMPLETED'
        AND DATE(completed_at) = CURDATE()
    `, [agentId]);

    res.json({
      success: true,
      data: {
        currentTicket: ticketData.currentTicket,
        waitingTickets: ticketData.waitingTickets,
        stats: {
          servedToday: perf[0]?.servedToday || 0
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getWaitingCount = async (req, res) => {
  try {
    const locationId = req.user.location_id;

    const count = await Ticket.getWaitingCount(locationId);

    res.json({
      success: true,
      count,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to fetch waiting count",
    });
  }
};


module.exports = {
  createTicket,
  callNextTicket,
  startServing,
  completeTicket,
  getWaitingCount,
  getAgentDashboard
};
