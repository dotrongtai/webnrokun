const pool = require("../../config/db");


exports.viewTopup = async (req, res) => {
  try {
    if (!req.session.user || req.session.user.admin != 1) {
      return res.redirect("/login");
    }


    const search = (req.query.search || "").trim();
    const status = (req.query.status || "ALL").toUpperCase();
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;

    let where = "WHERE 1=1 ";
    let params = [];

    if (search) {
      where += " AND (username LIKE ? OR orderCode LIKE ? OR transId LIKE ?) ";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== "ALL") {
      where += " AND status = ? ";
      params.push(status);
    }


    const [countRows] = await pool.execute(
      `SELECT COUNT(*) as total FROM top_up ${where}`,
      params
    );

    const total = countRows[0].total;
    const totalPages = Math.ceil(total / limit);

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
