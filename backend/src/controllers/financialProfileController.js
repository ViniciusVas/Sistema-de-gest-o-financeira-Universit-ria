const asyncHandler = require("../utils/asyncHandler");
const financialProfileService = require("../services/financialProfileService");

const get = asyncHandler(async (req, res) => {
  const profile = await financialProfileService.getProfile(req.user.id);

  res.json({
    profile
  });
});

const save = asyncHandler(async (req, res) => {
  const profile = await financialProfileService.saveProfile(req.user.id, req.body);

  res.json({
    profile
  });
});

module.exports = {
  get,
  save
};
