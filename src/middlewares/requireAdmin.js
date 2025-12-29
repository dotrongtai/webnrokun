module.exports = (req, res, next) => {
 
  if (!req.session.user) {
    return res.redirect("/login");
  }

  
  if (req.session.user.admin !== 1) {
    return res.redirect("/");
  }

  next();
};
