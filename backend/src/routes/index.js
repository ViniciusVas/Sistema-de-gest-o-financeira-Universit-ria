const { Router } = require("express");

const authRoutes = require("./authRoutes");
const categoryRoutes = require("./categoryRoutes");
const incomeRoutes = require("./incomeRoutes");
const expenseRoutes = require("./expenseRoutes");
const monthlyGoalRoutes = require("./monthlyGoalRoutes");
const categoryLimitRoutes = require("./categoryLimitRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const reportRoutes = require("./reportRoutes");
const financialProfileRoutes = require("./financialProfileRoutes");

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/incomes", incomeRoutes);
router.use("/expenses", expenseRoutes);
router.use("/monthly-goals", monthlyGoalRoutes);
router.use("/category-limits", categoryLimitRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/reports", reportRoutes);
router.use("/financial-profile", financialProfileRoutes);

module.exports = router;
