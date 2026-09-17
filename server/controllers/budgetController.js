const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");

// ==========================================
// GET /api/budgets
// ==========================================

const getBudgets = async (req, res) => {
  try {
    const userId = req.user.id;

    const filter = {
      userId,
    };

    // Optional month filter
    if (req.query.month) {
      filter.month = req.query.month;
    }

    const budgets = await Budget.find(filter)
      .populate("categoryId", "name type icon color")
      .sort({ month: -1, createdAt: -1 })
      .lean();

    // Calculate spending for every budget
    const budgetsWithStatus = await Promise.all(
      budgets.map(async (budget) => {
        const [year, month] = budget.month.split("-").map(Number);

        const startDate = new Date(year, month - 1, 1);

        const endDate = new Date(year, month, 1);

        const result = await Transaction.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(userId),
              categoryId: budget.categoryId?._id,
              type: "EXPENSE",
              status: {
                $ne: "CANCELLED",
              },
              date: {
                $gte: startDate,
                $lt: endDate,
              },
            },
          },
          {
            $group: {
              _id: null,
              spent: {
                $sum: "$amount",
              },
            },
          },
        ]);

        const budgetAmount = Number(budget.amount?.toString() || 0);

        const spent =
          result.length > 0 ? Number(result[0].spent.toString()) : 0;

        const remaining = budgetAmount - spent;

        const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

        return {
          ...budget,

          amount: budget.amount,

          spent,

          remaining,

          percentage: Number(percentage.toFixed(2)),
        };
      }),
    );

    return res.status(200).json({
      success: true,
      count: budgetsWithStatus.length,
      data: budgetsWithStatus,
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// GET /api/budgets/:id
// ==========================================

const getBudgetById = async (req, res) => {
  try {
    const userId = req.user.id;

    const budgetId = req.params.id;

    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    }).populate("categoryId", "name type icon color");

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: budget,
    });
  } catch (error) {
    console.error("Get budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// POST /api/budgets
// ==========================================

const createBudget = async (req, res) => {
  try {
    const userId = req.user.id;

    const { category, amount, month, alertPercentage, isActive } = req.body;

    // Validate category
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    // Validate amount
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // Validate month
    if (!month) {
      return res.status(400).json({
        success: false,
        message: "Month is required",
      });
    }

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Month must be in YYYY-MM format",
      });
    }

    // Alert percentage
    let budgetAlertPercentage = 80;

    if (alertPercentage !== undefined) {
      budgetAlertPercentage = Number(alertPercentage);

      if (
        !Number.isFinite(budgetAlertPercentage) ||
        budgetAlertPercentage < 1 ||
        budgetAlertPercentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Alert percentage must be between 1 and 100",
        });
      }
    }

    // Verify category ownership
    const categoryData = await Category.findOne({
      _id: category,
      userId,
    });

    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Only expense categories
    if (categoryData.type !== "EXPENSE") {
      return res.status(400).json({
        success: false,
        message: "Budget can only be created for an expense category",
      });
    }

    // Check duplicate
    const existingBudget = await Budget.findOne({
      userId,
      categoryId: category,
      month,
    });

    if (existingBudget) {
      return res.status(409).json({
        success: false,
        message: "A budget already exists for this category and month",
      });
    }

    // Create budget
    const budget = new Budget({
      userId,
      categoryId: category,
      month,

      amount: mongoose.Types.Decimal128.fromString(numericAmount.toString()),

      alertPercentage: budgetAlertPercentage,

      isActive: isActive !== undefined ? isActive : true,
    });

    await budget.save();

    const createdBudget = await Budget.findById(budget._id).populate(
      "categoryId",
      "name type icon color",
    );

    return res.status(201).json({
      success: true,
      message: "Budget created successfully",
      data: createdBudget,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A budget already exists for this category and month",
      });
    }

    console.error("Create budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// PUT /api/budgets/:id
// ==========================================

const updateBudget = async (req, res) => {
  try {
    const userId = req.user.id;

    const budgetId = req.params.id;

    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const { amount, alertPercentage, isActive } = req.body;

    // Amount
    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      budget.amount = mongoose.Types.Decimal128.fromString(
        numericAmount.toString(),
      );
    }

    // Alert percentage
    if (alertPercentage !== undefined) {
      const numericAlertPercentage = Number(alertPercentage);

      if (
        !Number.isFinite(numericAlertPercentage) ||
        numericAlertPercentage < 1 ||
        numericAlertPercentage > 100
      ) {
        return res.status(400).json({
          success: false,
          message: "Alert percentage must be between 1 and 100",
        });
      }

      budget.alertPercentage = numericAlertPercentage;
    }

    // Active
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      budget.isActive = isActive;
    }

    await budget.save();

    const updatedBudget = await Budget.findById(budget._id).populate(
      "categoryId",
      "name type icon color",
    );

    return res.status(200).json({
      success: true,
      message: "Budget updated successfully",
      data: updatedBudget,
    });
  } catch (error) {
    console.error("Update budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// DELETE /api/budgets/:id
// ==========================================

const deleteBudget = async (req, res) => {
  try {
    const userId = req.user.id;

    const budgetId = req.params.id;

    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    await Budget.deleteOne({
      _id: budgetId,
      userId,
    });

    return res.status(200).json({
      success: true,
      message: "Budget deleted successfully",
    });
  } catch (error) {
    console.error("Delete budget error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// GET /api/budgets/:id/status
// ==========================================

const getBudgetStatus = async (req, res) => {
  try {
    const userId = req.user.id;

    const budgetId = req.params.id;

    const budget = await Budget.findOne({
      _id: budgetId,
      userId,
    }).populate("categoryId", "name type icon color");

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    const [year, month] = budget.month.split("-").map(Number);

    const startDate = new Date(year, month - 1, 1);

    const endDate = new Date(year, month, 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: budget.userId,
          categoryId: budget.categoryId._id,
          type: "EXPENSE",
          status: {
            $ne: "CANCELLED",
          },
          date: {
            $gte: startDate,
            $lt: endDate,
          },
        },
      },
      {
        $group: {
          _id: null,
          spent: {
            $sum: "$amount",
          },
        },
      },
    ]);

    const spent = result.length > 0 ? Number(result[0].spent.toString()) : 0;

    const budgetAmount = Number(budget.amount.toString());

    const remaining = budgetAmount - spent;

    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    return res.status(200).json({
      success: true,
      data: {
        budget: budgetAmount,
        spent,
        remaining,
        percentage: Number(percentage.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Get budget status error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
};
