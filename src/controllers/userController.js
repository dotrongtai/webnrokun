const pool = require("../config/db");

exports.getProfile = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const username = req.session.user.username;

  try {
    const [rows] = await pool.execute(
      "SELECT username, active, vnd FROM account WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.redirect("/");
    }

    res.render("profile", {
      user: rows[0]
    });

  } catch (err) {
    console.error(err);
    res.send("Lỗi server");
  }
};


exports.getChangePassword = (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  res.render("change-password", {
    error: null,
    success: null
  });
};

exports.postChangePassword = async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const { oldPassword, newPassword, confirmPassword } = req.body;
  const username = req.session.user.username;

  if (newPassword !== confirmPassword) {
    return res.render("change-password", {
      error: "Mật khẩu mới không khớp",
      success: null
    });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT password FROM account WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.redirect("/login");
    }

    if (rows[0].password !== oldPassword) {
      return res.render("change-password", {
        error: "Mật khẩu hiện tại không đúng",
        success: null
      });
    }

    await pool.execute(
      "UPDATE account SET password = ? WHERE username = ?",
      [newPassword, username]
    );

    res.render("change-password", {
      error: null,
      success: "Đổi mật khẩu thành công 🎉"
    });

  } catch (err) {
    console.error(err);
    res.send("Lỗi server");
  }
};
