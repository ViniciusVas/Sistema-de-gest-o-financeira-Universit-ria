const categoryRepository = require("../repositories/categoryRepository");
const AppError = require("../utils/AppError");
const { optionalString, requiredString } = require("../utils/validators");

async function listCategories(userId) {
  return categoryRepository.findManyAvailable(userId);
}

async function createCategory(userId, payload) {
  const name = requiredString(payload.name, "name");
  const description = optionalString(payload.description);
  const duplicate = await categoryRepository.findAvailableByName(userId, name);

  if (duplicate) {
    throw new AppError("Já existe uma categoria com esse nome.", 409);
  }

  return categoryRepository.create({
    userId,
    name,
    description,
    isDefault: false
  });
}

async function updateCategory(userId, categoryId, payload) {
  const category = await categoryRepository.findUserCategoryById(userId, categoryId);

  if (!category) {
    throw new AppError("Categoria personalizada não encontrada.", 404);
  }

  const data = {};

  if (payload.name !== undefined) {
    const name = requiredString(payload.name, "name");
    const duplicate = await categoryRepository.findAvailableByName(userId, name);

    if (duplicate && duplicate.id !== categoryId) {
      throw new AppError("Já existe uma categoria com esse nome.", 409);
    }

    data.name = name;
  }

  if (payload.description !== undefined) {
    data.description = optionalString(payload.description);
  }

  return categoryRepository.update(categoryId, data);
}

async function deleteCategory(userId, categoryId) {
  const category = await categoryRepository.findUserCategoryById(userId, categoryId);

  if (!category) {
    throw new AppError("Categoria personalizada não encontrada.", 404);
  }

  const usage = await categoryRepository.countUsage(categoryId);

  if (usage.total > 0) {
    throw new AppError("Esta categoria está em uso e não pode ser excluída.", 409);
  }

  await categoryRepository.remove(categoryId);
}

module.exports = {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory
};
