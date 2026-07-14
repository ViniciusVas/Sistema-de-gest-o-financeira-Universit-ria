const { Router } = require("express");

const reportController = require("../controllers/reportController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/monthly-history", reportController.monthlyHistory);

module.exports = router;
