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

module.exports = {
  findAvailableById,
  findManyAvailable
};
