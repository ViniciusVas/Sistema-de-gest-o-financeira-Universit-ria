const AppError = require("../utils/AppError");
const { buildDateWhere, parseDate } = require("../utils/date");
const { decimalToNumber, normalizeMoney } = require("../utils/decimal");
const {
  optionalString,
  positiveMoney,
  requiredString
} = require("../utils/validators");
const incomeRepository = require("../repositories/incomeRepository");

function formatIncome(income) {
  return {
    ...income,
    amount: decimalToNumber(income.amount)
  };
}

function buildIncomeData(payload, partial = false) {
  const data = {};

  if (!partial || payload.description !== undefined) {
    data.description = requiredString(payload.description, "description");
  }

  if (!partial || payload.amount !== undefined) {
    data.amount = positiveMoney(payload.amount, "amount");
  }

  if (!partial || payload.date !== undefined) {
    data.date = parseDate(payload.date, "date");
  }

  if (payload.source !== undefined) {
    data.source = optionalString(payload.source);
  }

  if (payload.notes !== undefined) {
    data.notes = optionalString(payload.notes);
  }

  if (payload.isRecurring !== undefined) {
    data.isRecurring = Boolean(payload.isRecurring);
  }

  return data;
}

function buildFilters(query) {
  const filters = {};
  const date = buildDateWhere(query);

  if (date) {
    filters.date = date;
  }

  if (query.minAmount !== undefined) {
    const minAmount = normalizeMoney(query.minAmount);

    if (minAmount === null || minAmount < 0) {
      throw new AppError("minAmount must be zero or greater.");
    }

    filters.minAmount = minAmount;
  }

  if (query.maxAmount !== undefined) {
    const maxAmount = normalizeMoney(query.maxAmount);

    if (maxAmount === null || maxAmount < 0) {
      throw new AppError("maxAmount must be zero or greater.");
    }

    filters.maxAmount = maxAmount;
  }

  return filters;
}

async function createIncome(userId, payload) {
  const data = buildIncomeData(payload);
  const income = await incomeRepository.create({
    ...data,
    userId
  });

  return formatIncome(income);
}

async function listIncomes(userId, query) {
  const filters = buildFilters(query);
  const incomes = await incomeRepository.findManyByUser(userId, filters);

  return incomes.map(formatIncome);
}

async function updateIncome(userId, incomeId, payload) {
  const exists = await incomeRepository.findByIdAndUser(incomeId, userId);

  if (!exists) {
    throw new AppError("Income not found.", 404);
  }

  const data = buildIncomeData(payload, true);
  const income = await incomeRepository.updateByIdAndUser(incomeId, userId, data);

  return formatIncome(income);
}

async function deleteIncome(userId, incomeId) {
  const exists = await incomeRepository.findByIdAndUser(incomeId, userId);

  if (!exists) {
    throw new AppError("Income not found.", 404);
  }

  await incomeRepository.deleteByIdAndUser(incomeId, userId);
}

module.exports = {
  createIncome,
  deleteIncome,
  listIncomes,
  updateIncome
};
