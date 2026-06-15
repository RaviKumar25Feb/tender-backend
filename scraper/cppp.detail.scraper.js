const { getBetween, getLastBetween } = require("../utils/cppp.parser");

async function scrapeTenderDetail(page) {
  try {
    if (!page || page.isClosed()) {
      throw new Error("Page already closed");
    }

    await page.waitForLoadState("domcontentloaded");

    await page.waitForSelector("body", {
      timeout: 30000,
    });

    const text = await page.textContent("body");

    if (!text || !text.trim()) {
      throw new Error("Empty page content");
    }

    const tenderId = getBetween(
      text,
      "Tender ID",
      "Withdrawal Allowed"
    );

    if (!tenderId) {
      return null;
    }

    return {
      organisation: getBetween(
        text,
        "Organisation Chain",
        "Tender Reference Number"
      ),

      tenderReferenceNumber: getBetween(
        text,
        "Tender Reference Number",
        "Tender ID"
      ),

      tenderId,

      title: getBetween(
        text,
        "Title",
        "Work Description"
      ),

      workDescription: getBetween(
        text,
        "Work Description",
        "NDA/Pre Qualification"
      ),

      tenderValue: getBetween(
        text,
        "Tender Value in ₹",
        "Product Category"
      ),

      location: getLastBetween(
        text,
        "Location",
        "Pincode"
      ),

      emdAmount: getBetween(
        text,
        "EMD Amount in ₹",
        "EMD Exemption Allowed"
      ),

      tenderFee: getBetween(
        text,
        "Tender Fee in ₹",
        "Fee Payable To"
      ),
    };
  } catch (error) {
    console.error(
      "scrapeTenderDetail error:",
      error.message
    );
    return null;
  }
}

module.exports = scrapeTenderDetail;