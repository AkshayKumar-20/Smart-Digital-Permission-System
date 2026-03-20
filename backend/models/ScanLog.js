const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema({
  request:   { type: mongoose.Schema.Types.ObjectId, ref: "Request" },
  student:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  scannedAt: { type: Date, default: Date.now },
  result:    { type: String, enum: ["valid", "expired", "invalid"], required: true },
  details:   { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("ScanLog", scanLogSchema);
