const express = require("express");
const router  = express.Router();
const { protect, allowRoles } = require("../middleware/authMiddleware");
const multer  = require("multer");
const path    = require("path");
const {
  createRequest, getRequests, getRequestById,
  approveRequest, rejectRequest, getStats
} = require("../controllers/requestController");

// Multer for supporting document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "..", "uploads")),
  filename:    (req, file, cb) => cb(null, `doc_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".jpg", ".jpeg", ".png"];
    if (allowed.includes(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error("Only PDF and image files allowed"));
  }
});

// All request routes require authentication
router.use(protect);

router.get  ("/stats",          getStats);
router.get  ("/all",            getRequests);
router.get  ("/:id",            getRequestById);
router.post ("/add",            allowRoles("student"), upload.single("document"), createRequest);
router.put  ("/approve/:id",    allowRoles("teacher", "hod", "principal"), approveRequest);
router.put  ("/reject/:id",     allowRoles("teacher", "hod", "principal"), rejectRequest);

module.exports = router;