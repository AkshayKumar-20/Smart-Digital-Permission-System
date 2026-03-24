const Request = require("../models/Request");
const User    = require("../models/User");
const generateQRToken = require("../utils/generateQR");

// ─── Create Request (Student) ─────────────────────────────────────────────────
exports.createRequest = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { requestType, reason, description, fromDate, toDate } = req.body;
    
    // Handle recipientIds - may come as string (single) or array (multiple) from FormData
    let recipientIds = req.body.recipientIds;
    if (!recipientIds) {
      return res.status(400).json({ message: "At least one recipient is required" });
    }
    // Normalize to array
    if (!Array.isArray(recipientIds)) {
      recipientIds = [recipientIds];
    }
    if (recipientIds.length === 0) {
      return res.status(400).json({ message: "At least one recipient is required" });
    }

    // Fetch recipient user info to validate & build recipients[]
    const recipientUsers = await User.find({ _id: { $in: recipientIds } }).select("role department");
    const student = await User.findById(studentId).select("department");

    // Validate: each recipient must be a teacher/hod of same dept OR a principal
    for (const r of recipientUsers) {
      if (r.role === "principal") continue;
      if (r.department !== student.department) {
        return res.status(400).json({ message: "Recipients must be from your department or Principal" });
      }
    }

    const recipients = recipientUsers.map(r => ({
      user:   r._id,
      role:   r.role,
      action: "pending"
    }));

    const newRequest = new Request({
      student:     studentId,
      requestType,
      reason,
      description,
      fromDate:    new Date(fromDate),
      toDate:      new Date(toDate),
      document:    req.file ? `/uploads/${req.file.filename}` : undefined,
      recipients,
      status:     "pending"
    });

    await newRequest.save();
    res.status(201).json({ message: "Request submitted successfully!", request: newRequest });
  } catch (error) {
    console.error("Create request error:", error);
    res.status(500).json({ message: "Submission failed", error: error.message });
  }
};

// ─── Get All Requests (role-filtered) ────────────────────────────────────────
exports.getRequests = async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    if (role === "student") {
      query = { student: id };
    } else if (role === "teacher" || role === "hod" || role === "principal") {
      // Show requests where this user is in recipients[]
      query = { "recipients.user": id };
    }
    // watchman / admin: no filter (they have separate routes for scan history)

    const requests = await Request.find(query)
      .populate("student", "name collegeId department year section photo")
      .populate("recipients.user", "name role")
      .populate("approvedBy", "name role")
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error("Get requests error:", error);
    res.status(500).json({ message: "Error fetching requests" });
  }
};

// ─── Get Single Request ───────────────────────────────────────────────────────
exports.getRequestById = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("student", "name collegeId department year section photo phone")
      .populate("recipients.user", "name role department")
      .populate("approvedBy", "name role")
      .populate("escalatedTo", "name role")
      .populate("escalatedBy", "name role");

    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: "Error fetching request" });
  }
};

// ─── Approve Request ─────────────────────────────────────────────────────────
exports.approveRequest = async (req, res) => {
  try {
    const approverId = req.user.id;
    const { remarks, escalateTo } = req.body; // escalateTo: userId to escalate to (optional)

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Find this user in recipients[]
    const recipientEntry = request.recipients.find(
      r => r.user.toString() === approverId
    );
    if (!recipientEntry) {
      return res.status(403).json({ message: "You are not a recipient of this request" });
    }
    if (recipientEntry.action !== "pending") {
      return res.status(400).json({ message: "You have already acted on this request" });
    }

    // Handle escalation
    if (escalateTo) {
      recipientEntry.action  = "escalated";
      recipientEntry.remarks = remarks || "";
      recipientEntry.actionAt = new Date();
      request.escalatedBy = approverId;
      request.escalatedTo = escalateTo;

      // Add escalation target to recipients[] if not already present
      const alreadyThere = request.recipients.some(r => r.user.toString() === escalateTo);
      if (!alreadyThere) {
        const escalateUser = await User.findById(escalateTo).select("role");
        if (escalateUser) {
          request.recipients.push({
            user:   escalateTo,
            role:   escalateUser.role,
            action: "pending"
          });
        }
      }
    } else {
      // Straight approval
      recipientEntry.action  = "approved";
      recipientEntry.remarks = remarks || "";
      recipientEntry.actionAt = new Date();
    }

    // If this is the first approval (no QR yet), generate QR
    const isFirstApproval = request.status !== "approved";
    if (isFirstApproval && !escalateTo) {
      request.status     = "approved";
      request.approvedBy = approverId;
      request.approvedAt = new Date();
      request.qrToken     = generateQRToken(request, approverId);
      request.qrValidUntil = request.toDate;
    }

    await request.save();

    const updated = await Request.findById(req.params.id)
      .populate("student", "name collegeId department")
      .populate("approvedBy", "name role");

    res.json({ message: escalateTo ? "Request escalated" : "Request approved and QR generated", request: updated });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ message: "Approval failed", error: error.message });
  }
};

// ─── Reject Request ───────────────────────────────────────────────────────────
exports.rejectRequest = async (req, res) => {
  try {
    const rejecterId = req.user.id;
    const { remarks } = req.body;

    if (!remarks || remarks.trim() === "") {
      return res.status(400).json({ message: "Remarks are required when rejecting" });
    }

    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const recipientEntry = request.recipients.find(
      r => r.user.toString() === rejecterId
    );
    if (!recipientEntry) {
      return res.status(403).json({ message: "You are not a recipient of this request" });
    }

    recipientEntry.action   = "rejected";
    recipientEntry.remarks  = remarks;
    recipientEntry.actionAt = new Date();

    request.status = "rejected";
    await request.save();

    res.json({ message: "Request rejected", request });
  } catch (error) {
    console.error("Reject error:", error);
    res.status(500).json({ message: "Rejection failed" });
  }
};

// ─── Stats ────────────────────────────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const { role, id } = req.user;
    let query = {};

    if (role === "student") {
      query = { student: id };
    } else if (role === "teacher" || role === "hod" || role === "principal") {
      query = { "recipients.user": id };
    }

    const requests = await Request.find(query);
    const stats = {
      total:    requests.length,
      approved: requests.filter(r => r.status === "approved").length,
      pending:  requests.filter(r => r.status === "pending").length,
      rejected: requests.filter(r => r.status === "rejected").length,
    };

    // Monthly breakdown (last 6 months)
    const monthly = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      monthly[key] = { approved: 0, pending: 0, rejected: 0 };
    }
    requests.forEach(r => {
      const d = new Date(r.createdAt);
      const key = d.toLocaleString("default", { month: "short", year: "2-digit" });
      if (monthly[key]) {
        if (r.status === "approved") monthly[key].approved++;
        else if (r.status === "pending") monthly[key].pending++;
        else if (r.status === "rejected") monthly[key].rejected++;
      }
    });

    res.json({ ...stats, monthly });
  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ message: "Error calculating stats" });
  }
};