const express = require("express");
const router = express.Router();
const topupController = require("../controllers/topupController");

router.get("/topup", topupController.getTopupPage);
router.post("/topup/create", topupController.createTopup);

router.get("/topup/success", (req, res) => {
  res.send(`
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Thanh toán thành công</title>
      <script>
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      </script>
    </head>
    <body style="font-family:Arial;text-align:center;padding:50px;">
      <h2 style="color:green;">✅ Thanh toán thành công!</h2>
      <p>Hệ thống sẽ cộng tiền trong vài giây...</p>
      <p><b>Đang quay về trang chủ...</b></p>
      <a href="/" style="display:inline-block;margin-top:15px;padding:10px 18px;background:#1e88e5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
        ⬅ Về trang chủ ngay
      </a>
    </body>
    </html>
  `);
});

router.get("/topup/cancel", (req, res) => {
  res.send(`
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Đã huỷ thanh toán</title>
      <script>
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      </script>
    </head>
    <body style="font-family:Arial;text-align:center;padding:50px;">
      <h2 style="color:red;">❌ Bạn đã huỷ thanh toán!</h2>
      <p><b>Đang quay về trang chủ...</b></p>
      <a href="/" style="display:inline-block;margin-top:15px;padding:10px 18px;background:#1e88e5;color:white;border-radius:8px;text-decoration:none;font-weight:bold;">
        ⬅ Về trang chủ ngay
      </a>
    </body>
    </html>
  `);
});


router.post("/payos/webhook", topupController.payosWebhook);

module.exports = router;
