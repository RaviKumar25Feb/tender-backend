function getBetween(text, startLabel, endLabel) {
  if (!text) return null;

  const start = text.indexOf(startLabel);

  if (start === -1) return null;

  const end = text.indexOf(endLabel, start + startLabel.length);

  if (end === -1) return null;

  const value = text
    .substring(start + startLabel.length, end)
    .replace(/\s+/g, " ")
    .trim();

  return value || null;
}

function getLastBetween(text, startLabel, endLabel) {
  if (!text) return null;

  const start = text.lastIndexOf(startLabel);

  if (start === -1) return null;

  const end = text.indexOf(endLabel, start + startLabel.length);

  if (end === -1) return null;

  const value = text
    .substring(start + startLabel.length, end)
    .replace(/\s+/g, " ")
    .trim();

  return value || null;
}

module.exports = {
  getBetween,
  getLastBetween,
};
