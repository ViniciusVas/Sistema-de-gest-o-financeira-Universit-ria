const categoryRepository = require("../repositories/categoryRepository");

async function listCategories(userId) {
  return categoryRepository.findManyAvailable(userId);
}

module.exports = {
  listCategories
};
