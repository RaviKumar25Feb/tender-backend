// services/tender.service.js
const Tender = require("../models/tender.model");

const saveTender = async (tenderData) => {
  return Tender.findOneAndUpdate(
    {
      sourcePortal: tenderData.sourcePortal,
      sourceTenderId: tenderData.sourceTenderId,
    },
    {
      $set: tenderData,
    },
    {
      upsert: true,
      returnDocument: "after",
    },
  );
};

module.exports = {
  saveTender,
};
