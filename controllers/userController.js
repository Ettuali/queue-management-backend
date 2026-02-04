const User = require("../models/userModel");

// GET all users (Paginated)
const getUsers = async (req, res) => {
  try {
    // 1. Extract and parse query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // 2. Execute parallel queries for performance
    const [totalCount, users] = await Promise.all([
      User.getTotalUserCount(),
      User.getPaginatedUsers(limit, offset)
    ]);

    res.json({
      success: true,
      count: totalCount, // TOTAL records in database for pagination UI
      users,             // Just the slice for this page
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.getUserById(id);
    if (!user) return res.status(404).json({ success: false, error: "User not found" });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role_id, location_id } = req.body;
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({ success: false, error: "Missing required fields" });
    }

    const finalLocationId = role_id === 4 ? null : location_id; // Logic for Managers
    const [result] = await User.createUser(name, email, password, role_id, finalLocationId);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: { id: result.insertId, name, email }
    });
  } catch (err) {
    if (err.errno === 1062) return res.status(400).json({ success: false, error: "Email exists" });
    res.status(500).json({ success: false, error: err.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.updateUser(id, req.body);
    const updatedUser = await User.getUserById(id);
    res.json({ success: true, message: "Updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.deleteUser(id);
    res.json({ success: true, message: `User ${id} deleted` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};