const Auth = require('../models/authModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password required" });
    }

    const user = await Auth.findUserByEmail(email);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    // ✅ FIXED: Ensure the payload object is correctly closed before JWT options
    const token = jwt.sign(
      {
        id: user.id,
        role_id: user.role_id,
        location_id: user.location_id, // Match this to your DB column name
        email: user.email
      },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    // ✅ FIXED: Ensure the response object is correctly formatted
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        location_id: user.location_id
      }
    });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// RESTORED: This function was missing, causing your ReferenceError
const logout = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Logged out successfully"
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

module.exports = { login, logout };