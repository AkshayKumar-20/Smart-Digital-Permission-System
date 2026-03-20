const express = require("express");
const cors    = require("cors");
const dotenv  = require("dotenv");
const path    = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve uploaded files (profile photos, documents)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/api/auth",     require("./routes/authRoutes"));
app.use("/api/requests", require("./routes/requestRoutes"));
app.use("/api/qr",       require("./routes/qrRoutes"));

// Health check
app.get("/", (req, res) => res.json({ message: "Smart Permission System API is running ✅" }));

// ─── Connect DB & Start Server ────────────────────────────────────────────────
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 API: /api/auth | /api/requests | /api/qr`);
});