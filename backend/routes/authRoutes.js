const express = require("express");
const router  = express.Router();
const { protect, allowRoles } = require("../middleware/authMiddleware");
const {
  loginUser, registerUser, getProfile, updateProfile, getRecipientsByDept
} = require("../controllers/authController");
const multer = require("multer");
const path   = require("path");

// Multer for profile photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename:    (req, file, cb) => cb(null, `photo_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes
router.post("/register", registerUser);
router.post("/login",    loginUser);

// Protected routes
router.get("/profile",              protect, getProfile);
router.put("/profile", protect,     upload.single("photo"), updateProfile);
router.get("/recipients",           protect, getRecipientsByDept);

module.exports = router;