const prisma = require("../utils/prisma");

function buildDateFilter(year) {
  if (!year) {
    return undefined;
  }

  return {
    gte: new Date(Date.UTC(year, 0, 1)),
    lt: new Date(Date.UTC(year + 1, 0, 1))
  };
}

async function findIncomesForHistory(userId, year) {
  return prisma.income.findMany({
    where: {
      userId,
      ...(year ? { date: buildDateFilter(year) } : {})
    },
    select: {
      amount: true,
      date: true
    }
  });
}

async function findExpensesForHistory(userId, year) {
  return prisma.expense.findMany({
    where: {
      userId,
      ...(year ? { date: buildDateFilter(year) } : {})
    },
    select: {
      amount: true,
      date: true
    }
  });
}

async function findGoalsForHistory(userId, year) {
  return prisma.monthlyGoal.findMany({
    where: {
      userId,
      ...(year ? { year } : {})
    },
    select: {
      month: true,
      year: true,
      targetAmount: true
    }
  });
}

module.exports = {
  findExpensesForHistory,
  findGoalsForHistory,
  findIncomesForHistory
};
