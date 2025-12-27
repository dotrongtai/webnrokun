module.exports = (req, res, next) => {
  // chưa login
  if (!req.session.user) {
    return res.redirect("/login");
  }

  // không phải admin
  if (req.session.user.admin !== 1) {
    return res.redirect("/");
  }

  // là admin → cho đi tiếp
  next();
};
