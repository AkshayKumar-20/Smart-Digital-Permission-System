const jwt = require("jsonwebtoken");

exports.protect = (req, res, next) => {
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    try {
      token = token.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Adds user info to the request object
      next();
    } catch (error) {
      res.status(401).json({ message: "Session expired, please login again" });
    }
  } else {
    res.status(401).json({ message: "Unauthorized access" });
  }
};