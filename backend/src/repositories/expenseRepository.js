const prisma = require("../utils/prisma");

async function create(data) {
  return prisma.expense.create({
    data,
    include: {
      category: true
    }
  });
}

async function findManyByUser(userId, filters = {}) {
  const where = {
    userId
  };

  if (filters.date) {
    where.date = filters.date;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.expenseType) {
    where.expenseType = filters.expenseType;
  }

  if (filters.paymentMethod) {
    where.paymentMethod = filters.paymentMethod;
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

  return prisma.expense.findMany({
    where,
    include: {
      category: true
    },
    orderBy: {
      date: "desc"
    }
  });
}

async function findByIdAndUser(id, userId) {
  return prisma.expense.findFirst({
    where: {
      id,
      userId
    },
    include: {
      category: true
    }
  });
}

async function updateByIdAndUser(id, userId, data) {
  return prisma.expense.update({
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

async function deleteByIdAndUser(id, userId) {
  return prisma.expense.delete({
    where: {
      id,
      userId
    }
  });
}

async function sumByPeriod(userId, startDate, endDate) {
  return prisma.expense.aggregate({
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

async function sumByType(userId, startDate, endDate, expenseType) {
  return prisma.expense.aggregate({
    where: {
      userId,
      expenseType,
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

async function findByPeriodWithCategory(userId, startDate, endDate) {
  return prisma.expense.findMany({
    where: {
      userId,
      date: {
        gte: startDate,
        lt: endDate
      }
    },
    include: {
      category: true
    }
  });
}

module.exports = {
  create,
  deleteByIdAndUser,
  findByIdAndUser,
  findByPeriodWithCategory,
  findManyByUser,
  sumByPeriod,
  sumByType,
  updateByIdAndUser
};
