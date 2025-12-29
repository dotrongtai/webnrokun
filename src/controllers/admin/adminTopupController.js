const pool = require("../../config/db");

// ✅ View danh sách nạp tiền
exports.viewTopup = async (req, res) => {
  try {
    // ✅ chỉ admin mới được vào
    if (!req.session.user || req.session.user.admin != 1) {
      return res.redirect("/login");
    }

    // ✅ query params
    const search = (req.query.search || "").trim();
    const status = (req.query.status || "ALL").toUpperCase();
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    // ✅ build WHERE
    let where = "WHERE 1=1 ";
    let params = [];

    // search theo username/orderCode/transId
    if (search) {
      where += " AND (username LIKE ? OR orderCode LIKE ? OR transId LIKE ?) ";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    // filter theo status
    if (status !== "ALL") {
      where += " AND status = ? ";
      params.push(status);
    }

    // ✅ lấy tổng số bản ghi
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM top_up ${where}`,
      params
    );

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

    // ✅ lấy danh sách topup
    const [topups] = await pool.execute(
      `SELECT * FROM top_up 
       ${where}
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return res.render("admin/viewtopup", {
      topups,
      search,
      status,
      page,
      totalPages,
      total
    });

  } catch (err) {
    console.error("viewTopup error:", err);
    return res.send("Lỗi server");
  }
};
