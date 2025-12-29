const express = require("express");
const router = express.Router();
const adminAccountsController  = require("../../controllers/admin/adminAccountsController");
const requireAdmin = require("../../middlewares/requireAdmin");

router.get("/accounts", requireAdmin, adminAccountsController.getAccounts);

router.post("/accounts/toggle-admin/:id", requireAdmin, adminAccountsController.toggleAdmin);

router.post("/accounts/toggle-active/:id", requireAdmin, adminAccountsController.toggleActive);

router.post("/accounts/toggle-ban/:id", requireAdmin, adminAccountsController.toggleBan);

module.exports = router;
