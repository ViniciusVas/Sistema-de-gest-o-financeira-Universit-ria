const { Router } = require("express");

const authMiddleware = require("../middlewares/authMiddleware");
const financialProfileController = require("../controllers/financialProfileController");

const router = Router();

router.use(authMiddleware);
router.get("/", financialProfileController.get);
router.post("/", financialProfileController.save);
router.put("/", financialProfileController.save);

module.exports = router;
