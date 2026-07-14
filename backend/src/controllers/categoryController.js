const categoryService = require("../services/categoryService");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const categories = await categoryService.listCategories(req.user.id);

  res.json({
    categories
  });
});

module.exports = {
  list
};
