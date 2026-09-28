const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
  me,
  deleteAccount,
  changePassword,
  updateProfile,

  // Email verification
  sendEmailVerificationOtp,
  verifyEmailVerificationOtp,

  // Forgot password
  requestPasswordResetOtp,
  resetPassword,
} = require("../controllers/authController");

const authMiddleware = require("../middlewares/authMiddleware");

// =====================================================
// PUBLIC AUTH ROUTES
// =====================================================

router.post("/register", registerUser);

router.post("/login", loginUser);

// Email verification during registration
router.post("/send-otp", sendEmailVerificationOtp);

router.post("/verify-otp", verifyEmailVerificationOtp);

// Forgot password
router.post("/forgot-password", requestPasswordResetOtp);

router.post("/reset-password", resetPassword);

// =====================================================
// PROTECTED AUTH ROUTES
// =====================================================

router.get("/me", authMiddleware, me);

router.put("/profile", authMiddleware, updateProfile);

router.put("/change-password", authMiddleware, changePassword);

router.delete("/account", authMiddleware, deleteAccount);

module.exports = router;
