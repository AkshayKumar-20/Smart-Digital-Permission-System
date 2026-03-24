const mongoose = require("mongoose");
const dns = require("dns");

const connectDB = async (retries = 5) => {
  // Try Google DNS to work around ISP/network DNS issues
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 MongoDB connection attempt ${attempt}/${retries}...`);
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        family: 4,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`❌ Attempt ${attempt} failed: ${error.message}`);
      if (attempt < retries) {
        const delay = Math.min(1000 * 2 ** (attempt - 1), 10000);
        console.log(`⏳ Retrying in ${delay / 1000}s...`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  console.error("❌ All DB connection attempts failed. Server running without DB.");
  console.error("💡 Check: 1) Atlas cluster is active  2) IP is whitelisted  3) Internet is connected");
};

module.exports = connectDB; // THIS LINE IS VITAL