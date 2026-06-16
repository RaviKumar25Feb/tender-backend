const scrapeTenderDetail = require("../scraper/cppp.detail.scraper");
const { chromium } = require("playwright");
const normalizeTender = require("../utils/normalizeTender");
const Tender = require("../models/tender.model");

const parseAmount = (value) => {
  if (!value) return null;

  const num = Number(
    value.toString().replace(/,/g, "").trim()
  );

  return isNaN(num) ? null : num;
};

const syncCpppTenders = async () => {
  console.log("SCRAPER_VERSION_16_JUNE_RENDER_STABLE");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding",
    ],
  });

  let listPage;
  let detailPage;

  try {
    // =========================
    // LIST PAGE
    // =========================

    listPage = await browser.newPage();

    listPage.setDefaultTimeout(60000);
    listPage.setDefaultNavigationTimeout(60000);

    await listPage.goto(
      "https://eprocure.gov.in/eprocure/app",
      {
        waitUntil: "domcontentloaded",
      }
    );

    await listPage.waitForSelector(
      "#activeTenders tbody tr",
      {
        timeout: 60000,
      }
    );

    const rowCount = await listPage
      .locator("#activeTenders tbody tr")
      .count();

    console.log(`Found ${rowCount} tenders`);

    // Single reusable page
    detailPage = await browser.newPage();

    detailPage.setDefaultTimeout(60000);
    detailPage.setDefaultNavigationTimeout(60000);

    for (let i = 0; i < rowCount; i++) {
      try {
        console.log(
          `Processing tender ${i + 1}/${rowCount}`
        );

        console.log(
          "Browser connected:",
          browser.isConnected()
        );

        // Reload homepage fresh
        await detailPage.goto(
          "https://eprocure.gov.in/eprocure/app",
          {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          }
        );

        await detailPage.waitForSelector(
          "#activeTenders tbody tr",
          {
            timeout: 60000,
          }
        );

        const rows = detailPage.locator(
          "#activeTenders tbody tr"
        );

        const row = rows.nth(i);

        await row.scrollIntoViewIfNeeded();

        const link = row.locator("a");

        await link.click({
          timeout: 60000,
        });

        // CPPP is flaky. Avoid waitForNavigation.
        await detailPage.waitForLoadState(
          "domcontentloaded"
        );

        await detailPage.waitForTimeout(3000);

        const detailData =
          await scrapeTenderDetail(detailPage);

        if (
          !detailData ||
          !detailData.tenderId
        ) {
          console.log(
            `Skipping tender ${i + 1} (No Tender ID)`
          );
          continue;
        }

        const rawInput = {
          sourcePortal: "CPPP",
          sourceTenderId:
            detailData.tenderId,

          tenderReferenceNumber:
            detailData.tenderReferenceNumber,

          title: detailData.title,
          brief: detailData.brief,
          description:
            detailData.description,

          workDescription:
            detailData.workDescription,

          organization:
            detailData.organisation,

          department:
            detailData.department,

          location:
            detailData.location,

          city: detailData.city,
          state: detailData.state,

          estimatedCost: parseAmount(
            detailData.tenderValue
          ),

          emdAmount: parseAmount(
            detailData.emdAmount
          ),

          tenderFee: parseAmount(
            detailData.tenderFee
          ),

          publishDate:
            detailData.publishDate,

          submissionDate:
            detailData.submissionDate,

          closingDate:
            detailData.closingDate,

          documents:
            detailData.documents || [],

          boqItems:
            detailData.boqItems || [],

          rawData: detailData,
        };

        const normalizedData =
          normalizeTender(rawInput);

        await Tender.updateOne(
          {
            sourcePortal: "CPPP",
            sourceTenderId:
              normalizedData.sourceTenderId,
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

        console.log(
          "Browser alive after error:",
          browser.isConnected()
        );

        continue;
      }
    }

    return {
      success: true,
      message: "Sync completed successfully",
    };
  } catch (error) {
    console.error(
      "CPPP Sync Error:",
      error
    );

    throw error;
  } finally {
    try {
      if (
        detailPage &&
        !detailPage.isClosed()
      ) {
        await detailPage.close();
      }
    } catch {}

    try {
      if (
        listPage &&
        !listPage.isClosed()
      ) {
        await listPage.close();
      }
    } catch {}

    try {
      if (browser.isConnected()) {
        await browser.close();
      }
    } catch {}
  }
};

module.exports = {
  syncCpppTenders,
};