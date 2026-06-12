const mongoose = require("mongoose");

const boqItemSchema = new mongoose.Schema(
  {
    itemNo: Number,
    itemCode: String,
    description: String,
    quantity: Number,
    unit: String,
    rate: Number,
    amount: Number,
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    name: String,

    type: {
      type: String,
      enum: ["TENDER_DOC", "BOQ", "CORRIGENDUM", "OTHER"],
      default: "OTHER",
    },

    url: String,

    fileSize: String,
  },
  { _id: false },
);

const tenderSchema = new mongoose.Schema(
  {
    // ==========================================
    // SOURCE
    // ==========================================

    sourceTenderId: {
      type: String,
      required: true,
      trim: true,
    },

    sourcePortal: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    sourceUrl: String,

    tenderReferenceNumber: {
      type: String,
      index: true,
    },

    // ==========================================
    // BASIC INFO
    // ==========================================

    title: {
      type: String,
      required: true,
      trim: true,
    },

    brief: String,

    description: String,

    workDescription: String,

    category: {
      type: String,
      index: true,
    },

    subCategory: String,

    tenderType: String,

    contractType: String,

    organization: {
      type: String,
      index: true,
    },

    department: {
      type: String,
      index: true,
    },

    // ==========================================
    // LOCATION
    // ==========================================

    location: String,

    city: {
      type: String,
      index: true,
    },

    state: {
      type: String,
      index: true,
    },

    pincode: String,

    // ==========================================
    // DATES
    // ==========================================

    publishDate: Date,

    submissionDate: {
      type: Date,
      index: true,
    },

    openingDate: Date,

    closingDate: Date,

    expiryDate: Date,

    // ==========================================
    // FINANCIAL
    // ==========================================

    estimatedCost: {
      type: Number,
      index: true,
    },

    emdAmount: Number,

    emdPercentage: Number,

    tenderFee: Number,

    currency: {
      type: String,
      default: "INR",
    },

    // ==========================================
    // WORK DETAILS
    // ==========================================

    bidValidityDays: Number,

    periodOfWorkDays: Number,

    quantity: String,

    // ==========================================
    // CONTACT
    // ==========================================

    website: String,

    contactPerson: String,

    contactNumber: String,

    contactEmail: String,

    contactAddress: String,

    authorityName: String,

    authorityAddress: String,

    // ==========================================
    // EXEMPTIONS
    // ==========================================

    msmeExemption: String,

    startupExemption: String,

    suretyBond: String,

    // ==========================================
    // ELIGIBILITY
    // ==========================================

    eligibilityCriteria: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
    },

    // ==========================================
    // DOCUMENTS
    // ==========================================

    documents: [documentSchema],

    // ==========================================
    // BOQ
    // ==========================================

    boqItems: [boqItemSchema],

    // ==========================================
    // SEARCH
    // ==========================================

    keywords: [String],

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["ACTIVE", "CLOSED", "CANCELLED", "AWARDED", "ARCHIVED"],
      default: "ACTIVE",
      index: true,
    },

    // ==========================================
    // SCRAPER DATA
    // ==========================================

    lastScrapedAt: Date,

    scrapedAt: {
      type: Date,
      default: Date.now,
    },

    rawData: mongoose.Schema.Types.Mixed,
  },
  {
    timestamps: true,
  },
);

// TEXT SEARCH
tenderSchema.index({
  title: "text",
  description: "text",
  organization: "text",
  category: "text",
});

// UNIQUE
tenderSchema.index(
  {
    sourcePortal: 1,
    sourceTenderId: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Tender", tenderSchema);
