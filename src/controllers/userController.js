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

    const user = rows[0];

    res.render("profile", {
      user
    });

  } catch (err) {
    console.error(err);
    res.send("Lỗi server");
  }
};
