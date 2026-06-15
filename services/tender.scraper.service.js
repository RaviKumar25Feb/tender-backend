const scrapeTenderDetail = require("../scraper/cppp.detail.scraper");
const { chromium } = require("playwright");
const normalizeTender = require("../utils/normalizeTender");
const Tender = require("../models/tender.model");

const parseAmount = (value) => {
  if (!value) return null;

  const num = Number(value.toString().replace(/,/g, "").trim());

  return isNaN(num) ? null : num;
};

const syncCpppTenders = async () => {
  console.log("SCRAPER_VERSION_15_JUNE_RENDER_FIX");

  const browser = await chromium.launch({
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

    page.setDefaultTimeout(30000);
    page.setDefaultNavigationTimeout(30000);

    await page.goto("https://eprocure.gov.in/eprocure/app", {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("#activeTenders tbody tr");

    const initialRows = page.locator("#activeTenders tbody tr");
    const rowCount = await initialRows.count();

    console.log(`Found ${rowCount} tenders`);

    for (let i = 0; i < rowCount; i++) {
      try {
        console.log(`Processing tender ${i + 1}/${rowCount}`);

        await page.goto("https://eprocure.gov.in/eprocure/app", {
          waitUntil: "domcontentloaded",
        });

        await page.waitForSelector("#activeTenders tbody tr");

        const rows = page.locator("#activeTenders tbody tr");

        await Promise.all([
          page.waitForNavigation({
            waitUntil: "domcontentloaded",
            timeout: 30000,
          }),
          rows.nth(i).locator("a").click(),
        ]);

        await page.waitForTimeout(2000);

        const detailData = await scrapeTenderDetail(page);

        if (!detailData || !detailData.tenderId) {
          console.log(`Skipping tender ${i} - no tender id`);
          continue;
        }

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

        const normalizedData = normalizeTender(rawInput);

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

        console.log(`Saved tender: ${normalizedData.sourceTenderId}`);
      } catch (err) {
        console.error(`Tender ${i + 1} failed:`, err.message);
        continue;
      }
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
