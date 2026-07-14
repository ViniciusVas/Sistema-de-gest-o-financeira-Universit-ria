const dashboardService = require("../services/dashboardService");
const asyncHandler = require("../utils/asyncHandler");

const monthlySummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getMonthlySummary(req.user.id, req.query);

  res.json(summary);
});

const categoryExpenses = asyncHandler(async (req, res) => {
  const data = await dashboardService.getCategoryExpenses(req.user.id, req.query);

  res.json(data);
});

const alerts = asyncHandler(async (req, res) => {
  const data = await dashboardService.getLimitAlerts(req.user.id, req.query);

  res.json(data);
});

module.exports = {
  alerts,
  categoryExpenses,
  monthlySummary
};
