const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  role:     { type: String },
  action:   { type: String, enum: ["pending", "approved", "rejected", "escalated"], default: "pending" },
  remarks:  { type: String, default: "" },
  actionAt: { type: Date }
});

const requestSchema = new mongoose.Schema({
  student:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  requestType: { type: String, required: true }, // Medical | Personal | Event | Campus Exit | Other
  reason:      { type: String, required: true },
  description: { type: String },
  fromDate:    { type: Date, required: true },
  toDate:      { type: Date, required: true },
  document:    { type: String }, // uploaded file path

  // Recipients chosen by the student
  recipients:  [recipientSchema],

  // Escalation
  escalatedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  escalatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Overall status
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },

  // QR Code
  qrToken:      { type: String },
  qrValidUntil: { type: Date },

}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);