const { decimalToNumber } = require("../utils/decimal");
const { validateMonthYear } = require("../utils/date");
const reportRepository = require("../repositories/reportRepository");

function roundMoney(value) {
  return Number(value.toFixed(2));
}

function parseYear(query) {
  if (!query.year) {
    return null;
  }

  const year = Number(query.year);
  validateMonthYear(1, year);

  return year;
}

function getMonthKeyFromDate(date) {
  const month = date.getUTCMonth() + 1;
  const year = date.getUTCFullYear();

  return getMonthKey(month, year);
}

function getMonthKey(month, year) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function createHistoryItem(month, year) {
  return {
    month,
    year,
    totalIncomes: 0,
    totalExpenses: 0,
    balance: 0,
    goal: null
  };
}

function getOrCreateItem(historyMap, month, year) {
  const key = getMonthKey(month, year);

  if (!historyMap.has(key)) {
    historyMap.set(key, createHistoryItem(month, year));
  }

  return historyMap.get(key);
}

function applyGoalStatus(item) {
  if (!item.goal) {
    return item;
  }

  const targetAmount = item.goal.targetAmount;
  const achieved = item.balance >= targetAmount;
  const missingAmount = achieved ? 0 : roundMoney(targetAmount - item.balance);
  const progressPercentage = targetAmount > 0
    ? roundMoney((item.balance / targetAmount) * 100)
    : 0;

  item.goal = {
    ...item.goal,
    achieved,
    missingAmount,
    progressPercentage
  };

  return item;
}

async function getMonthlyHistory(userId, query) {
  const year = parseYear(query);
  const [incomes, expenses, goals] = await Promise.all([
    reportRepository.findIncomesForHistory(userId, year),
    reportRepository.findExpensesForHistory(userId, year),
    reportRepository.findGoalsForHistory(userId, year)
  ]);

  const historyMap = new Map();

  for (const income of incomes) {
    const key = getMonthKeyFromDate(income.date);
    const month = income.date.getUTCMonth() + 1;
    const incomeYear = income.date.getUTCFullYear();
    const item = getOrCreateItem(historyMap, month, incomeYear);

    item.totalIncomes = roundMoney(item.totalIncomes + decimalToNumber(income.amount));
  }

  for (const expense of expenses) {
    const key = getMonthKeyFromDate(expense.date);
    const month = expense.date.getUTCMonth() + 1;
    const expenseYear = expense.date.getUTCFullYear();
    const item = getOrCreateItem(historyMap, month, expenseYear);

    item.totalExpenses = roundMoney(item.totalExpenses + decimalToNumber(expense.amount));
  }

  for (const goal of goals) {
    const item = getOrCreateItem(historyMap, goal.month, goal.year);

    item.goal = {
      targetAmount: decimalToNumber(goal.targetAmount)
    };
  }

  const history = Array.from(historyMap.values())
    .map((item) => {
      item.balance = roundMoney(item.totalIncomes - item.totalExpenses);
      return applyGoalStatus(item);
    })
    .sort((a, b) => {
      if (a.year !== b.year) {
        return b.year - a.year;
      }

      return b.month - a.month;
    });

  return {
    year,
    history
  };
}

module.exports = {
  getMonthlyHistory
};
