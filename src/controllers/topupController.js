const pool = require("../config/db");
const payos = require("../config/payos");

exports.getTopupPage = (req, res) => {
  if (!req.session.user) return res.redirect("/login");
  res.render("user/topup", { error: null });
};

exports.createTopup = async (req, res) => {
  try {
    if (!req.session.user) return res.status(401).json({ success: false });

    const username = req.session.user.username;
    const amount = parseInt(req.body.amount);

    if (!amount || amount < 10000) {
      return res.json({ success: false, message: "Số tiền không hợp lệ!" });
    }

    const orderCode = Date.now(); 
    const description = `NAP_${username}_${orderCode}`;

    const paymentData = {
      orderCode,
      amount,
      description,
      returnUrl: `${process.env.BASE_URL}/topup/success`,
      cancelUrl: `${process.env.BASE_URL}/topup/cancel`
    };

    const paymentLink = await payos.paymentRequests.create(paymentData);

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
      qrCode: paymentLink.qrCode
    });

  } catch (err) {
    console.error("createTopup error:", err);
    return res.json({ success: false, message: "Lỗi server!" });
  }
};


exports.payosWebhook = async (req, res) => {
  try {
    console.log("===== PAYOS WEBHOOK HIT =====");
    console.log(JSON.stringify(req.body, null, 2));


    const webhookData = await payos.webhooks.verify(req.body);

    const data = webhookData.data || webhookData;

    const orderCode = data.orderCode;
    const paidAmount = data.amount;
    const code = data.code; 
    const transactionId = data.paymentLinkId || data.reference || null;

    if (!orderCode) return res.status(400).send("missing orderCode");

    if (code && code !== "00") {
      await pool.execute("UPDATE top_up SET status='FAILED' WHERE orderCode=?", [orderCode]);
      return res.send("ignored");
    }

    const [rows] = await pool.execute(
      "SELECT * FROM top_up WHERE orderCode=?",
      [orderCode]
    );

    if (rows.length === 0) return res.send("order not found");

    const order = rows[0];

    if (order.status === "PAID") return res.send("already processed");

    if (parseInt(order.amount) !== parseInt(paidAmount)) {
      console.log("❌ Amount mismatch:", order.amount, paidAmount);
      await pool.execute(
        "UPDATE top_up SET status='FAILED' WHERE orderCode=?",
        [orderCode]
      );
      return res.status(400).send("amount mismatch");
    }

    const username = order.username;

    await pool.execute(
      "UPDATE top_up SET status='PAID', transId=?, paid_at=NOW() WHERE orderCode=?",
      [transactionId, orderCode]
    );

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
