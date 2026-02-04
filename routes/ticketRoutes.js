const express = require("express");
const router = express.Router();

const ticketController = require("../controllers/ticketController");
const verifyToken = require("../middleware/authMiddleware");

// CUSTOMER
router.post("/create", verifyToken, ticketController.createTicket);

// AGENT
router.post("/call-next", verifyToken, ticketController.callNextTicket);
router.post("/start-serving", verifyToken, ticketController.startServing);
router.post("/complete", verifyToken, ticketController.completeTicket);
router.get("/agent/dashboard", verifyToken, ticketController.getAgentDashboard);
router.get("/waiting-count",verifyToken,
  ticketController.getWaitingCount
);

module.exports = router;
