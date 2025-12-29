const pool = require("../config/db");
const payos = require("../config/payos");

exports.getTopupPage = (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("user/topup", { error: null });
};

// ✅ Tạo nạp tiền
exports.createTopup = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ success: false });

    const username = req.session.user.username;
    const amount = parseInt(req.body.amount);

    if (!amount || amount < 1000) {
      return res.json({ success: false, message: "Số tiền không hợp lệ!" });
    }

    // ✅ orderCode phải unique
    const orderCode = Date.now(); 
    const description = `NAP_${username}_${orderCode}`;

    // ✅ tạo link thanh toán PayOS
    const paymentData = {
      orderCode,
      amount,
      description,
      returnUrl: `${process.env.BASE_URL}/topup/success`,
      cancelUrl: `${process.env.BASE_URL}/topup/cancel`
    };
    const QRCode = require("qrcode");

    const paymentLink = await payos.paymentRequests.create(paymentData);
    const qrText = paymentLink.qrCode;
const qrCodeImage = await QRCode.toDataURL(qrText);

    // ✅ QR Code PayOS thường là base64, cần thêm prefix để hiển thị ảnh
    let qrCode = paymentLink.qrCode;
    if (qrCode && !qrCode.startsWith("data:image")) {
      qrCode = "data:image/png;base64," + qrCode;
    }

    // ✅ lưu DB
    await pool.execute(
      `INSERT INTO top_up(username, amount, orderCode, description, status, transId) 
       VALUES (?, ?, ?, ?, 'PENDING', NULL)`,
      [username, amount, orderCode, description]
    );

    return res.json({
      success: true,
      orderCode,
      amount,
      checkoutUrl: paymentLink.checkoutUrl,
      qrCode: qrCodeImage
    });

  } catch (err) {
    console.error("createTopup error:", err);
    return res.json({ success: false, message: "Lỗi server!" });
  }
};

// ✅ PayOS Webhook
exports.payosWebhook = async (req, res) => {
  try {
    console.log("===== PAYOS WEBHOOK HIT =====");
    console.log(JSON.stringify(req.body, null, 2));

    // ✅ verify webhook (SDK v2)
    const webhookData = await payos.webhooks.verify(req.body);

    const data = webhookData.data || webhookData;

    const orderCode = data.orderCode;
    const paidAmount = data.amount;
    const code = data.code; // "00" = success
    const transactionId = data.paymentLinkId || data.reference || null;

    if (!orderCode) return res.status(400).send("missing orderCode");

    // ✅ chỉ xử lý thành công
    if (code && code !== "00") {
      await pool.execute("UPDATE top_up SET status='FAILED' WHERE orderCode=?", [orderCode]);
      return res.send("ignored");
    }

    // ✅ lấy đơn top_up đang pending
    const [rows] = await pool.execute(
      "SELECT * FROM top_up WHERE orderCode=?",
      [orderCode]
    );

    if (rows.length === 0) return res.send("order not found");

    const order = rows[0];

    // ✅ Nếu đã PAID thì bỏ qua (tránh cộng tiền 2 lần)
    if (order.status === "PAID") return res.send("already processed");

    // ✅ chống hack: số tiền trong webhook phải khớp số tiền trong DB
    if (parseInt(order.amount) !== parseInt(paidAmount)) {
      console.log("❌ Amount mismatch:", order.amount, paidAmount);
      await pool.execute(
        "UPDATE top_up SET status='FAILED' WHERE orderCode=?",
        [orderCode]
      );
      return res.status(400).send("amount mismatch");
    }

    const username = order.username;

    // ✅ update top_up -> PAID
    await pool.execute(
      "UPDATE top_up SET status='PAID', transId=?, paid_at=NOW() WHERE orderCode=?",
      [transactionId, orderCode]
    );

    // ✅ cộng tiền
    await pool.execute(
      "UPDATE account SET vnd = vnd + ?, tongnap = tongnap + ? WHERE username = ?",
      [paidAmount, paidAmount, username]
    );

    return res.send("OK");

  } catch (err) {
    console.error("PayOS webhook error:", err);
    return res.status(500).send("server error");
  }
};
