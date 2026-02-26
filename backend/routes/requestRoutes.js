const express = require("express");
const router = express.Router();
const { createRequest, getRequests, updateStatus } = require("../controllers/requestController");
const { getStats } = require("../controllers/requestController");
router.get("/stats", getStats);

// @route   POST /api/requests/add
router.post("/add", createRequest);

// @route   GET /api/requests/all
router.get("/all", getRequests);

// @route   PUT /api/requests/update/:id
router.put("/update/:id", updateStatus);

module.exports = router;