const express = require("express");
const router = express.Router();

const giftcodeController = require("../controllers/giftcodeController");
const requireAdmin = require("../middlewares/requireAdmin");

// LIST
router.get("/admin/giftcode",requireAdmin, giftcodeController.index);

// CREATE PAGE
router.get("/admin/giftcode/create",requireAdmin, giftcodeController.create);

// CREATE ACTION
router.post("/admin/giftcode/create",requireAdmin, giftcodeController.store);

module.exports = router;
