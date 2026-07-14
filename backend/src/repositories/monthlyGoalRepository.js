const prisma = require("../utils/prisma");

async function findManyByUser(userId, filters = {}) {
  const where = { userId };

  if (filters.month) {
    where.month = filters.month;
  }

  if (filters.year) {
    where.year = filters.year;
  }

  return prisma.monthlyGoal.findMany({
    where,
    orderBy: [
      { year: "desc" },
      { month: "desc" }
    ]
  });
}

async function findByMonth(userId, month, year) {
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

async function upsertByMonth(userId, data) {
  return prisma.monthlyGoal.upsert({
    where: {
      userId_month_year: {
        userId,
        month: data.month,
        year: data.year
      }
    },
    create: {
      userId,
      ...data
    },
    update: {
      targetAmount: data.targetAmount
    }
  });
}

async function updateByIdAndUser(id, userId, data) {
  return prisma.monthlyGoal.update({
    where: {
      id,
      userId
    },
    data
  });
}

module.exports = {
  findByMonth,
  findManyByUser,
  updateByIdAndUser,
  upsertByMonth
};
