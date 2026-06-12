const cleanText = (text) => {
  if (!text) return null;
  return text.toString().trim().replace(/\s+/g, " ");
};

const parseNumber = (val) => {
  if (!val) return null;
  const num = val.toString().replace(/[^0-9]/g, "");
  return num ? Number(num) : null;
};

const parseDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
};

const extractState = (data) => {
  return data.state || data.location?.state || data.address?.state || null;
};

const extractCity = (data) => {
  return data.city || data.location?.city || data.address?.city || null;
};

const generateKeywords = (title = "", desc = "") => {
  return (title + " " + desc)
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .slice(0, 20);
};

const normalizeTender = (data) => {
  return {
    // SOURCE
    sourceTenderId: data.sourceTenderId || data.tenderId || data.id || null,

    sourcePortal: data.sourcePortal || "CPPP",
    sourceUrl: data.sourceUrl || null,

    // BASIC INFO
    title: cleanText(data.title),
    brief: cleanText(data.brief),
    description: cleanText(data.description),

    organization: cleanText(data.organization),
    department: cleanText(data.department),

    // LOCATION
    location: cleanText(data.location),
    city: extractCity(data),
    state: extractState(data),
    pincode: data.pincode || null,

    // DATES
    publishDate: parseDate(data.publishDate),
    submissionDate: parseDate(data.submissionDate),
    openingDate: parseDate(data.openingDate),
    closingDate: parseDate(data.closingDate),

    // FINANCIAL
    estimatedCost: parseNumber(data.estimatedCost),
    emdAmount: parseNumber(data.emdAmount),
    tenderFee: parseNumber(data.tenderFee),

    // DOCUMENTS / BOQ
    documents: Array.isArray(data.documents) ? data.documents : [],
    boqItems: Array.isArray(data.boqItems) ? data.boqItems : [],

    // META
    keywords: generateKeywords(
      cleanText(data.title),
      cleanText(data.description),
    ),

    status: "ACTIVE",

    rawData: data,
  };
};

module.exports = normalizeTender;
