const { Router } = require("express");

const expenseController = require("../controllers/expenseController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/", expenseController.list);
router.post("/", expenseController.create);
router.put("/:id", expenseController.update);
router.delete("/:id", expenseController.remove);

module.exports = router;
