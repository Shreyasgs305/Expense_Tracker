const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  me,
  deleteAccount,
  changePassword,
  updateProfile,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, me);

router.put("/profile", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);
router.delete("/account", deleteAccount);

module.exports = router;
