const mongoose = require("mongoose");
const Budget = require("../models/Budget");
const Category = require("../models/Category");
const Transaction = require("../models/Transaction");

// GET /api/budgets
const getBudgets = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Find budgets belonging to logged-in user
    const budgets = await Budget.find({
      userId: userId,
    })
      .populate("categoryId", "name type icon color")
      .sort({ month: -1, createdAt: -1 });

    // 3. Return budgets
    return res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets,
    });
  } catch (error) {
    console.error("Get budgets error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getBudgetById = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get budget ID
    const budgetId = req.params.id;

    // 3. Find budget belonging to logged-in user
    const budget = await Budget.findOne({
      _id: budgetId,
      userId: userId,
    }).populate("categoryId", "name type icon color");

    // 4. If not found
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // 5. Return budget
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
// POST /api/budgets
const createBudget = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get budget details
    const { category, amount, month, alertPercentage, isActive } = req.body;

    // 3. Validate category
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

    // 4. Validate amount
    if (amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount < 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be a valid number greater than or equal to 0",
      });
    }

    // 5. Validate month
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

    // 6. Validate alert percentage if provided
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

    // 7. Verify category belongs to logged-in user
    const categoryData = await Category.findOne({
      _id: category,
      userId: userId,
    });

    if (!categoryData) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Budget should be for an expense category
    if (categoryData.type !== "EXPENSE") {
      return res.status(400).json({
        success: false,
        message: "Budget can only be created for an expense category",
      });
    }

    // 8. Check whether budget already exists
    const existingBudget = await Budget.findOne({
      userId: userId,
      categoryId: category,
      month: month,
    });

    if (existingBudget) {
      return res.status(409).json({
        success: false,
        message: "A budget already exists for this category and month",
      });
    }

    // 9. Create budget
    const budget = new Budget({
      userId: userId,
      categoryId: category,
      month: month,
      amount: mongoose.Types.Decimal128.fromString(numericAmount.toString()),
      alertPercentage: budgetAlertPercentage,
      isActive: isActive !== undefined ? isActive : true,
    });

    // 10. Save budget
    await budget.save();

    // 11. Return created budget
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
    // Handle unique index race condition
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
// PUT /api/budgets/:id
const updateBudget = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get budget ID
    const budgetId = req.params.id;

    // 3. Find budget belonging to logged-in user
    const budget = await Budget.findOne({
      _id: budgetId,
      userId: userId,
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // 4. Get allowed fields
    const { amount, alertPercentage, isActive } = req.body;

    // 5. Validate amount if provided
    if (amount !== undefined) {
      const numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount) || numericAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be a valid number greater than or equal to 0",
        });
      }

      budget.amount = mongoose.Types.Decimal128.fromString(
        numericAmount.toString(),
      );
    }

    // 6. Validate alert percentage if provided
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

    // 7. Update isActive if provided
    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isActive must be true or false",
        });
      }

      budget.isActive = isActive;
    }

    // 8. Save updated budget
    await budget.save();

    // 9. Populate category
    const updatedBudget = await Budget.findById(budget._id).populate(
      "categoryId",
      "name type icon color",
    );

    // 10. Return updated budget
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

const deleteBudget = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get budget ID
    const budgetId = req.params.id;

    // 3. Find budget belonging to logged-in user
    const budget = await Budget.findOne({
      _id: budgetId,
      userId: userId,
    });

    // 4. If not found
    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // 5. Delete budget
    await Budget.deleteOne({
      _id: budgetId,
      userId: userId,
    });

    // 6. Return success
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

const getBudgetStatus = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get budget ID
    const budgetId = req.params.id;

    // 3. Find budget belonging to logged-in user
    const budget = await Budget.findOne({
      _id: budgetId,
      userId: userId,
    }).populate("categoryId", "name type icon color");

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: "Budget not found",
      });
    }

    // 4. Get budget month
    const [year, month] = budget.month.split("-").map(Number);

    // Start of budget month
    const startDate = new Date(year, month - 1, 1);

    // Start of next month
    const endDate = new Date(year, month, 1);

    // 5. Calculate total spending
    const result = await Transaction.aggregate([
      {
        $match: {
          userId: budget.userId,
          categoryId: budget.categoryId._id,
          type: "EXPENSE",
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

    // 6. Get spent amount
    const spentDecimal =
      result.length > 0
        ? result[0].spent
        : mongoose.Types.Decimal128.fromString("0");

    const budgetAmount = Number(budget.amount.toString());
    const spent = Number(spentDecimal.toString());

    // 7. Calculate remaining
    const remaining = budgetAmount - spent;

    // 8. Calculate percentage
    const percentage = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    // 9. Return status
    return res.status(200).json({
      success: true,
      data: {
        budget: budgetAmount,
        spent: spent,
        remaining: remaining,
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
module.exports = {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
};
