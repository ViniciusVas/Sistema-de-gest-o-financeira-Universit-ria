const categoryLimitService = require("../services/categoryLimitService");
const asyncHandler = require("../utils/asyncHandler");

const list = asyncHandler(async (req, res) => {
  const limits = await categoryLimitService.listLimits(req.user.id, req.query);

  res.json({
    limits
  });
});

const save = asyncHandler(async (req, res) => {
  const limit = await categoryLimitService.saveLimit(req.user.id, req.body);

  res.status(201).json({
    limit
  });
});

const update = asyncHandler(async (req, res) => {
  const limit = await categoryLimitService.updateLimit(req.user.id, req.params.id, req.body);

  res.json({
    limit
  });
});

module.exports = {
  list,
  save,
  update
};
