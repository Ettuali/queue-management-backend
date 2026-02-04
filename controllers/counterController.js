const Counter = require('../models/counterModel');

// GET all counters (Paginated)
const getCounters = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Parallel execution for better performance
    const [totalCount, counters] = await Promise.all([
      Counter.getTotalCounterCount(),
      Counter.getPaginatedCounters(limit, offset)
    ]);

    res.json({
      success: true,
      count: totalCount,
      counters,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET counter by ID
const getCounterById = async (req, res) => {
  try {
    const { id } = req.params;
    const counter = await Counter.getCounterById(id);

    if (!counter) {
      return res.status(404).json({ success: false, error: "Counter not found" });
    }

    res.json({ success: true, counter });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET counters for agent (Branch-filtered)
const getCountersForAgent = async (req, res) => {
  try {
    const agentId = req.user.id; // From verifyToken middleware
    const counters = await Counter.getCountersForAgent(agentId);

    res.json({
      success: true,
      count: counters.length,
      counters
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// CREATE counter
const createCounter = async (req, res) => {
  try {
    const { name, location_id } = req.body; // Using snake_case from FE

    if (!name || !location_id) {
      return res.status(400).json({ success: false, error: "Name and Branch ID required" });
    }

    const result = await Counter.createCounter(name, location_id);

    res.status(201).json({
      success: true,
      message: "Counter created successfully",
      counter: {
        id: result.insertId,
        name,
        location_id
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE counter
const updateCounter = async (req, res) => {
  try {
    const { id } = req.params;
    // model handles mapping locationId to location_id
    const updatedCounter = await Counter.updateCounter(id, req.body);

    if (!updatedCounter) {
      return res.status(404).json({ success: false, error: "Counter not found" });
    }

    res.json({
      success: true,
      message: "Counter updated successfully",
      counter: updatedCounter
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE counter
const deleteCounter = async (req, res) => {
  try {
    const { id } = req.params;
    await Counter.deleteCounter(id);

    res.json({
      success: true,
      message: `Counter with ID ${id} deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getCounters,
  getCounterById,
  getCountersForAgent,
  createCounter,
  updateCounter,
  deleteCounter
};