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

const createPage = async (browser) => {
  const page = await browser.newPage();

  page.setDefaultTimeout(60000);
  page.setDefaultNavigationTimeout(60000);

  return page;
};

const syncCpppTenders = async () => {
  console.log("SCRAPER_VERSION_16_JUNE_RENDER_STABLE_V2");

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

  try {
    // =========================
    // LIST PAGE
    // =========================

    listPage = await createPage(browser);

    await listPage.goto(
      "https://eprocure.gov.in/eprocure/app",
      {
        waitUntil: "domcontentloaded",
        timeout: 60000,
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

    // =========================
    // PROCESS TENDERS
    // =========================

    for (let i = 0; i < rowCount; i++) {
      let page = null;

      try {
        console.log(
          `Processing tender ${i + 1}/${rowCount}`
        );

        console.log(
          "Browser connected:",
          browser.isConnected()
        );

        if (!browser.isConnected()) {
          throw new Error(
            "Browser disconnected"
          );
        }

        page = await createPage(browser);

        await page.goto(
          "https://eprocure.gov.in/eprocure/app",
          {
            waitUntil: "domcontentloaded",
            timeout: 60000,
          }
        );

        await page.waitForSelector(
          "#activeTenders tbody tr",
          {
            timeout: 60000,
          }
        );

        const rows = page.locator(
          "#activeTenders tbody tr"
        );

        const row = rows.nth(i);

        await row.scrollIntoViewIfNeeded();

        const link = row.locator("a");

        await link.click({
          timeout: 60000,
        });

        // CPPP is flaky.
        // Do NOT use waitForNavigation().
        await page.waitForTimeout(5000);

        const detailData =
          await scrapeTenderDetail(page);

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
      } finally {
        try {
          if (
            page &&
            !page.isClosed()
          ) {
            await page.close();
          }
        } catch {}
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