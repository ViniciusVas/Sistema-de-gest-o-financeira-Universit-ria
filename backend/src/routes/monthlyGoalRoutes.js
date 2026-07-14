const { Router } = require("express");

const monthlyGoalController = require("../controllers/monthlyGoalController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/", monthlyGoalController.list);
router.post("/", monthlyGoalController.save);
router.put("/:id", monthlyGoalController.update);

module.exports = router;
