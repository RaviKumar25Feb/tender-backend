const scrapeTenderDetail = require("../scraper/cppp.detail.scraper");
const { chromium } = require("playwright");
const { saveTender } = require("./tender.service");
const normalizeTender = require("../utils/normalizeTender");
const Tender = require("../models/tender.model");

const parseAmount = (value) => {
  if (!value) return null;

  const num = Number(value.toString().replace(/,/g, "").trim());

  return isNaN(num) ? null : num;
};

const syncCpppTenders = async () => {
  console.log("🚀 Sync started");
  console.log("📍 Playwright executable path:");
  console.log(chromium.executablePath());

  const browser = await chromium.launch({
    executablePath: chromium.executablePath(),
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });

  try {
    const page = await browser.newPage();

    // =========================
    // STEP 1: OPEN LIST PAGE
    // =========================
    await page.goto("https://eprocure.gov.in/eprocure/app", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("#activeTenders tbody tr");

    const rows = page.locator("#activeTenders tbody tr");
    const rowCount = await rows.count();

    // =========================
    // STEP 2: LOOP EACH TENDER
    // =========================
    for (let i = 0; i < rowCount; i++) {
      // Reload list page each time (safe navigation)
      await page.goto("https://eprocure.gov.in/eprocure/app", {
        waitUntil: "domcontentloaded",
      });

      await page.waitForSelector("#activeTenders tbody tr");

      const rows = page.locator("#activeTenders tbody tr");

      // Click tender link
      await Promise.all([
        page.waitForLoadState("networkidle"),
        rows.nth(i).locator("a").click(),
      ]);

      // =========================
      // STEP 3: SCRAPE DETAIL PAGE
      // =========================
      const detailData = await scrapeTenderDetail(page);

      if (!detailData || !detailData.tenderId) {
        continue;
      }

      // =========================
      // STEP 4: BUILD RAW INPUT
      // =========================
      const rawInput = {
        sourcePortal: "CPPP",
        sourceTenderId: detailData.tenderId,
        tenderReferenceNumber: detailData.tenderReferenceNumber,

        title: detailData.title,
        brief: detailData.brief,
        description: detailData.description,

        workDescription: detailData.workDescription,

        organization: detailData.organisation,
        department: detailData.department,

        location: detailData.location,
        city: detailData.city,
        state: detailData.state,

        estimatedCost: parseAmount(detailData.tenderValue),
        emdAmount: parseAmount(detailData.emdAmount),
        tenderFee: parseAmount(detailData.tenderFee),

        publishDate: detailData.publishDate,
        submissionDate: detailData.submissionDate,
        closingDate: detailData.closingDate,

        documents: detailData.documents || [],
        boqItems: detailData.boqItems || [],

        rawData: detailData,
      };

      // =========================
      // STEP 5: NORMALIZATION
      // =========================
      const normalizedData = normalizeTender(rawInput);

      // =========================
      // STEP 6: SAVE TO DB (UPSERT)
      // =========================
      await Tender.updateOne(
        {
          sourcePortal: "CPPP",
          sourceTenderId: normalizedData.sourceTenderId,
        },
        {
          $set: {
            ...normalizedData,
            lastScrapedAt: new Date(),
          },
        },
        {
          upsert: true,
        },
      );
    }

    return {
      success: true,
      message: "Sync completed successfully",
    };
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  } finally {
    await browser.close();
  }
};

module.exports = {
  syncCpppTenders,
};
