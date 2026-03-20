const jwt = require("jsonwebtoken");

// Verifies JWT and attaches user info to req.user
exports.protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer ")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }
      next();
    } catch (error) {
      res.status(401).json({ message: "Session expired, please login again" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized access" });
  }
};

// Role-based guard factory — use after protect
// e.g. allowRoles("teacher", "hod", "principal")
exports.allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access denied. Required role: ${roles.join(" or ")}` });
  }
  next();
};