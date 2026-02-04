const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({
      success: false,
      error: "No token provided"
    });
  }

  const token = header.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔐 AGENTS must have location
    if (decoded.role === 'AGENT' && !decoded.location_id) {
      return res.status(401).json({
        success: false,
        error: "Agent token missing location context"
      });
    }

    // 🔓 MANAGER / ADMIN can be cross-branch
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token"
    });
  }
};

module.exports = verifyToken;
