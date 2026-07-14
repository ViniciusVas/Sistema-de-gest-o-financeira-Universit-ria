const prisma = require("../utils/prisma");

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

async function create(data) {
  const user = await prisma.user.create({
    data
  });

  return sanitizeUser(user);
}

async function findByEmail(email) {
  return prisma.user.findUnique({
    where: { email }
  });
}

async function findById(id) {
  const user = await prisma.user.findUnique({
    where: { id }
  });

  return sanitizeUser(user);
}

module.exports = {
  create,
  findByEmail,
  findById,
  sanitizeUser
};
