const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  collegeId:  { type: String, required: true, unique: true },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "teacher", "hod", "principal", "watchman", "admin"],
    default: "student"
  },
  department: { type: String, required: true },
  year:       { type: String },      // students only
  section:    { type: String },      // students only
  phone:      { type: String },
  photo:      { type: String },      // URL / file path
}, { timestamps: true });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model("User", userSchema);