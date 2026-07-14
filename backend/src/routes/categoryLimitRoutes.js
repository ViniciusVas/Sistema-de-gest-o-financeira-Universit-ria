const { Router } = require("express");

const categoryLimitController = require("../controllers/categoryLimitController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/", categoryLimitController.list);
router.post("/", categoryLimitController.save);
router.put("/:id", categoryLimitController.update);

module.exports = router;
