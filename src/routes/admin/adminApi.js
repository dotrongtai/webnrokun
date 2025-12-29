const express = require("express");
const router = express.Router();

const adminApiController = require("../../controllers/adminApiController");

router.get("/items", adminApiController.searchItems);
router.get("/options", adminApiController.searchOptions);

module.exports = router;
