const AppError = require("./AppError");

function parseInteger(value, fieldName) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed)) {
    throw new AppError(`${fieldName} must be an integer.`);
  }

  return parsed;
}

function parseMonthYear(query) {
  const now = new Date();
  const month = query.month ? parseInteger(query.month, "month") : now.getUTCMonth() + 1;
  const year = query.year ? parseInteger(query.year, "year") : now.getUTCFullYear();

  validateMonthYear(month, year);

  return { month, year };
}

function validateMonthYear(month, year) {
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new AppError("month must be an integer between 1 and 12.");
  }

  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new AppError("year must be an integer between 2000 and 2100.");
  }
}

function getMonthRange(month, year) {
  validateMonthYear(month, year);

  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  return { startDate, endDate };
}

function buildDateWhere(query) {
  if (query.month || query.year) {
    const { month, year } = parseMonthYear(query);
    const { startDate, endDate } = getMonthRange(month, year);

    return {
      gte: startDate,
      lt: endDate
    };
  }

  const where = {};

  if (query.startDate) {
    const startDate = parseDate(query.startDate, "startDate");
    where.gte = startDate;
  }

  if (query.endDate) {
    const endDate = parseDate(query.endDate, "endDate");
    where.lte = endDate;
  }

  return Object.keys(where).length ? where : undefined;
}

function parseDate(value, fieldName = "date") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new AppError(`${fieldName} must be a valid date.`);
  }

  return date;
}

module.exports = {
  buildDateWhere,
  getMonthRange,
  parseDate,
  parseMonthYear,
  validateMonthYear
};
