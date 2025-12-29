const express = require("express");
const router = express.Router();
const authController = require("../../controllers/authController");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/");
    }

    res.clearCookie("connect.sid"); 
    return res.redirect("/");
  });
});

module.exports = router;
