const express = require("express");
const router = express.Router();
const topupController = require("../controllers/topupController");

router.get("/topup", topupController.getTopupPage);
router.post("/topup/create", topupController.createTopup);
router.get("/topup/success", (req, res) => {
  res.send("✅ Thanh toán thành công! Vui lòng chờ hệ thống cộng tiền...");
});

router.get("/topup/cancel", (req, res) => {
  res.send("❌ Bạn đã hủy thanh toán.");
});
router.post("/payos/webhook", topupController.payosWebhook);

module.exports = router;
