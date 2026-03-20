const jwt     = require("jsonwebtoken");
const Request = require("../models/Request");
const ScanLog = require("../models/ScanLog");

// ─── Verify QR Token ─────────────────────────────────────────────────────────
// GET /api/qr/verify/:token
exports.verifyQR = async (req, res) => {
  const { token } = req.params;
  try {
    let decoded;
    let result = "valid";

    try {
      decoded = jwt.verify(token, process.env.QR_SECRET);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        // Decode without verification to still return details
        decoded = jwt.decode(token);
        result  = "expired";
      } else {
        return res.status(200).json({ result: "invalid", message: "QR is invalid or tampered" });
      }
    }

    if (!decoded || !decoded.requestId) {
      return res.status(200).json({ result: "invalid", message: "QR payload is malformed" });
    }

    const request = await Request.findById(decoded.requestId)
      .populate("student",    "name collegeId department year section photo")
      .populate("approvedBy", "name role department");

    if (!request) {
      return res.status(200).json({ result: "invalid", message: "Request not found" });
    }

    res.json({
      result,
      request: {
        id:          request._id,
        requestType: request.requestType,
        reason:      request.reason,
        fromDate:    request.fromDate,
        toDate:      request.toDate,
        status:      request.status,
        approvedAt:  request.approvedAt,
        qrValidUntil: request.qrValidUntil
      },
      student:    request.student,
      approvedBy: request.approvedBy,
      validUntil: decoded.validUntil
    });
  } catch (error) {
    console.error("QR verify error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

// ─── Log a QR Scan ────────────────────────────────────────────────────────────
// POST /api/qr/scan-log
exports.saveScanLog = async (req, res) => {
  try {
    const { requestId, studentId, result, details } = req.body;
    const log = new ScanLog({
      request:   requestId  || null,
      student:   studentId  || null,
      scannedBy: req.user.id,
      scannedAt: new Date(),
      result,
      details:   details || ""
    });
    await log.save();
    res.status(201).json({ message: "Scan logged", log });
  } catch (error) {
    console.error("Scan log error:", error);
    res.status(500).json({ message: "Failed to save scan log" });
  }
};

// ─── Get Scan History (Watchman) ──────────────────────────────────────────────
// GET /api/qr/scan-history
exports.getScanHistory = async (req, res) => {
  try {
    const logs = await ScanLog.find({ scannedBy: req.user.id })
      .populate("request",  "requestType fromDate toDate")
      .populate("student",  "name collegeId department")
      .populate("scannedBy","name")
      .sort({ scannedAt: -1 });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching scan history" });
  }
};
