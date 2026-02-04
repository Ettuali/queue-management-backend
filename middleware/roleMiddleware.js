const allowRoles = (allowedRoles) => {

  const roleMap = {
    admin: 1,
    agent: 2,
    supervisor: 3,
    manager: 4,
    kiosk: 5
  };

return (req, res, next) => {
    if (!req.user || req.user.role_id == null) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized - Missing role"
      });
    }

    // Normalize allowed role names to IDs
    const allowedIds = allowedRoles
      .map(role => roleMap[String(role).toLowerCase().trim()])
      .filter(id => id !== undefined); // 👈 More robust than Boolean check

    if (!allowedIds.includes(req.user.role_id)) {
      return res.status(403).json({
        success: false,
        error: `Access denied - Role ${req.user.role_id} not allowed`
      });
    }

    next();
  };
};

module.exports = allowRoles;
