const pool = require("../config/db");

exports.getRegister = (req, res) => {
  res.render("register", { msg: null });
};

exports.postRegister = async (req, res) => {
  const { username, password, repassword } = req.body;

  if (!username || !password || !repassword) {
    return res.render("register", { msg: "Vui lòng nhập đầy đủ thông tin!" });
  }

  if (password !== repassword) {
    return res.render("register", { msg: "Mật khẩu nhập lại không khớp!" });
  }

  try {
    // check tồn tại
    const [rows] = await pool.execute(
      "SELECT username FROM account WHERE username = ?",
      [username]
    );

    if (rows.length > 0) {
      return res.render("register", { msg: "Tài khoản đã tồn tại!" });
    }

    // insert
    await pool.execute(
      "INSERT INTO account (username, password) VALUES (?, ?)",
      [username, password] // lưu plain text đúng yêu cầu bạn
    );

    return res.render("register", { msg: "Đăng ký thành công!" });

  } catch (err) {
    console.error(err);
    return res.render("register", { msg: "Lỗi server!" });
  }
};