const express = require("express");
const router = express.Router();
const adminTopupController = require("../../controllers/admin/adminTopupController");

const requireAdmin = require("../../middlewares/requireAdmin");
router.get("/topup", requireAdmin, adminTopupController.viewTopup);

module.exports = router;
