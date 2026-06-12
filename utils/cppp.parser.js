function getBetween(text, startLabel, endLabel) {
  const start = text.indexOf(startLabel);

  if (start === -1) return null;

  const end = text.indexOf(endLabel, start);

  if (end === -1) return null;

  return text.substring(start + startLabel.length, end).trim();
}

function getLastBetween(text, startLabel, endLabel) {
  const start = text.lastIndexOf(startLabel);

  if (start === -1) return null;

  const end = text.indexOf(endLabel, start);

  if (end === -1) return null;

  return text.substring(start + startLabel.length, end).trim();
}

module.exports = {
  getBetween,
  getLastBetween,
};
