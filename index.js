const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
require("dotenv").config();

const { dbConnect } = require("./configs/dbConnect");
const authRoutes = require("./routes/auth.routes");
const tenderRoutes = require("./routes/tender.routes");
const startTenderCron = require("./cron/tenderCron");

const PORT = process.env.PORT || 5000;

// ================= MIDDLEWARE =================
app.use(express.json());
app.use(cookieParser());

// ================= ROUTES =================
app.get("/", (req, res) => {
  res.send("<h1>Welcome to Tender247</h1>");
});

app.use("/api/auth", authRoutes);
app.use("/api/tenders", tenderRoutes);

// ================= GLOBAL ERROR HANDLERS =================
process.on("uncaughtException", (err) => {
  console.log("❌ Uncaught Exception:", err);
});

process.on("unhandledRejection", (err) => {
  console.log("❌ Unhandled Rejection:", err);
});

const startServer = async () => {
  try {
    console.log("🚀 Starting server...");

    await dbConnect();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);

      setTimeout(() => {
        try {
          startTenderCron();
        } catch (err) {
          console.log("❌ Cron start failed:", err.message);
        }
      }, 5000);
    });
  } catch (err) {
    console.log("❌ Server startup failed:", err.message);
    process.exit(1);
  }
};

startServer();
