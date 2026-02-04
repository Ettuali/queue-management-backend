  const express = require('express');
  const router = express.Router();

  // Middleware
  const verifyToken = require('../middleware/authMiddleware');

  // Feature routes
  const authRoutes = require('./authRoutes');
  const ticketRoutes = require('./ticketRoutes');
  const userRoutes = require('./userRoutes');
  const serviceRoutes = require('./serviceRoutes');
  const counterRoutes = require('./counterRoutes');
  const branchRoutes = require('./branchRoutes');
  const supervisorRoutes = require('./supervisorRoutes');
  const managerRoutes = require('./managerRoutes');
  const agentRoutes = require('./agentRoutes'); // 🔥 NEW
  const agentSessionRoutes = require('./agentSessionRoutes');
  const adminRoutes = require('./adminRoutes');
  const reportRoutes = require('./reportRoutes');
  const agentDashboardRoutes = require("./agentDashboardRoutes");

  // =====================
  // HEALTH CHECK
  // =====================
  router.get('/', (req, res) => {
    res.send('✅ Queue Management API is Live');
  });

  // =====================
  // AUTH ROUTES (PUBLIC)
  // =====================
  router.use('/auth', authRoutes);

  // =====================
  // CUSTOMER / PUBLIC
  // =====================
  router.use('/tickets', ticketRoutes);

  // =====================
  // ADMIN ROUTES (Auth Only)
  // =====================
  router.use('/admin/users', verifyToken, userRoutes);
  router.use('/admin/services', verifyToken, serviceRoutes);
  router.use('/admin/counters', verifyToken, counterRoutes);
  router.use('/admin/branches', verifyToken, branchRoutes);
  router.use('/admin/analytics', verifyToken, adminRoutes);
  router.use('/admin/reports', verifyToken, reportRoutes);

  // =====================
  // SUPERVISOR ROUTES (Auth Only)
  // =====================
  router.use('/supervisor', verifyToken, supervisorRoutes);

  // =====================
  // MANAGER ROUTES (Auth Only)
  // =====================
  router.use('/manager', verifyToken, managerRoutes);

  // =====================
  // AGENT ROUTES (Auth Only)
  // =====================
  router.use('/admin/agent', verifyToken, agentRoutes);

  // =====================
  // AGENT SESSION ROUTES (Auth Only)
  // =====================
  router.use('/agent/session', verifyToken, agentSessionRoutes);

  router.use('/api/reports', reportRoutes);
  
router.use("/agent", agentDashboardRoutes);

  module.exports = router;
