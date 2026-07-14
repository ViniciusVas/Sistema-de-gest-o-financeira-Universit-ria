const { ExpenseType } = require("@prisma/client");

const { decimalToNumber } = require("../utils/decimal");
const { getMonthRange, parseMonthYear } = require("../utils/date");
const incomeRepository = require("../repositories/incomeRepository");
const expenseRepository = require("../repositories/expenseRepository");
const monthlyGoalRepository = require("../repositories/monthlyGoalRepository");
const categoryLimitRepository = require("../repositories/categoryLimitRepository");

function roundMoney(value) {
  return Number(value.toFixed(2));
}

function getLimitStatus(percentageUsed) {
  if (percentageUsed >= 100) {
    return "exceeded";
  }

  if (percentageUsed >= 90) {
    return "high_risk";
  }

  if (percentageUsed >= 70) {
    return "attention";
  }

  return "normal";
}

function getLimitMessage(status, categoryName, percentageUsed) {
  const rounded = Math.round(percentageUsed);

  if (status === "exceeded") {
    return `O limite de ${categoryName} foi ultrapassado.`;
  }

  if (status === "high_risk") {
    return `Risco alto: ${categoryName} chegou a ${rounded}% do limite.`;
  }

  if (status === "attention") {
    return `Atenção: ${categoryName} chegou a ${rounded}% do limite.`;
  }

  return `${categoryName} está dentro do limite planejado.`;
}

async function getDashboardBase(userId, query) {
  const { month, year } = parseMonthYear(query);
  const { startDate, endDate } = getMonthRange(month, year);

  return { month, year, startDate, endDate };
}

async function getMonthlySummary(userId, query) {
  const { month, year, startDate, endDate } = await getDashboardBase(userId, query);

  const [
    incomeSum,
    expenseSum,
    fixedExpenseSum,
    variableExpenseSum,
    monthlyGoal
  ] = await Promise.all([
    incomeRepository.sumByPeriod(userId, startDate, endDate),
    expenseRepository.sumByPeriod(userId, startDate, endDate),
    expenseRepository.sumByType(userId, startDate, endDate, ExpenseType.FIXED),
    expenseRepository.sumByType(userId, startDate, endDate, ExpenseType.VARIABLE),
    monthlyGoalRepository.findByMonth(userId, month, year)
  ]);

  const totalIncomes = decimalToNumber(incomeSum._sum.amount);
  const totalExpenses = decimalToNumber(expenseSum._sum.amount);
  const fixedExpenses = decimalToNumber(fixedExpenseSum._sum.amount);
  const variableExpenses = decimalToNumber(variableExpenseSum._sum.amount);
  const balance = roundMoney(totalIncomes - totalExpenses);
  const targetAmount = monthlyGoal ? decimalToNumber(monthlyGoal.targetAmount) : 0;
  const progressPercentage = targetAmount > 0 ? roundMoney((balance / targetAmount) * 100) : 0;
  const achieved = targetAmount > 0 ? balance >= targetAmount : false;
  const missingAmount = targetAmount > 0 && balance < targetAmount ? roundMoney(targetAmount - balance) : 0;

  return {
    month,
    year,
    totalIncomes,
    totalExpenses,
    balance,
    fixedExpenses,
    variableExpenses,
    goal: monthlyGoal
      ? {
          id: monthlyGoal.id,
          targetAmount,
          progressPercentage,
          achieved,
          missingAmount
        }
      : null
  };
}

async function getCategoryExpenses(userId, query) {
  const { month, year, startDate, endDate } = await getDashboardBase(userId, query);
  const expenses = await expenseRepository.findByPeriodWithCategory(userId, startDate, endDate);
  const totalsByCategory = new Map();
  let totalExpenses = 0;

  for (const expense of expenses) {
    const amount = decimalToNumber(expense.amount);
    totalExpenses += amount;

    const current = totalsByCategory.get(expense.categoryId) || {
      categoryId: expense.categoryId,
      categoryName: expense.category.name,
      total: 0
    };

    current.total = roundMoney(current.total + amount);
    totalsByCategory.set(expense.categoryId, current);
  }

  const categories = Array.from(totalsByCategory.values()).map((item) => ({
    ...item,
    percentage: totalExpenses > 0 ? roundMoney((item.total / totalExpenses) * 100) : 0
  }));

  categories.sort((a, b) => b.total - a.total);

  return {
    month,
    year,
    totalExpenses: roundMoney(totalExpenses),
    categories
  };
}

async function getLimitAlerts(userId, query) {
  const { month, year, startDate, endDate } = await getDashboardBase(userId, query);
  const [limits, expenses] = await Promise.all([
    categoryLimitRepository.findManyByUser(userId, { month, year }),
    expenseRepository.findByPeriodWithCategory(userId, startDate, endDate)
  ]);

  const spentByCategory = new Map();

  for (const expense of expenses) {
    const current = spentByCategory.get(expense.categoryId) || 0;
    spentByCategory.set(expense.categoryId, roundMoney(current + decimalToNumber(expense.amount)));
  }

  const alerts = limits.map((limit) => {
    const limitAmount = decimalToNumber(limit.limitAmount);
    const spentAmount = spentByCategory.get(limit.categoryId) || 0;
    const percentageUsed = limitAmount > 0 ? roundMoney((spentAmount / limitAmount) * 100) : 0;
    const status = getLimitStatus(percentageUsed);

    return {
      categoryLimitId: limit.id,
      categoryId: limit.categoryId,
      categoryName: limit.category.name,
      limitAmount,
      spentAmount,
      percentageUsed,
      status,
      message: getLimitMessage(status, limit.category.name, percentageUsed)
    };
  });

  alerts.sort((a, b) => b.percentageUsed - a.percentageUsed);

  return {
    month,
    year,
    alerts
  };
}

module.exports = {
  getCategoryExpenses,
  getLimitAlerts,
  getMonthlySummary
};
