const cleanText = (text) => {
  if (!text) return null;

  const cleaned = text.toString().replace(/\s+/g, " ").trim();

  return cleaned || null;
};

const parseNumber = (val) => {
  if (!val) return null;

  const num = Number(
    val
      .toString()
      .replace(/,/g, "")
      .replace(/[^\d.]/g, ""),
  );

  return isNaN(num) ? null : num;
};

const parseDate = (val) => {
  if (!val) return null;

  const date = new Date(val);

  return isNaN(date.getTime()) ? null : date;
};

const extractState = (data) => {
  return data.state || data.location?.state || data.address?.state || null;
};

const extractCity = (data) => {
  return data.city || data.location?.city || data.address?.city || null;
};

const generateKeywords = (title = "", desc = "") => {
  return [
    ...new Set(`${title} ${desc}`.toLowerCase().split(/\s+/).filter(Boolean)),
  ].slice(0, 20);
};

const normalizeTender = (data) => {
  return {
    // SOURCE
    sourceTenderId: data.sourceTenderId || data.tenderId || data.id || null,

    sourcePortal: data.sourcePortal || "CPPP",

    sourceUrl: cleanText(data.sourceUrl),

    // BASIC INFO
    title: cleanText(data.title),
    brief: cleanText(data.brief),
    description: cleanText(data.description),

    organization: cleanText(data.organization),

    department: cleanText(data.department),

    // LOCATION
    location: cleanText(data.location),

    city: cleanText(extractCity(data)),

    state: cleanText(extractState(data)),

    pincode: cleanText(data.pincode),

    // DATES
    publishDate: parseDate(data.publishDate),

    submissionDate: parseDate(data.submissionDate),

    openingDate: parseDate(data.openingDate),

    closingDate: parseDate(data.closingDate),

    // FINANCIAL
    estimatedCost: parseNumber(data.estimatedCost),

    emdAmount: parseNumber(data.emdAmount),

    tenderFee: parseNumber(data.tenderFee),

    // DOCUMENTS
    documents: Array.isArray(data.documents) ? data.documents : [],

    boqItems: Array.isArray(data.boqItems) ? data.boqItems : [],

    // META
    keywords: generateKeywords(
      cleanText(data.title) || "",
      cleanText(data.description) || "",
    ),

    status: cleanText(data.status) || "ACTIVE",

    rawData: data,
  };
};

module.exports = normalizeTender;
