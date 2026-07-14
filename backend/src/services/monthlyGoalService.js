const { decimalToNumber } = require("../utils/decimal");
const { nonNegativeMoney } = require("../utils/validators");
const { validateMonthYear } = require("../utils/date");
const monthlyGoalRepository = require("../repositories/monthlyGoalRepository");

function formatGoal(goal) {
  return {
    ...goal,
    targetAmount: decimalToNumber(goal.targetAmount)
  };
}

function parseGoalPayload(payload) {
  const month = Number(payload.month);
  const year = Number(payload.year);

  validateMonthYear(month, year);

  return {
    month,
    year,
    targetAmount: nonNegativeMoney(payload.targetAmount, "targetAmount")
  };
}

async function listGoals(userId, query) {
  const filters = {};

  if (query.month) {
    filters.month = Number(query.month);
  }

  if (query.year) {
    filters.year = Number(query.year);
  }

  if (filters.month || filters.year) {
    validateMonthYear(filters.month || 1, filters.year || new Date().getUTCFullYear());
  }

  const goals = await monthlyGoalRepository.findManyByUser(userId, filters);

  return goals.map(formatGoal);
}

async function saveGoal(userId, payload) {
  const data = parseGoalPayload(payload);
  const goal = await monthlyGoalRepository.upsertByMonth(userId, data);

  return formatGoal(goal);
}

async function updateGoal(userId, goalId, payload) {
  const data = {};

  if (payload.month !== undefined || payload.year !== undefined) {
    const month = Number(payload.month);
    const year = Number(payload.year);
    validateMonthYear(month, year);
    data.month = month;
    data.year = year;
  }

  if (payload.targetAmount !== undefined) {
    data.targetAmount = nonNegativeMoney(payload.targetAmount, "targetAmount");
  }

  const goal = await monthlyGoalRepository.updateByIdAndUser(goalId, userId, data);

  return formatGoal(goal);
}

module.exports = {
  listGoals,
  saveGoal,
  updateGoal
};
