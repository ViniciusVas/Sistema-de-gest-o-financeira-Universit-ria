const prisma = require("../utils/prisma");

async function findByUserId(userId) {
  return prisma.financialProfile.findUnique({
    where: {
      userId
    }
  });
}

async function upsertByUserId(userId, data) {
  return prisma.financialProfile.upsert({
    where: {
      userId
    },
    create: {
      userId,
      ...data
    },
    update: data
  });
}

module.exports = {
  findByUserId,
  upsertByUserId
};
