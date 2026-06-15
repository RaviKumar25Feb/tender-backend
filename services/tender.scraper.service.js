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
  console.log("SCRAPER_VERSION_16_JUNE_STABLE");

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
    // =========================
    // STEP 1: OPEN LIST PAGE
    // =========================

    const listPage = await browser.newPage();

    listPage.setDefaultTimeout(30000);
    listPage.setDefaultNavigationTimeout(30000);

    await listPage.goto("https://eprocure.gov.in/eprocure/app", {
      waitUntil: "domcontentloaded",
    });

    await listPage.waitForSelector("#activeTenders tbody tr");

    const rowCount = await listPage
      .locator("#activeTenders tbody tr")
      .count();

    console.log(`Found ${rowCount} tenders`);

    // =========================
    // STEP 2: PROCESS EACH TENDER
    // =========================

    for (let i = 0; i < rowCount; i++) {
      let page;

      try {
        console.log(`Processing tender ${i + 1}/${rowCount}`);

        page = await browser.newPage();

        page.setDefaultTimeout(30000);
        page.setDefaultNavigationTimeout(30000);

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
          console.log(`Skipping tender ${i + 1}`);
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
          }
        );

        console.log(
          `Saved tender: ${normalizedData.sourceTenderId}`
        );
      } catch (err) {
        console.error(
          `Tender ${i + 1} failed:`,
          err.message
        );
      } finally {
        try {
          if (page && !page.isClosed()) {
            await page.close();
          }
        } catch {}
      }
    }

    if (!listPage.isClosed()) {
      await listPage.close();
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