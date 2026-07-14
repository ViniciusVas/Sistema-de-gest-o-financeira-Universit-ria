const reportService = require("../services/reportService");
const asyncHandler = require("../utils/asyncHandler");

const monthlyHistory = asyncHandler(async (req, res) => {
  const data = await reportService.getMonthlyHistory(req.user.id, req.query);

  res.json(data);
});

module.exports = {
  monthlyHistory
};
