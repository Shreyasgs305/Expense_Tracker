const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
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

    passwordHash: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
    },

    currency: {
      type: String,
      default: "INR",
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

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
