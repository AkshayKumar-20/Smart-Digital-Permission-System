const express = require("express");
const router  = express.Router();
const { protect, allowRoles } = require("../middleware/authMiddleware");
const { verifyQR, saveScanLog, getScanHistory } = require("../controllers/qrController");

// GET /api/qr/verify/:token — verifiable without auth so any scanner app can call it
// But we protect with at least protect middleware (watchman/teacher can call)
router.get ("/verify/:token",  protect, verifyQR);

// Watchman-only routes
router.post("/scan-log",       protect, allowRoles("watchman"), saveScanLog);
router.get ("/scan-history",   protect, allowRoles("watchman"), getScanHistory);

module.exports = router;
