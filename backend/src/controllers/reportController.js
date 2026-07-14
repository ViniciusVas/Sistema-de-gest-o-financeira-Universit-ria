const reportService = require("../services/reportService");
const asyncHandler = require("../utils/asyncHandler");

const monthlyHistory = asyncHandler(async (req, res) => {
  const data = await reportService.getMonthlyHistory(req.user.id, req.query);

  res.json(data);
});

const monthlyReport = asyncHandler(async (req, res) => {
  const data = await reportService.getMonthlyReport(req.user.id, req.query);

  res.json(data);
});

const exportMonthlyReport = asyncHandler(async (req, res) => {
  const report = await reportService.getMonthlyReport(req.user.id, req.query);
  const csv = reportService.buildMonthlyReportCsv(report);
  const fileName = `relatorio-financeiro-${report.year}-${String(report.month).padStart(2, "0")}.csv`;

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
  res.send(`\uFEFF${csv}`);
});

module.exports = {
  exportMonthlyReport,
  monthlyReport,
  monthlyHistory
};
