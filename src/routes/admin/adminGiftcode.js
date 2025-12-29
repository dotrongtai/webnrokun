const express = require("express");
const router = express.Router();

const giftcodeController = require("../../controllers/giftcodeController");
const requireAdmin = require("../../middlewares/requireAdmin");

router.get("/admin/giftcode",requireAdmin, giftcodeController.index);

router.get("/admin/giftcode/creategiftcode",requireAdmin, giftcodeController.create);

router.post("/admin/giftcode/creategiftcode",requireAdmin, giftcodeController.store);

module.exports = router;
