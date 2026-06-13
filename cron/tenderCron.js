const cron = require("node-cron");
const { syncCpppTenders } = require("../services/tender.scraper.service");

const startTenderCron = () => {
  let isRunning = false;

  console.log("🔥 Cron initialized");

  cron.schedule("*/5 * * * *", async () => {
    if (isRunning) return;

    isRunning = true;

    const startTime = Date.now();

    try {
      console.log("🚀 Sync started");

      await syncCpppTenders();

      console.log(
        "✅ Sync finished in",
        (Date.now() - startTime) / 1000,
        "sec",
      );
    } catch (err) {
      console.log("❌ Sync failed:", err.message);
    } finally {
      isRunning = false;
    }
  });
};

module.exports = startTenderCron;
