const express = require("express");

const adminController = require("../controller/admin");

const router = express.Router();

router.post("/add-user", adminController.postUser);
router.post("/login", adminController.postLogin);

module.exports = router;
