const AppError = require("../utils/AppError");
const { decimalToNumber } = require("../utils/decimal");
const { validateMonthYear } = require("../utils/date");
const { positiveMoney, requiredString } = require("../utils/validators");
const categoryRepository = require("../repositories/categoryRepository");
const categoryLimitRepository = require("../repositories/categoryLimitRepository");

function formatLimit(limit) {
  return {
    ...limit,
    limitAmount: decimalToNumber(limit.limitAmount)
  };
}

async function ensureCategory(userId, categoryId) {
  const category = await categoryRepository.findAvailableById(userId, categoryId);

  if (!category) {
    throw new AppError("Category not found or unavailable for this user.", 404);
  }

  return category;
}

async function parseLimitPayload(userId, payload) {
  const categoryId = requiredString(payload.categoryId, "categoryId");
  const month = Number(payload.month);
  const year = Number(payload.year);

  validateMonthYear(month, year);
  await ensureCategory(userId, categoryId);

  return {
    categoryId,
    month,
    year,
    limitAmount: positiveMoney(payload.limitAmount, "limitAmount")
  };
}

async function listLimits(userId, query) {
  const filters = {};

  if (query.month) {
    filters.month = Number(query.month);
  }

  if (query.year) {
    filters.year = Number(query.year);
  }

  if (query.categoryId) {
    filters.categoryId = String(query.categoryId);
  }

  if (filters.month || filters.year) {
    validateMonthYear(filters.month || 1, filters.year || new Date().getUTCFullYear());
  }

  const limits = await categoryLimitRepository.findManyByUser(userId, filters);

  return limits.map(formatLimit);
}

async function saveLimit(userId, payload) {
  const data = await parseLimitPayload(userId, payload);
  const limit = await categoryLimitRepository.upsertByCategoryMonth(userId, data);

  return formatLimit(limit);
}

async function updateLimit(userId, limitId, payload) {
  const data = {};

  if (payload.categoryId !== undefined) {
    data.categoryId = requiredString(payload.categoryId, "categoryId");
    await ensureCategory(userId, data.categoryId);
  }

  if (payload.month !== undefined || payload.year !== undefined) {
    const month = Number(payload.month);
    const year = Number(payload.year);
    validateMonthYear(month, year);
    data.month = month;
    data.year = year;
  }

  if (payload.limitAmount !== undefined) {
    data.limitAmount = positiveMoney(payload.limitAmount, "limitAmount");
  }

  const limit = await categoryLimitRepository.updateByIdAndUser(limitId, userId, data);

  return formatLimit(limit);
}

module.exports = {
  listLimits,
  saveLimit,
  updateLimit
};
