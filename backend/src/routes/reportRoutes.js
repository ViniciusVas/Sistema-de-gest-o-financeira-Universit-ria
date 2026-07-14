const { Router } = require("express");

const reportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/monthly", reportController.monthlyReport);
router.get("/monthly-history", reportController.monthlyHistory);
router.get("/export", reportController.exportMonthlyReport);

module.exports = router;
