const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const Account = require("../models/Account");

// GET /api/expenses
const getExpenses = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Read optional filters
    const { category, account, type, startDate, endDate } = req.query;

    // 3. Start filter with logged-in user
    const query = {
      userId: userId,
    };

    // 4. Category filter
    if (category) {
      query.categoryId = category;
    }

    // 5. Account filter
    if (account) {
      query.accountId = account;
    }

    // 6. Type filter
    if (type) {
      const transactionType = type.toUpperCase();

      if (!["EXPENSE", "INCOME", "TRANSFER"].includes(transactionType)) {
        return res.status(400).json({
          success: false,
          message: "Type must be EXPENSE, INCOME, or TRANSFER",
        });
      }

      query.type = transactionType;
    }

    // 7. Date range filter
    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        const start = new Date(startDate);

        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate",
          });
        }

        start.setHours(0, 0, 0, 0);
        query.date.$gte = start;
      }

      if (endDate) {
        const end = new Date(endDate);

        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate",
          });
        }

        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // 8. Find transactions, newest first
    const transactions = await Transaction.find(query)
      .sort({ date: -1, createdAt: -1 })
      .populate("categoryId", "name type icon color")
      .populate("accountId", "name type");

    // 9. Return transactions
    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Get expenses error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get transaction ID
    const transactionId = req.params.id;

    // 3. Find transaction belonging to logged-in user
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: userId,
    })
      .populate("categoryId", "name type icon color")
      .populate("accountId", "name type");

    // 4. If not found
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // 5. Return transaction
    return res.status(200).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Get expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// POST /api/expenses
