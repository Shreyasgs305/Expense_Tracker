const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUser,
  deleteUser,
} = require("../controllers/authController");
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", getUser);
router.delete("/account", deleteUser);

module.exports = router;
