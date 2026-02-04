const Branch = require("../models/branchModel");

// GET all branches (Paginated)
const getBranches = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Parallel execution for better speed
    const [totalCount, branches] = await Promise.all([
      Branch.getTotalBranchCount(),
      Branch.getPaginatedBranches(limit, offset),
    ]);

    res.json({
      success: true,
      count: totalCount, // Total records for frontend pagination UI
      branches, // The specific slice of data
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET branch by ID
const getBranchById = async (req, res) => {
  try {
    const { id } = req.params;
    const branch = await Branch.getBranchById(id);

    if (!branch) {
      return res
        .status(404)
        .json({ success: false, error: "Branch not found" });
    }

    res.json({ success: true, branch });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// CREATE branch
const createBranch = async (req, res) => {
  try {
    const { name, address } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Branch name is required" });
    }

    const result = await Branch.createBranch(name, address);

    res.status(201).json({
      success: true,
      message: "Branch created successfully",
      branch: {
        id: result.insertId,
        name,
        address,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE branch
const updateBranch = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedBranch = await Branch.updateBranch(id, req.body);

    if (!updatedBranch) {
      return res
        .status(404)
        .json({ success: false, error: "Branch not found" });
    }

    res.json({
      success: true,
      message: "Branch updated successfully",
      branch: updatedBranch,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE branch
const deleteBranch = async (req, res) => {
  try {
    const { id } = req.params;
    await Branch.deleteBranch(id);

    res.json({
      success: true,
      message: `Branch with ID ${id} deleted successfully`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
  deleteBranch,
};
