const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ─── Login ──────────────────────────────────────────────────────────────────
// Login uses collegeId (not email)
exports.loginUser = async (req, res) => {
  const { collegeId, password } = req.body;
  try {
    const user = await User.findOne({ collegeId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id:         user._id,
        name:       user.name,
        collegeId:  user.collegeId,
        email:      user.email,
        role:       user.role,
        department: user.department,
        year:       user.year,
        section:    user.section,
        phone:      user.phone,
        photo:      user.photo
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ─── Register ────────────────────────────────────────────────────────────────
exports.registerUser = async (req, res) => {
  const { name, collegeId, email, password, role, department, year, section, phone } = req.body;
  try {
    const existing = await User.findOne({ $or: [{ collegeId }, { email }] });
    if (existing) return res.status(400).json({ message: "User with this ID or email already exists" });

    const newUser = new User({ name, collegeId, email, password, role, department, year, section, phone });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

// ─── Get logged-in user profile ──────────────────────────────────────────────
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
};

// ─── Update profile ──────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const allowedUpdates = ["name", "email", "phone", "year", "section", "photo"];
    const updates = {};
    allowedUpdates.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });
    if (req.file) updates.photo = `/uploads/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Profile update failed" });
  }
};

// ─── Get users by role/department (for recipient selector) ───────────────────
exports.getRecipientsByDept = async (req, res) => {
  try {
    const { department } = req.query;
    if (!department) return res.status(400).json({ message: "Department required" });

    // Teachers & HOD of this department + principal (any dept)
    const recipients = await User.find({
      $or: [
        { role: { $in: ["teacher", "hod"] }, department },
        { role: "principal" }
      ]
    }).select("name collegeId role department");

    res.json(recipients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching recipients" });
  }
};