const express = require("express");
const router = express.Router();
const userController = require("../../controllers/userController");

router.get("/profile", userController.getProfile);

router.get("/change-password", userController.getChangePassword);
router.post("/change-password", userController.postChangePassword);

module.exports = router;
