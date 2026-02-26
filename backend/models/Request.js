const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  requestType: { type: String, required: true }, // e.g., "Campus Exit", "Medical"
  reason: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ["pending", "approved_by_teacher", "approved_by_hod", "rejected", "out", "returned"],
    default: "pending"
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  exitTime: { type: Date },
  returnTime: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);