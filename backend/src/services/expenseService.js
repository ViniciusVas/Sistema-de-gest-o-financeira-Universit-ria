const AppError = require("../utils/AppError");
const { buildDateWhere, parseDate } = require("../utils/date");
const { decimalToNumber, normalizeMoney } = require("../utils/decimal");
const {
  optionalString,
  positiveMoney,
  requiredExpenseType,
  requiredPaymentMethod,
  requiredString
} = require("../utils/validators");
const categoryRepository = require("../repositories/categoryRepository");
const expenseRepository = require("../repositories/expenseRepository");

function formatExpense(expense) {
  return {
    ...expense,
    amount: decimalToNumber(expense.amount)
  };
}

async function ensureCategoryCanBeUsed(userId, categoryId) {
  const category = await categoryRepository.findAvailableById(userId, categoryId);

  if (!category) {
    throw new AppError("Category not found or unavailable for this user.", 404);
  }

  return category;
}

async function buildExpenseData(userId, payload, partial = false) {
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

  if (!partial || payload.categoryId !== undefined) {
    data.categoryId = requiredString(payload.categoryId, "categoryId");
    await ensureCategoryCanBeUsed(userId, data.categoryId);
  }

  if (!partial || payload.expenseType !== undefined) {
    data.expenseType = requiredExpenseType(payload.expenseType);
  }

  if (!partial || payload.paymentMethod !== undefined) {
    data.paymentMethod = requiredPaymentMethod(payload.paymentMethod);
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

  if (query.categoryId) {
    filters.categoryId = String(query.categoryId);
  }

  if (query.expenseType) {
    filters.expenseType = requiredExpenseType(query.expenseType);
  }

  if (query.paymentMethod) {
    filters.paymentMethod = requiredPaymentMethod(query.paymentMethod);
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

async function createExpense(userId, payload) {
  const data = await buildExpenseData(userId, payload);
  const expense = await expenseRepository.create({
    ...data,
    userId
  });

  return formatExpense(expense);
}

async function listExpenses(userId, query) {
  const filters = buildFilters(query);
  const expenses = await expenseRepository.findManyByUser(userId, filters);

  return expenses.map(formatExpense);
}

async function updateExpense(userId, expenseId, payload) {
  const exists = await expenseRepository.findByIdAndUser(expenseId, userId);

  if (!exists) {
    throw new AppError("Expense not found.", 404);
  }

  const data = await buildExpenseData(userId, payload, true);
  const expense = await expenseRepository.updateByIdAndUser(expenseId, userId, data);

  return formatExpense(expense);
}

async function deleteExpense(userId, expenseId) {
  const exists = await expenseRepository.findByIdAndUser(expenseId, userId);

  if (!exists) {
    throw new AppError("Expense not found.", 404);
  }

  await expenseRepository.deleteByIdAndUser(expenseId, userId);
}

module.exports = {
  createExpense,
  deleteExpense,
  listExpenses,
  updateExpense
};
