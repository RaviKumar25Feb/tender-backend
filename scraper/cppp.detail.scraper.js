const { getBetween, getLastBetween } = require("../utils/cppp.parser");

async function scrapeTenderDetail(page) {
  const text = await page.locator("body").innerText();

  const locationIndex = text.lastIndexOf("Location");

  return {
    organisation: getBetween(
      text,
      "Organisation Chain",
      "Tender Reference Number",
    ),

    tenderReferenceNumber: getBetween(
      text,
      "Tender Reference Number",
      "Tender ID",
    ),

    tenderId: getBetween(text, "Tender ID", "Withdrawal Allowed"),

    title: getBetween(text, "Title", "Work Description"),

    workDescription: getBetween(
      text,
      "Work Description",
      "NDA/Pre Qualification",
    ),

    tenderValue: getBetween(text, "Tender Value in ₹", "Product Category"),

    location: getLastBetween(text, "Location", "Pincode"),

    emdAmount: getBetween(text, "EMD Amount in ₹", "EMD Exemption Allowed"),

    tenderFee: getBetween(text, "Tender Fee in ₹", "Fee Payable To"),
  };
}

module.exports = scrapeTenderDetail;
