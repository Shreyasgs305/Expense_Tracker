const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // =========================
    // BASIC INFORMATION
    // =========================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    // =========================
    // LOCAL AUTHENTICATION
    // =========================

    passwordHash: {
      type: String,
      default: null,
    },

    // =========================
    // GOOGLE AUTHENTICATION
    // =========================

    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },

    authProvider: {
      type: String,
      enum: ["LOCAL", "GOOGLE"],
      default: "LOCAL",
    },

    // =========================
    // EMAIL VERIFICATION
    // =========================

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // =========================
    // PROFILE
    // =========================

    profileImage: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
      trim: true,
    },

    // =========================
    // SETTINGS
    // =========================

    currency: {
      type: String,
      default: "INR",
      trim: true,
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
      trim: true,
    },

    // =========================
    // ACCOUNT STATUS
    // =========================

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
