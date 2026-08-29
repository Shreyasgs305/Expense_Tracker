const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    type: {
      type: String,
      enum: ["EXPENSE", "INCOME", "TRANSFER"],
      required: true,
    },

    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0.01,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    paymentMethod: {
      type: String,
      enum: ["BANK", "CASH", "CARD", "UPI"],
      default: null,
    },

    budgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Budget",
      default: null,
    },

    notes: {
      type: String,
      default: null,
      trim: true,
    },

    status: {
      type: String,
      enum: ["COMPLETED", "PENDING", "CANCELLED"],
      default: "COMPLETED",
    },

    transferId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

transactionSchema.index({
  userId: 1,
  date: -1,
});

transactionSchema.index({
  userId: 1,
  accountId: 1,
  date: -1,
});

transactionSchema.index({
  userId: 1,
  categoryId: 1,
  date: -1,
});

module.exports = mongoose.model("Transaction", transactionSchema);
