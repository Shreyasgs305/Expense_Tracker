const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  me,
  deleteAccount,
  updateProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, me);

router.put("/profile", authMiddleware, updateProfile);
router.delete("/account", deleteAccount);

module.exports = router;
