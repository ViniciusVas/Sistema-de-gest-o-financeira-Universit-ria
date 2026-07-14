const prisma = require("../utils/prisma");

async function findManyByUser(userId, filters = {}) {
  const where = { userId };

  if (filters.month) {
    where.month = filters.month;
  }

  if (filters.year) {
    where.year = filters.year;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  return prisma.categoryLimit.findMany({
    where,
    include: {
      category: true
    },
    orderBy: [
      { year: "desc" },
      { month: "desc" }
    ]
  });
}

async function upsertByCategoryMonth(userId, data) {
  return prisma.categoryLimit.upsert({
    where: {
      userId_categoryId_month_year: {
        userId,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year
      }
    },
    create: {
      userId,
      ...data
    },
    update: {
      limitAmount: data.limitAmount
    },
    include: {
      category: true
    }
  });
}

async function updateByIdAndUser(id, userId, data) {
  return prisma.categoryLimit.update({
    where: {
      id,
      userId
    },
    data,
    include: {
      category: true
    }
  });
}

module.exports = {
  findManyByUser,
  updateByIdAndUser,
  upsertByCategoryMonth
};
