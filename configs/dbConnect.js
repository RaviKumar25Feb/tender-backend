const mongoose = require("mongoose");
const dns = require("node:dns/promises");

exports.dbConnect = async () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ DB connected successfully");
  } catch (error) {
    console.log("❌ Database connection failed:", error.message);
    throw error; // let index.js handle it
  }
};
