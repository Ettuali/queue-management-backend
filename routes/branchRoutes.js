const express = require('express');
const router = express.Router();

const branchController = require('../controllers/branchController');
const verifyToken = require('../middleware/authMiddleware');

// 🔐 Branch CRUD — Authenticated Users Only

router.get(
  '/',
  verifyToken,
  branchController.getBranches
);

router.get(
  '/:id',
  verifyToken,
  branchController.getBranchById
);

router.post(
  '/',
  verifyToken,
  branchController.createBranch
);

router.put(
  '/:id',
  verifyToken,
  branchController.updateBranch
);

router.delete(
  '/:id',
  verifyToken,
  branchController.deleteBranch
);

module.exports = router;
