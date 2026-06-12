const Tender = require("../models/tender.model");
const { syncCpppTenders } = require("../services/tender.scraper.service");

const getTenders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      q,
      state,
      city,
      minValue,
      maxValue,
      closingFrom,
      closingTo,
    } = req.query;

    const filter = {};

    // 🔍 Text Search
    if (q) {
      filter.$text = { $search: q };
    }

    // 📍 Location filters
    if (state) filter.state = state;
    if (city) filter.city = city;

    // 💰 Estimated Cost filter
    if (minValue || maxValue) {
      filter.estimatedCost = {};
      if (minValue) filter.estimatedCost.$gte = Number(minValue);
      if (maxValue) filter.estimatedCost.$lte = Number(maxValue);
    }

    // 📅 Closing date filter
    if (closingFrom || closingTo) {
      filter.submissionDate = {};
      if (closingFrom) filter.submissionDate.$gte = new Date(closingFrom);
      if (closingTo) filter.submissionDate.$lte = new Date(closingTo);
    }

    const skip = (Number(page) - 1) * Number(limit);

    // ⚡ LIST OPTIMIZED QUERY (IMPORTANT PART)
    const tenders = await Tender.find(filter, {
      _id: 0,
      cpppId: 1,
      title: 1,
      state: 1,
      city: 1,
      department: 1,
      estimatedCost: 1,
      submissionDate: 1,
    })
      .sort({ submissionDate: -1 }) // latest first (better UX)
      .skip(skip)
      .limit(Number(limit))
      .lean(); // faster read-only query

    const total = await Tender.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: tenders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getTenderById = async (req, res) => {
  try {
    const { id } = req.params;

    const tender = await Tender.findById(id).lean();

    if (!tender) {
      return res.status(404).json({
        success: false,
        message: "Tender not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tender, // full document
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getStates = async (req, res) => {
  try {
    const states = await Tender.distinct("state");

    res.status(200).json({
      success: true,
      data: states,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCities = async (req, res) => {
  try {
    const cities = await Tender.distinct("city");

    res.status(200).json({
      success: true,
      data: cities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const triggerTenderSync = async (req, res) => {
  try {
    const result = syncCpppTenders();
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getTenders,
  getTenderById,
  getStates,
  getCities,
  triggerTenderSync,
};
