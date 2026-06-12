const cron = require("node-cron");
const { syncCpppTenders } = require("../services/tender.scraper.service");

const startTenderCron = () => {
  let isRunning = false;

  console.log("🔥 Cron job initialized (waiting for schedule...)");

  cron.schedule("*/5 * * * *", async () => {
    console.log("⏰ Cron triggered at", new Date().toISOString());

    if (isRunning) {
      console.log("⚠️ Previous run still executing, skipping...");
      return;
    }

    isRunning = true;

    const startTime = Date.now();

    console.log("🚀 Sync started");

    try {
      await syncCpppTenders();

      console.log(
        "✅ Sync finished in",
        (Date.now() - startTime) / 1000,
        "sec",
      );
    } catch (err) {
      console.log("❌ Sync failed");
    } finally {
      isRunning = false;
    }
  });
};

module.exports = startTenderCron;
