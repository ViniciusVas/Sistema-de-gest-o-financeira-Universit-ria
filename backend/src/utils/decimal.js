function decimalToNumber(value) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

function normalizeMoney(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const normalized = Number(value);

  if (!Number.isFinite(normalized)) {
    return null;
  }

  return Number(normalized.toFixed(2));
}

module.exports = {
  decimalToNumber,
  normalizeMoney
};
