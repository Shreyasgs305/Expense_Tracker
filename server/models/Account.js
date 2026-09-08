const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["BANK", "CASH", "CREDIT_CARD", "WALLET"],
      required: true,
    },

    balance: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      default: 0,
    },

    creditLimit: {
      type: mongoose.Schema.Types.Decimal128,
      default: null,
    },

    currency: {
      type: String,
      default: "INR",
    },

    institutionName: {
      type: String,
      default: null,
      trim: true,
    },

    icon: {
      type: String,
      default: null,
    },

    color: {
      type: String,
      default: null,
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

module.exports = mongoose.model("Account", accountSchema);
