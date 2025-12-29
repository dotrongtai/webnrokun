const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("user/home");
});

router.get("/forum", (req, res) => {
  res.render("forum");
});

module.exports = router;
