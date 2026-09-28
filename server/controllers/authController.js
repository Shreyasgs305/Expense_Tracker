const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const Account = require("../models/Account");
const Category = require("../models/Category");
const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const EmailVerification = require("../models/EmailVerification");
const PasswordReset = require("../models/PasswordReset");

const {
  sendVerificationOtp,
  sendPasswordResetOtp,
} = require("../services/emailService");

// =====================================================
// HELPER - GENERATE JWT
// =====================================================

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

// =====================================================
// REGISTER USER
// =====================================================

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    return res.status(400).json({
      message:
        "Please verify your email with OTP before completing registration",
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// SEND EMAIL VERIFICATION OTP
// =====================================================

const sendEmailVerificationOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email",
      });
    }

    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must contain at least 2 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const existingVerification = await EmailVerification.findOne({
      email: normalizedEmail,
    });

    if (existingVerification) {
      const secondsSinceLastSent =
        (Date.now() - existingVerification.lastSentAt.getTime()) / 1000;

      if (secondsSinceLastSent < 60) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(
            60 - secondsSinceLastSent,
          )} seconds before requesting another OTP`,
        });
      }
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const passwordHash = await bcrypt.hash(password, 10);

    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sendVerificationOtp(normalizedEmail, otp);

    await EmailVerification.findOneAndUpdate(
      {
        email: normalizedEmail,
      },
      {
        email: normalizedEmail,
        name: name.trim(),
        passwordHash,
        otpHash,
        otpExpiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return res.status(200).json({
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("Send verification OTP error:", error);

    return res.status(500).json({
      message: "Failed to send verification OTP",
    });
  }
};

// =====================================================
// VERIFY EMAIL OTP
// =====================================================

const verifyEmailVerificationOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        message: "OTP must contain exactly 6 digits",
      });
    }

    const verification = await EmailVerification.findOne({
      email: normalizedEmail,
    });

    if (!verification) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (verification.otpExpiresAt.getTime() < Date.now()) {
      await EmailVerification.deleteOne({
        _id: verification._id,
      });

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (verification.attempts >= 5) {
      await EmailVerification.deleteOne({
        _id: verification._id,
      });

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const enteredOtpHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    if (enteredOtpHash !== verification.otpHash) {
      verification.attempts += 1;

      await verification.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      await EmailVerification.deleteOne({
        _id: verification._id,
      });

      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    const user = await User.create({
      name: verification.name,
      email: normalizedEmail,
      passwordHash: verification.passwordHash,
      isEmailVerified: true,
      authProvider: "LOCAL",
      isActive: true,
    });

    await EmailVerification.deleteOne({
      _id: verification._id,
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      message: "Email verified and registration successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        currency: user.currency,
        timezone: user.timezone,
      },

      token,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// LOGIN
// =====================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    if (user.authProvider === "GOOGLE" || !user.passwordHash) {
      return res.status(400).json({
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.authProvider === "LOCAL" && user.isEmailVerified !== true) {
      return res.status(403).json({
        message: "Please verify your email before logging in",
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
        currency: user.currency,
        timezone: user.timezone,
      },

      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// FORGOT PASSWORD - SEND OTP
// =====================================================

const requestPasswordResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        message: "Please provide a valid email",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        message: "No account found with this email",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is inactive",
      });
    }

    if (user.authProvider === "GOOGLE" || !user.passwordHash) {
      return res.status(400).json({
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    const existingReset = await PasswordReset.findOne({
      email: normalizedEmail,
    });

    if (existingReset) {
      const secondsSinceLastSent =
        (Date.now() - existingReset.lastSentAt.getTime()) / 1000;

      if (secondsSinceLastSent < 60) {
        return res.status(429).json({
          message: `Please wait ${Math.ceil(
            60 - secondsSinceLastSent,
          )} seconds before requesting another OTP`,
        });
      }
    }

    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await sendPasswordResetOtp(normalizedEmail, otp);

    await PasswordReset.findOneAndUpdate(
      {
        email: normalizedEmail,
      },
      {
        email: normalizedEmail,
        otpHash,
        otpExpiresAt,
        attempts: 0,
        lastSentAt: new Date(),
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );

    return res.status(200).json({
      message: "Password reset OTP sent successfully",
    });
  } catch (error) {
    console.error("Send password reset OTP error:", error);

    return res.status(500).json({
      message: "Failed to send password reset OTP",
    });
  }
};

// =====================================================
// RESET PASSWORD
// =====================================================

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        message: "Email, OTP and new password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        message: "OTP must contain exactly 6 digits",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const passwordReset = await PasswordReset.findOne({
      email: normalizedEmail,
    });

    if (!passwordReset) {
      return res.status(400).json({
        message: "OTP not found. Please request a new OTP.",
      });
    }

    if (passwordReset.otpExpiresAt.getTime() < Date.now()) {
      await PasswordReset.deleteOne({
        _id: passwordReset._id,
      });

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    if (passwordReset.attempts >= 5) {
      await PasswordReset.deleteOne({
        _id: passwordReset._id,
      });

      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    const enteredOtpHash = crypto
      .createHash("sha256")
      .update(String(otp))
      .digest("hex");

    if (enteredOtpHash !== passwordReset.otpHash) {
      passwordReset.attempts += 1;

      await passwordReset.save();

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      await PasswordReset.deleteOne({
        _id: passwordReset._id,
      });

      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.authProvider === "GOOGLE" || !user.passwordHash) {
      await PasswordReset.deleteOne({
        _id: passwordReset._id,
      });

      return res.status(400).json({
        message: "This account uses Google login. Please continue with Google.",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);

    await user.save();

    await PasswordReset.deleteOne({
      _id: passwordReset._id,
    });

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// UPDATE PROFILE
// =====================================================

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name, phone, profileImage, currency, timezone } = req.body;

    const updates = {};

    if (name !== undefined) {
      if (name.trim().length < 2) {
        return res.status(400).json({
          message: "Name must contain at least 2 characters",
        });
      }

      updates.name = name.trim();
    }

    if (phone !== undefined) {
      updates.phone = phone;
    }

    if (profileImage !== undefined) {
      updates.profileImage = profileImage;
    }

    if (currency !== undefined) {
      updates.currency = currency;
    }

    if (timezone !== undefined) {
      updates.timezone = timezone;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: updates,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("-passwordHash");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// CHANGE PASSWORD
// =====================================================

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.authProvider === "GOOGLE" || !user.passwordHash) {
      return res.status(400).json({
        message: "Password change is not available for Google accounts",
      });
    }

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);

    if (isSamePassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 10);

    await user.save();

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// DELETE ACCOUNT
// =====================================================

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await Transaction.deleteMany({
      userId,
    });

    await Budget.deleteMany({
      userId,
    });

    await Category.deleteMany({
      userId,
    });

    await Account.deleteMany({
      userId,
    });

    await User.findByIdAndDelete(userId);

    return res.status(200).json({
      message: "Account and all related data deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  registerUser,
  loginUser,
  me,
  updateProfile,
  changePassword,
  deleteAccount,

  sendEmailVerificationOtp,
  verifyEmailVerificationOtp,

  requestPasswordResetOtp,
  resetPassword,
};
