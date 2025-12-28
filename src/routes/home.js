const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("home");
});

// ⭐ ROUTE DIỄN ĐÀN
router.get("/forum", (req, res) => {
  res.render("forum");
});

module.exports = router;
