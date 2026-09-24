const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["LENT", "BORROWED"],
      required: true,
    },

    personName: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0.01,
    },

    repaidAmount: {
      type: mongoose.Schema.Types.Decimal128,
      default: 0,
    },

    remainingAmount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    date: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["PENDING", "PARTIALLY_PAID", "PAID"],
      default: "PENDING",
    },

    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Loan", loanSchema);
