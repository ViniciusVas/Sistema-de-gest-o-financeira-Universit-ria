const prisma = require("../utils/prisma");

async function create(data) {
  return prisma.income.create({
    data
  });
}

async function findManyByUser(userId, filters = {}) {
  const where = {
    userId
  };

  if (filters.date) {
    where.date = filters.date;
  }

  if (filters.minAmount !== undefined || filters.maxAmount !== undefined) {
    where.amount = {};

    if (filters.minAmount !== undefined) {
      where.amount.gte = filters.minAmount;
    }

    if (filters.maxAmount !== undefined) {
      where.amount.lte = filters.maxAmount;
    }
  }

  return prisma.income.findMany({
    where,
    orderBy: {
      date: "desc"
    }
  });
}

async function findByIdAndUser(id, userId) {
  return prisma.income.findFirst({
    where: {
      id,
      userId
    }
  });
}

async function updateByIdAndUser(id, userId, data) {
  return prisma.income.update({
    where: {
      id,
      userId
    },
    data
  });
}

async function deleteByIdAndUser(id, userId) {
  return prisma.income.delete({
    where: {
      id,
      userId
    }
  });
}

async function sumByPeriod(userId, startDate, endDate) {
  return prisma.income.aggregate({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    _sum: {
      amount: true
    }
  });
}

module.exports = {
  create,
  deleteByIdAndUser,
  findByIdAndUser,
  findManyByUser,
  sumByPeriod,
  updateByIdAndUser
};
