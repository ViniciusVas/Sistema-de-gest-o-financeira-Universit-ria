const { Router } = require("express");

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = Router();

router.use(authMiddleware);
router.get("/", categoryController.list);

module.exports = router;
