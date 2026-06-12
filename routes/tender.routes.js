const express = require("express");
const router = express.Router();

const {
  getTenders,
  getTenderById,
  getStates,
  getCities,
  triggerTenderSync,
} = require("../controllers/tender.controller");


router.get("/", getTenders);
router.get("/states", getStates);
router.get("/cities", getCities);

// Fetch tenders using Scraping
router.get("/sync-tenders", triggerTenderSync);

// IMPORTANT: restrict to Mongo ObjectId only
router.get("/:id", getTenderById);

module.exports = router;
