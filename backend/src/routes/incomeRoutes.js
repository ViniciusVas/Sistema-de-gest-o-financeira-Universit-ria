const { Router } = require("express");

const incomeController = require("../controllers/incomeController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/", incomeController.list);
router.post("/", incomeController.create);
router.put("/:id", incomeController.update);
router.delete("/:id", incomeController.remove);

module.exports = router;
