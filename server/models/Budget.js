const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    month: {
      type: String,
      required: true,
      match: /^\d{4}-(0[1-9]|1[0-2])$/,
    },

    amount: {
      type: mongoose.Schema.Types.Decimal128,
      required: true,
      min: 0,
    },

    alertPercentage: {
      type: Number,
      default: 80,
      min: 1,
      max: 100,
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

// One budget per category per month for each user
budgetSchema.index(
  {
    userId: 1,
    categoryId: 1,
    month: 1,
  },
  {
    unique: true,
  },
);

module.exports = mongoose.model("Budget", budgetSchema);
