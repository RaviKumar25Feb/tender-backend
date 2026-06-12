const mongoose = require("mongoose");
const dns = require("node:dns/promises");

exports.dbConnect = async () => {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`DB connected successfully`);
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};
