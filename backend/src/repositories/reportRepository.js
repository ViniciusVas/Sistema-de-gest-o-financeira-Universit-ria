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

function buildMonthDateFilter(month, year) {
  return {
    gte: new Date(Date.UTC(year, month - 1, 1)),
    lt: new Date(Date.UTC(year, month, 1))
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

async function findMonthlyIncomes(userId, month, year) {
  return prisma.income.findMany({
    where: {
      userId,
      date: buildMonthDateFilter(month, year)
    },
    orderBy: {
      date: "asc"
    }
  });
}

async function findMonthlyExpenses(userId, month, year) {
  return prisma.expense.findMany({
    where: {
      userId,
      date: buildMonthDateFilter(month, year)
    },
    include: {
      category: true
    },
    orderBy: {
      date: "asc"
    }
  });
}

async function findMonthlyGoal(userId, month, year) {
  return prisma.monthlyGoal.findUnique({
    where: {
      userId_month_year: {
        userId,
        month,
        year
      }
    }
  });
}

async function findMonthlyLimits(userId, month, year) {
  return prisma.categoryLimit.findMany({
    where: {
      userId,
      month,
      year
    },
    include: {
      category: true
    }
  });
}

module.exports = {
  findExpensesForHistory,
  findGoalsForHistory,
  findIncomesForHistory,
  findMonthlyExpenses,
  findMonthlyGoal,
  findMonthlyIncomes,
  findMonthlyLimits
};
