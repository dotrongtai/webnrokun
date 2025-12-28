const express = require("express");
const router = express.Router();

const giftcodeController = require("../controllers/giftcodeController");

// LIST
router.get("/admin/giftcode", giftcodeController.index);

// CREATE PAGE
router.get("/admin/giftcode/create", giftcodeController.create);

// CREATE ACTION
router.post("/admin/giftcode/create", giftcodeController.store);

module.exports = router;
