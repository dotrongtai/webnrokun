const pool = require("../config/db");
const payos = require("../config/payos");

exports.getTopupPage = (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("user/topup", { error: null });
};

exports.createTopup = async (req, res) => {
  if (!req.session.user) return res.status(401).json({ success: false });

  const username = req.session.user.username;
  const amount = parseInt(req.body.amount);

  if (!amount || amount < 1000) {
    return res.json({ success: false, message: "Số tiền không hợp lệ!" });
  }

  const orderCode = Date.now(); 
  const description = `NAP_${username}_${orderCode}`;

  try {
    await pool.execute(
      "INSERT INTO top_up(username, amount, orderCode, description, status) VALUES (?, ?, ?, ?, 'PENDING')",
      [username, amount, orderCode, description]
    );

    const paymentData = {
      orderCode,
      amount,
      description,
      returnUrl: `${process.env.BASE_URL}/topup/success`,
      cancelUrl: `${process.env.BASE_URL}/topup/cancel`
    };

    const paymentLink = await payos.paymentRequests.create(paymentData);

return res.json({
  success: true,
  checkoutUrl: paymentLink.checkoutUrl,
  qrCode: paymentLink.qrCode,
});


  } catch (err) {
    console.error(err);
    return res.json({ success: false, message: "Lỗi server!" });
  }
};
exports.payosWebhook = async (req, res) => {
  try {
    // ✅ Verify + parse webhook bằng SDK v2
    // Nếu signature sai → sẽ throw error luôn
    const webhookData = await payos.webhooks.verify(req.body);

    // Tuỳ payload PayOS, nhưng theo docs thì thông tin nằm trong webhookData.data
    const data = webhookData.data || webhookData;

    const orderCode = data.orderCode;
    const amount    = data.amount;
    // transactionId có thể là paymentLinkId hoặc reference tuỳ cấu hình
    const transactionId = data.paymentLinkId || data.reference || null;

    // Code = '00' là thành công (chuẩn bên PayOS)
    // Nếu bạn dùng status thì có thể log thử console.log(data) để xem field nào là PAID
    if (data.code && data.code !== "00") {
      return res.send("ignored");
    }

    if (!orderCode || !amount) {
      return res.status(400).send("invalid payload");
    }

    // ✅ lấy đơn pending
    const [rows] = await pool.execute(
      "SELECT * FROM top_up WHERE orderCode=? AND status='PENDING'",
      [orderCode]
    );

    if (rows.length === 0) return res.send("already processed");

    const username = rows[0].username;

    // ✅ update top_up
    await pool.execute(
      "UPDATE top_up SET status='PAID', transId=?, paid_at=NOW() WHERE orderCode=?",
      [transactionId, orderCode]
    );

    // ✅ cộng tiền vào account
    await pool.execute(
      "UPDATE account SET vnd = vnd + ?, tongnap = tongnap + ? WHERE username = ?",
      [amount, amount, username]
    );

    return res.send("OK");
  } catch (err) {
    console.error("PayOS webhook error:", err);
    return res.status(500).send("server error");
  }
};