const createExpense = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get data from request body
    const {
      amount,
      category,
      account,
      date,
      description,
      type,
      paymentMethod,
      budgetId,
      notes,
    } = req.body;

    // 3. Validate required fields
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

    if (!account) {
      return res.status(400).json({
        success: false,
        message: "Account is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    // 4. Validate transaction type
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Transaction type is required",
      });
    }

    const transactionType = type.toUpperCase();

    if (!["EXPENSE", "INCOME", "TRANSFER"].includes(transactionType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be EXPENSE, INCOME, or TRANSFER",
      });
    }

    // 5. Validate date
    const transactionDate = new Date(date);

    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // 6. Validate account ID
    if (!mongoose.Types.ObjectId.isValid(account)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    // 7. Verify account belongs to logged-in user
    const accountData = await Account.findOne({
      _id: account,
      user: userId,
    });

    if (!accountData) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // 8. Verify category
    let categoryData = null;

    if (category) {
      if (!mongoose.Types.ObjectId.isValid(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      categoryData = await Category.findOne({
        _id: category,
        userId: userId,
      });

      if (!categoryData) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Make sure category type matches transaction type
      if (
        transactionType !== "TRANSFER" &&
        categoryData.type !== transactionType
      ) {
        return res.status(400).json({
          success: false,
          message: `Category type must be ${transactionType}`,
        });
      }
    }

    // Category is required for EXPENSE and INCOME
    if (
      (transactionType === "EXPENSE" || transactionType === "INCOME") &&
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // 9. Update account balance
    if (transactionType === "EXPENSE") {
      accountData.balance -= numericAmount;
    } else if (transactionType === "INCOME") {
      accountData.balance += numericAmount;
    }

    // TRANSFER does not change balance here.
    // A proper transfer should have another account and transferId.

    // 10. Create transaction
    const transaction = new Transaction({
      userId: userId,
      type: transactionType,
      accountId: account,
      categoryId: category || null,
      amount: mongoose.Types.Decimal128.fromString(numericAmount.toString()),
      description: description.trim(),
      date: transactionDate,
      paymentMethod: paymentMethod || null,
      budgetId: budgetId || null,
      notes: notes ? notes.trim() : null,
    });

    // 11. Save transaction
    await transaction.save();

    // 12. Save updated account balance
    await accountData.save();

    // 13. Return created transaction
    const createdTransaction = await Transaction.findById(transaction._id)
      .populate("categoryId", "name type icon color")
      .populate("accountId", "name type");

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: createdTransaction,
    });
  } catch (error) {
    console.error("Create expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const updateExpense = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get transaction ID
    const transactionId = req.params.id;

    // 3. Find existing transaction belonging to user
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // 4. Get allowed fields from body
    const {
      amount,
      category,
      account,
      date,
      description,
      type,
      paymentMethod,
      budgetId,
      notes,
    } = req.body;

    // Store old values
    const oldAmount = Number(transaction.amount.toString());
    const oldType = transaction.type;
    const oldAccountId = transaction.accountId.toString();

    // New values (if not provided, keep old values)
    const newAmount = amount !== undefined ? Number(amount) : oldAmount;

    const newType = type !== undefined ? type.toUpperCase() : oldType;

    const newAccountId =
      account !== undefined ? account : transaction.accountId;

    const newCategoryId =
      category !== undefined ? category : transaction.categoryId;

    // 5. Validate amount
    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // 6. Validate type
    if (!["EXPENSE", "INCOME", "TRANSFER"].includes(newType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be EXPENSE, INCOME, or TRANSFER",
      });
    }

    // 7. Validate description
    const newDescription =
      description !== undefined ? description.trim() : transaction.description;

    if (!newDescription) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    // 8. Validate date
    let newDate = transaction.date;

    if (date !== undefined) {
      newDate = new Date(date);

      if (isNaN(newDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }
    }

    // 9. Verify new account belongs to user
    if (!mongoose.Types.ObjectId.isValid(newAccountId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const newAccount = await Account.findOne({
      _id: newAccountId,
      user: userId,
    });

    if (!newAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // 10. Verify category belongs to user
    let newCategory = null;

    if (newCategoryId) {
      if (!mongoose.Types.ObjectId.isValid(newCategoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      newCategory = await Category.findOne({
        _id: newCategoryId,
        userId: userId,
      });

      if (!newCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      // Category type must match transaction type
      if (newType !== "TRANSFER" && newCategory.type !== newType) {
        return res.status(400).json({
          success: false,
          message: `Category type must be ${newType}`,
        });
      }
    }

    // Category required for expense/income
    if ((newType === "EXPENSE" || newType === "INCOME") && !newCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // =====================================================
    // 11. REVERSE OLD TRANSACTION
    // =====================================================

    // Only reverse balance for EXPENSE / INCOME
    if (oldType === "EXPENSE") {
      if (oldAccountId === newAccountId.toString()) {
        // Same account
        newAccount.balance += oldAmount;
      } else {
        // Old account needs to be restored
        const oldAccount = await Account.findOne({
          _id: transaction.accountId,
          user: userId,
        });

        if (!oldAccount) {
          return res.status(404).json({
            success: false,
            message: "Original account not found",
          });
        }

        oldAccount.balance += oldAmount;
        await oldAccount.save();
      }
    } else if (oldType === "INCOME") {
      if (oldAccountId === newAccountId.toString()) {
        // Same account
        newAccount.balance -= oldAmount;
      } else {
        // Reverse old income from old account
        const oldAccount = await Account.findOne({
          _id: transaction.accountId,
          user: userId,
        });

        if (!oldAccount) {
          return res.status(404).json({
            success: false,
            message: "Original account not found",
          });
        }

        oldAccount.balance -= oldAmount;
        await oldAccount.save();
      }
    }

    // =====================================================
    // 12. APPLY NEW TRANSACTION
    // =====================================================

    if (newType === "EXPENSE") {
      newAccount.balance -= newAmount;
    } else if (newType === "INCOME") {
      newAccount.balance += newAmount;
    }

    // =====================================================
    // 13. UPDATE TRANSACTION
    // =====================================================

    transaction.amount = mongoose.Types.Decimal128.fromString(
      newAmount.toString(),
    );

    transaction.type = newType;
    transaction.accountId = newAccountId;
    transaction.categoryId = newCategoryId || null;
    transaction.description = newDescription;
    transaction.date = newDate;

    if (paymentMethod !== undefined) {
      transaction.paymentMethod = paymentMethod;
    }

    if (budgetId !== undefined) {
      transaction.budgetId = budgetId || null;
    }

    if (notes !== undefined) {
      transaction.notes = notes ? notes.trim() : null;
    }

    // 14. Save transaction and account
    await transaction.save();
    await newAccount.save();

    // 15. Get updated transaction
    const updatedTransaction = await Transaction.findById(transaction._id)
      .populate("categoryId", "name type icon color")
      .populate("accountId", "name type");

    return res.status(200).json({
      success: true,
      message: "Transaction updated successfully",
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Update expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    // 1. Authenticate user
    const userId = req.user.id;

    // 2. Get transaction ID
    const transactionId = req.params.id;

    // 3. Find transaction belonging to logged-in user
    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // 4. Get the account used by this transaction
    const account = await Account.findOne({
      _id: transaction.accountId,
      user: userId,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // 5. Reverse transaction's effect on account balance
    const amount = Number(transaction.amount.toString());

    if (transaction.type === "EXPENSE") {
      // Expense reduced balance, so restore it
      account.balance += amount;
    } else if (transaction.type === "INCOME") {
      // Income increased balance, so remove it
      account.balance -= amount;
    }

    // TRANSFER is not handled here.
    // Transfers require reversing both source and destination accounts.

    // 6. Save updated account balance
    await account.save();

    // 7. Delete transaction
    await Transaction.deleteOne({
      _id: transactionId,
      userId: userId,
    });

    // 8. Return success
    return res.status(200).json({
      success: true,
      message: "Transaction deleted successfully",
    });
  } catch (error) {
    console.error("Delete expense error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
