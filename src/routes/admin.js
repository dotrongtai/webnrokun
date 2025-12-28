const express = require("express");
const router = express.Router();
const requireAdmin = require("../middlewares/requireAdmin");

router.get("/dashboard", requireAdmin, (req, res) => {
  res.render("admin/dashboard");
});
// post
module.exports = router;
