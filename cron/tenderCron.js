const cron = require("node-cron");
const { syncCpppTenders } = require("../services/tender.scraper.service");

const startTenderCron = () => {
  let isRunning = false;

  const runSync = async () => {
    if (isRunning) {
      console.log("⏭️ Previous sync still running. Skipping...");
      return;
    }

    isRunning = true;

    const startTime = Date.now();

    try {
      console.log("🚀 Sync started");

      await syncCpppTenders();

      console.log(
        "✅ Sync finished in",
        ((Date.now() - startTime) / 1000).toFixed(2),
        "sec",
      );
    } catch (err) {
      console.error("❌ Sync failed:", err?.message || err);
    } finally {
      isRunning = false;
    }
  };

  console.log("🔥 Cron initialized");

  // Run once immediately when server starts
  runSync();

  // Then run every 10 minutes
  cron.schedule("*/10 * * * *", runSync, {
    timezone: "Asia/Kolkata",
  });
};

module.exports = startTenderCron;
