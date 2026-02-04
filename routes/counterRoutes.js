const express = require('express');
const router = express.Router();

const counterController = require('../controllers/counterController');
const verifyToken = require('../middleware/authMiddleware');

// 🔐 Counter CRUD — Authenticated Users Only

router.get(
  '/',
  verifyToken,
  counterController.getCounters
);

router.get(
  '/agent',
  verifyToken,
  counterController.getCountersForAgent
);

router.get(
  '/:id',
  verifyToken,
  counterController.getCounterById
);

router.post(
  '/',
  verifyToken,
  counterController.createCounter
);

router.put(
  '/:id',
  verifyToken,
  counterController.updateCounter
);

router.delete(
  '/:id',
  verifyToken,
  counterController.deleteCounter
);

module.exports = router;
