const pool = require("../../config/db");

exports.getAccounts = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10; // số dòng mỗi trang
  const offset = (page - 1) * limit;

  const search = req.query.search ? req.query.search.trim() : "";

  try {
    // ✅ 1) Query lấy dữ liệu theo search + phân trang
    const queryData = `
      SELECT id, username, password, admin, active, ban, tongnap, coin, vnd, mocnap
      FROM account
      WHERE username LIKE ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?
    `;

    const [accounts] = await pool.execute(queryData, [`%${search}%`, limit, offset]);

    const queryCount = `
      SELECT COUNT(*) AS total
      FROM account
      WHERE username LIKE ?
    `;

    const [[{ total }]] = await pool.execute(queryCount, [`%${search}%`]);

    const totalPages = Math.ceil(total / limit);

    res.render("admin/accounts", {
      accounts,
      page,
      totalPages,
      search
    });

  } catch (err) {
    console.error(err);
    res.send("Lỗi server");
  }
};
exports.toggleAdmin = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute(`
      UPDATE account
      SET admin = IF(admin = 1, 0, 1)
      WHERE id = ?
    `, [id]);

    const [[row]] = await pool.execute(`SELECT admin FROM account WHERE id = ?`, [id]);

    res.json({ success: true, admin: row.admin });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};
exports.toggleActive = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute(`
      UPDATE account
      SET active = IF(active = 1, 0, 1)
      WHERE id = ?
    `, [id]);

    const [[row]] = await pool.execute(`SELECT active FROM account WHERE id = ?`, [id]);

    res.json({ success: true, active: row.active });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};

// ✅ Toggle BAN
exports.toggleBan = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute(`
      UPDATE account
      SET ban = IF(ban = 1, 0, 1)
      WHERE id = ?
    `, [id]);

    const [[row]] = await pool.execute(`SELECT ban FROM account WHERE id = ?`, [id]);

    res.json({ success: true, ban: row.ban });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
};
