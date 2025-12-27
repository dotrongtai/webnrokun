const pool = require("../config/db");

// =========================
// GET REGISTER
// =========================
exports.getRegister = (req, res) => {
  res.render("auth/register", { msg: null });
};

// =========================
// GET LOGIN
// =========================
exports.getLogin = (req, res) => {
  res.render("auth/login", { msg: null });
};

// =========================
// POST LOGIN
// =========================
exports.postLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.execute(
      "SELECT username, password, admin FROM account WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.render("auth/login", { msg: "Tài khoản không tồn tại!" });
    }

    const user = rows[0];

    if (user.password !== password) {
      return res.render("auth/login", { msg: "Mật khẩu sai!" });
    }

    // Đăng nhập thành công
  req.session.user = {
  username: user.username,
  admin : user.admin
};
if(user.admin === 1){
  return res.redirect("/dashboard");
}
// Chuyển về trang chủ
res.redirect("/");

  } catch (err) {
    console.error(err);
    return res.render("auth/login", { msg: "Lỗi server!" });
  }
};

// =========================
// POST REGISTER
// =========================
exports.postRegister = async (req, res) => {
  const { username, password, repassword } = req.body;

  if (!username || !password || !repassword) {
    return res.render("auth/register", { msg: "Vui lòng nhập đầy đủ thông tin!" });
  }

  if (password !== repassword) {
    return res.render("auth/register", { msg: "Mật khẩu nhập lại không khớp!" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT username FROM account WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      return res.render("auth/register", { msg: "Tài khoản đã tồn tại!" });
    }

    await pool.execute(
      "INSERT INTO account (username, password) VALUES (?, ?)",
      [username, password]
    );

    return res.render("auth/register", { msg: "Đăng ký thành công!" });

  } catch (err) {
    console.error(err);
    return res.render("auth/register", { msg: "Lỗi server!" });
  }
};
