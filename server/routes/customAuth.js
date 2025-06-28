const { authenticate } = require("passport");
const { login, register } = require("../controller/userController");

const express = require("express");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);

module.exports = router;
