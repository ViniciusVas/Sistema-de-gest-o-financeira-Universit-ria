const prisma = require("../utils/prisma");

async function findManyAvailable(userId) {
  return prisma.category.findMany({
    where: {
      OR: [
        { isDefault: true },
        { userId }
      ]
    },
    orderBy: [
      { isDefault: "desc" },
      { name: "asc" }
    ]
  });
}

async function findAvailableById(userId, categoryId) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      OR: [
        { isDefault: true },
        { userId }
      ]
    }
  });
}

async function findAvailableByName(userId, name) {
  return prisma.category.findFirst({
    where: {
      name: {
        equals: name,
        mode: "insensitive"
      },
      OR: [
        { isDefault: true },
        { userId }
      ]
    }
  });
}

async function findUserCategoryById(userId, categoryId) {
  return prisma.category.findFirst({
    where: {
      id: categoryId,
      userId,
      isDefault: false
    }
  });
}

async function create(data) {
  return prisma.category.create({
    data
  });
}

async function update(categoryId, data) {
  return prisma.category.update({
    where: {
      id: categoryId
    },
    data
  });
}

async function remove(categoryId) {
  return prisma.category.delete({
    where: {
      id: categoryId
    }
  });
}

async function countUsage(categoryId) {
  const [expenses, categoryLimits] = await Promise.all([
    prisma.expense.count({
      where: {
        categoryId
      }
    }),
    prisma.categoryLimit.count({
      where: {
        categoryId
      }
    })
  ]);

  return {
    expenses,
    categoryLimits,
    total: expenses + categoryLimits
  };
}

module.exports = {
  countUsage,
  create,
  findAvailableById,
  findAvailableByName,
  findManyAvailable,
  findUserCategoryById,
  remove,
  update
};
