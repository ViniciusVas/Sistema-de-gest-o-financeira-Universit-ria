const { Router } = require("express");

const dashboardController = require("../controllers/dashboardController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/monthly-summary", dashboardController.monthlySummary);
router.get("/category-expenses", dashboardController.categoryExpenses);
router.get("/alerts", dashboardController.alerts);

module.exports = router;
