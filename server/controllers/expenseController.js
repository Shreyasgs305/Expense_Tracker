const mongoose = require("mongoose");

const Transaction = require("../models/Transaction");
const Category = require("../models/Category");
const Account = require("../models/Account");

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const toNumber = (value) => {
  if (value === undefined || value === null) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  if (value?.$numberDecimal !== undefined) {
    return Number(value.$numberDecimal);
  }

  return Number(value.toString());
};

const toDecimal128 = (value) => {
  return mongoose.Types.Decimal128.fromString(Number(value).toFixed(2));
};

// ============================================================
// GET ALL EXPENSES / TRANSACTIONS
// GET /api/expenses
// ============================================================

const getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;

    const { category, account, type, startDate, endDate } = req.query;

    const query = {
      userId: userId,
    };

    if (category) {
      if (!isValidObjectId(category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      query.categoryId = category;
    }

    if (account) {
      if (!isValidObjectId(account)) {
        return res.status(400).json({
          success: false,
          message: "Invalid account ID",
        });
      }

      query.accountId = account;
    }

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

    const transactions = await Transaction.find(query)
      .sort({
        date: -1,
        createdAt: -1,
      })
      .populate("categoryId", "name type icon color")
      .populate("accountId", "name type");

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

// ============================================================
// GET SINGLE EXPENSE
// GET /api/expenses/:id
// ============================================================

const getExpenseById = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    if (!isValidObjectId(transactionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: userId,
    })
      .populate("categoryId", "name type icon color")
      .populate("accountId", "name type");

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

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

// ============================================================
// CREATE EXPENSE / INCOME
// POST /api/expenses
// ============================================================

const createExpense = async (req, res) => {
  try {
    const userId = req.user.id;

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

    // ========================================================
    // 1. VALIDATE AMOUNT
    // ========================================================

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

    // ========================================================
    // 2. VALIDATE ACCOUNT
    // ========================================================

    if (!account) {
      return res.status(400).json({
        success: false,
        message: "Account is required",
      });
    }

    if (!isValidObjectId(account)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    // ========================================================
    // 3. VALIDATE DESCRIPTION
    // ========================================================

    if (!description || !description.trim()) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    // ========================================================
    // 4. VALIDATE DATE
    // ========================================================

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const transactionDate = new Date(date);

    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // ========================================================
    // 5. VALIDATE TYPE
    // ========================================================

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

    // ========================================================
    // 6. VALIDATE PAYMENT METHOD
    // ========================================================

    if (
      paymentMethod &&
      !["BANK", "CASH", "CARD", "UPI"].includes(paymentMethod.toUpperCase())
    ) {
      return res.status(400).json({
        success: false,
        message: "Payment method must be BANK, CASH, CARD, or UPI",
      });
    }

    // ========================================================
    // 7. FIND ACCOUNT
    // ========================================================

    const accountData = await Account.findOne({
      _id: account,
      userId: userId,
    });

    if (!accountData) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // ========================================================
    // 8. VALIDATE CATEGORY
    // ========================================================

    let categoryData = null;

    if (category) {
      if (!isValidObjectId(category)) {
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

    if (
      (transactionType === "EXPENSE" || transactionType === "INCOME") &&
      !category
    ) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // ========================================================
    // 9. UPDATE ACCOUNT BALANCE
    // ========================================================

    const currentBalance = toNumber(accountData.balance);

    const isCreditCard = accountData.type === "CREDIT_CARD";

    let newBalance = currentBalance;

    // --------------------------------------------------------
    // CREDIT CARD
    // --------------------------------------------------------

    if (isCreditCard) {
      const currentOutstanding = Math.abs(currentBalance);
      const creditLimit = toNumber(accountData.creditLimit);

      // CREDIT CARD EXPENSE
      if (transactionType === "EXPENSE") {
        const availableCredit = Math.max(creditLimit - currentOutstanding, 0);

        if (numericAmount > availableCredit) {
          return res.status(400).json({
            success: false,
            message: `Insufficient credit. Available credit is ₹${availableCredit.toFixed(
              2,
            )}`,
          });
        }

        // Store outstanding as negative
        newBalance = -(currentOutstanding + numericAmount);
      }

      // CREDIT CARD PAYMENT / INCOME
      if (transactionType === "INCOME") {
        newBalance = -Math.max(currentOutstanding - numericAmount, 0);
      }
    }

    // --------------------------------------------------------
    // NORMAL ACCOUNT
    // BANK / CASH / WALLET
    // --------------------------------------------------------
    else {
      if (transactionType === "EXPENSE") {
        if (currentBalance < numericAmount) {
          return res.status(400).json({
            success: false,
            message: `Insufficient balance. Available balance is ₹${currentBalance.toFixed(
              2,
            )}`,
          });
        }

        newBalance = currentBalance - numericAmount;
      }

      if (transactionType === "INCOME") {
        newBalance = currentBalance + numericAmount;
      }
    }

    accountData.balance = toDecimal128(newBalance);

    // ========================================================
    // 10. CREATE TRANSACTION
    // ========================================================

    const transaction = new Transaction({
      userId: userId,

      type: transactionType,

      accountId: account,

      categoryId: category || null,

      amount: mongoose.Types.Decimal128.fromString(numericAmount.toString()),

      description: description.trim(),

      date: transactionDate,

      paymentMethod: paymentMethod ? paymentMethod.toUpperCase() : null,

      budgetId: budgetId || null,

      notes: notes ? notes.trim() : null,
    });

    // ========================================================
    // 11. SAVE TRANSACTION
    // ========================================================

    await transaction.save();

    // ========================================================
    // 12. SAVE ACCOUNT
    // ========================================================

    await accountData.save();

    // ========================================================
    // 13. GET CREATED TRANSACTION
    // ========================================================

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

// ============================================================
// UPDATE EXPENSE / INCOME
// PUT /api/expenses/:id
// ============================================================

// ============================================================
// UPDATE EXPENSE / INCOME / CREDIT CARD PAYMENT
// PUT /api/expenses/:id
// ============================================================

const updateExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    // ========================================================
    // 1. VALIDATE TRANSACTION ID
    // ========================================================

    if (!isValidObjectId(transactionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    // ========================================================
    // 2. FIND TRANSACTION
    // ========================================================

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // ========================================================
    // 3. CREDIT CARD PAYMENT
    // ========================================================

    if (transaction.type === "CREDIT_CARD_PAYMENT") {
      const { amount, date, description, notes } = req.body;

      const newAmount =
        amount !== undefined ? Number(amount) : toNumber(transaction.amount);

      if (!Number.isFinite(newAmount) || newAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: "Amount must be greater than 0",
        });
      }

      const newDate = date !== undefined ? new Date(date) : transaction.date;

      if (isNaN(newDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date",
        });
      }

      const newDescription =
        description !== undefined
          ? description.trim()
          : transaction.description;

      if (!newDescription) {
        return res.status(400).json({
          success: false,
          message: "Description is required",
        });
      }

      // ------------------------------------------------------
      // OLD ACCOUNTS
      // ------------------------------------------------------

      const oldCreditCard = await Account.findOne({
        _id: transaction.accountId,
        userId,
      });

      const oldPaymentAccount = await Account.findOne({
        _id: transaction.fromAccountId,
        userId,
      });

      if (!oldCreditCard) {
        return res.status(404).json({
          success: false,
          message: "Credit card account not found",
        });
      }

      if (!oldPaymentAccount) {
        return res.status(404).json({
          success: false,
          message: "Payment account not found",
        });
      }

      const oldAmount = toNumber(transaction.amount);

      // ------------------------------------------------------
      // REVERSE OLD PAYMENT
      // ------------------------------------------------------

      const oldPaymentBalance = toNumber(oldPaymentAccount.balance);

      oldPaymentAccount.balance = toDecimal128(oldPaymentBalance + oldAmount);

      const oldOutstanding = Math.abs(toNumber(oldCreditCard.balance));

      oldCreditCard.balance = toDecimal128(-(oldOutstanding + oldAmount));

      // ------------------------------------------------------
      // CHECK NEW PAYMENT AMOUNT
      // ------------------------------------------------------

      const availableBankBalance = toNumber(oldPaymentAccount.balance);

      if (newAmount > availableBankBalance) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Available balance is ₹${availableBankBalance.toFixed(
            2,
          )}`,
        });
      }

      const availableOutstanding = Math.abs(toNumber(oldCreditCard.balance));

      if (newAmount > availableOutstanding) {
        return res.status(400).json({
          success: false,
          message: `Payment cannot exceed outstanding amount of ₹${availableOutstanding.toFixed(
            2,
          )}`,
        });
      }

      // ------------------------------------------------------
      // APPLY NEW PAYMENT
      // ------------------------------------------------------

      oldPaymentAccount.balance = toDecimal128(
        availableBankBalance - newAmount,
      );

      oldCreditCard.balance = toDecimal128(-(availableOutstanding - newAmount));

      // ------------------------------------------------------
      // UPDATE TRANSACTION
      // ------------------------------------------------------

      transaction.amount = mongoose.Types.Decimal128.fromString(
        newAmount.toString(),
      );

      transaction.date = newDate;

      transaction.description = newDescription;

      if (notes !== undefined) {
        transaction.notes = notes?.trim() || null;
      }

      // ------------------------------------------------------
      // SAVE
      // ------------------------------------------------------

      await oldPaymentAccount.save();
      await oldCreditCard.save();
      await transaction.save();

      const updatedPayment = await Transaction.findById(transaction._id)
        .populate("accountId", "name type balance creditLimit")
        .populate("fromAccountId", "name type balance");

      return res.status(200).json({
        success: true,
        message: "Credit card payment updated successfully",
        data: updatedPayment,
      });
    }

    // ========================================================
    // NORMAL EXPENSE / INCOME
    // ========================================================

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

    const oldAmount = toNumber(transaction.amount);
    const oldType = transaction.type;
    const oldAccountId = transaction.accountId.toString();

    const newAmount = amount !== undefined ? Number(amount) : oldAmount;

    const newType = type !== undefined ? type.toUpperCase() : oldType;

    const newAccountId =
      account !== undefined ? account : transaction.accountId;

    const newCategoryId =
      category !== undefined ? category : transaction.categoryId;

    // --------------------------------------------------------
    // VALIDATE AMOUNT
    // --------------------------------------------------------

    if (!Number.isFinite(newAmount) || newAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // --------------------------------------------------------
    // VALIDATE TYPE
    // --------------------------------------------------------

    if (!["EXPENSE", "INCOME", "TRANSFER"].includes(newType)) {
      return res.status(400).json({
        success: false,
        message: "Type must be EXPENSE, INCOME, or TRANSFER",
      });
    }

    // --------------------------------------------------------
    // DESCRIPTION
    // --------------------------------------------------------

    const newDescription =
      description !== undefined ? description.trim() : transaction.description;

    if (!newDescription) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    // --------------------------------------------------------
    // DATE
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // NEW ACCOUNT
    // --------------------------------------------------------

    if (!isValidObjectId(newAccountId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid account ID",
      });
    }

    const newAccount = await Account.findOne({
      _id: newAccountId,
      userId,
    });

    if (!newAccount) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    // --------------------------------------------------------
    // PAYMENT METHOD
    // --------------------------------------------------------

    let newPaymentMethod = transaction.paymentMethod;

    if (paymentMethod !== undefined) {
      if (
        paymentMethod &&
        !["BANK", "CASH", "CARD", "UPI"].includes(paymentMethod.toUpperCase())
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment method must be BANK, CASH, CARD, or UPI",
        });
      }

      newPaymentMethod = paymentMethod ? paymentMethod.toUpperCase() : null;
    }

    // --------------------------------------------------------
    // CATEGORY
    // --------------------------------------------------------

    let newCategory = null;

    if (newCategoryId) {
      if (!isValidObjectId(newCategoryId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      newCategory = await Category.findOne({
        _id: newCategoryId,
        userId,
      });

      if (!newCategory) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      if (newType !== "TRANSFER" && newCategory.type !== newType) {
        return res.status(400).json({
          success: false,
          message: `Category type must be ${newType}`,
        });
      }
    }

    if ((newType === "EXPENSE" || newType === "INCOME") && !newCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Category is required",
      });
    }

    // --------------------------------------------------------
    // OLD ACCOUNT
    // --------------------------------------------------------

    const oldAccount = await Account.findOne({
      _id: transaction.accountId,
      userId,
    });

    if (!oldAccount) {
      return res.status(404).json({
        success: false,
        message: "Original account not found",
      });
    }

    // --------------------------------------------------------
    // REVERSE OLD TRANSACTION
    // --------------------------------------------------------

    let oldBalance = toNumber(oldAccount.balance);

    const oldIsCreditCard = oldAccount.type === "CREDIT_CARD";

    if (oldIsCreditCard) {
      const oldOutstanding = Math.abs(oldBalance);

      if (oldType === "EXPENSE") {
        oldBalance = -Math.max(oldOutstanding - oldAmount, 0);
      }

      if (oldType === "INCOME") {
        oldBalance = -(oldOutstanding + oldAmount);
      }
    } else {
      if (oldType === "EXPENSE") {
        oldBalance += oldAmount;
      }

      if (oldType === "INCOME") {
        oldBalance -= oldAmount;
      }
    }

    oldAccount.balance = toDecimal128(oldBalance);

    // --------------------------------------------------------
    // APPLY NEW TRANSACTION
    // --------------------------------------------------------

    let newBalance;

    if (oldAccountId === newAccount._id.toString()) {
      newBalance = toNumber(oldAccount.balance);
    } else {
      newBalance = toNumber(newAccount.balance);
    }

    const newIsCreditCard = newAccount.type === "CREDIT_CARD";

    if (newIsCreditCard) {
      const currentOutstanding = Math.abs(newBalance);

      const creditLimit = toNumber(newAccount.creditLimit);

      if (newType === "EXPENSE") {
        const availableCredit = Math.max(creditLimit - currentOutstanding, 0);

        if (newAmount > availableCredit) {
          return res.status(400).json({
            success: false,
            message: `Insufficient credit. Available credit is ₹${availableCredit.toFixed(
              2,
            )}`,
          });
        }

        newBalance = -(currentOutstanding + newAmount);
      }

      if (newType === "INCOME") {
        newBalance = -Math.max(currentOutstanding - newAmount, 0);
      }
    } else {
      if (newType === "EXPENSE") {
        if (newBalance < newAmount) {
          return res.status(400).json({
            success: false,
            message: `Insufficient balance. Available balance is ₹${newBalance.toFixed(
              2,
            )}`,
          });
        }

        newBalance -= newAmount;
      }

      if (newType === "INCOME") {
        newBalance += newAmount;
      }
    }

    newAccount.balance = toDecimal128(newBalance);

    // --------------------------------------------------------
    // SAVE ACCOUNTS
    // --------------------------------------------------------

    if (oldAccount._id.toString() !== newAccount._id.toString()) {
      await oldAccount.save();
    }

    await newAccount.save();

    // --------------------------------------------------------
    // UPDATE TRANSACTION
    // --------------------------------------------------------

    transaction.amount = mongoose.Types.Decimal128.fromString(
      newAmount.toString(),
    );

    transaction.type = newType;

    transaction.accountId = newAccountId;

    transaction.categoryId = newCategoryId || null;

    transaction.description = newDescription;

    transaction.date = newDate;

    transaction.paymentMethod = newPaymentMethod;

    if (budgetId !== undefined) {
      transaction.budgetId = budgetId || null;
    }

    if (notes !== undefined) {
      transaction.notes = notes?.trim() || null;
    }

    await transaction.save();

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

// ============================================================
// DELETE EXPENSE
// DELETE /api/expenses/:id
// ============================================================

const deleteExpense = async (req, res) => {
  try {
    const userId = req.user.id;
    const transactionId = req.params.id;

    // ========================================================
    // 1. VALIDATE ID
    // ========================================================

    if (!isValidObjectId(transactionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID",
      });
    }

    // ========================================================
    // 2. FIND TRANSACTION
    // ========================================================

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // ========================================================
    // 3. CREDIT CARD PAYMENT
    // ========================================================

    if (transaction.type === "CREDIT_CARD_PAYMENT") {
      const creditCard = await Account.findOne({
        _id: transaction.accountId,
        userId,
      });

      const paymentAccount = await Account.findOne({
        _id: transaction.fromAccountId,
        userId,
      });

      if (!creditCard) {
        return res.status(404).json({
          success: false,
          message: "Credit card account not found",
        });
      }

      if (!paymentAccount) {
        return res.status(404).json({
          success: false,
          message: "Payment account not found",
        });
      }

      const amount = toNumber(transaction.amount);

      // ------------------------------------------------------
      // Restore bank/cash/wallet balance
      // ------------------------------------------------------

      const currentPaymentBalance = toNumber(paymentAccount.balance);

      paymentAccount.balance = toDecimal128(currentPaymentBalance + amount);

      // ------------------------------------------------------
      // Restore credit card outstanding
      // ------------------------------------------------------

      const currentOutstanding = Math.abs(toNumber(creditCard.balance));

      creditCard.balance = toDecimal128(-(currentOutstanding + amount));

      // ------------------------------------------------------
      // Save both accounts
      // ------------------------------------------------------

      await paymentAccount.save();
      await creditCard.save();

      // ------------------------------------------------------
      // Delete transaction
      // ------------------------------------------------------

      await Transaction.deleteOne({
        _id: transactionId,
        userId,
      });

      return res.status(200).json({
        success: true,
        message: "Credit card payment deleted successfully",
      });
    }

    // ========================================================
    // 4. NORMAL EXPENSE / INCOME
    // ========================================================

    const account = await Account.findOne({
      _id: transaction.accountId,
      userId,
    });

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Account not found",
      });
    }

    const amount = toNumber(transaction.amount);

    const isCreditCard = account.type === "CREDIT_CARD";

    let balance = toNumber(account.balance);

    if (isCreditCard) {
      const outstanding = Math.abs(balance);

      if (transaction.type === "EXPENSE") {
        balance = -Math.max(outstanding - amount, 0);
      }

      if (transaction.type === "INCOME") {
        balance = -(outstanding + amount);
      }
    } else {
      if (transaction.type === "EXPENSE") {
        balance += amount;
      }

      if (transaction.type === "INCOME") {
        balance -= amount;
      }
    }

    account.balance = toDecimal128(balance);

    await account.save();

    await Transaction.deleteOne({
      _id: transactionId,
      userId,
    });

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
// ============================================================
// CREATE CREDIT CARD PAYMENT
// POST /api/expenses/credit-card-payment
// ============================================================

const createCreditCardPayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const { fromAccount, creditCardAccount, amount, date, description, notes } =
      req.body;

    // ========================================================
    // 1. VALIDATE AMOUNT
    // ========================================================

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    // ========================================================
    // 2. VALIDATE FROM ACCOUNT
    // ========================================================

    if (!fromAccount || !isValidObjectId(fromAccount)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment account is required",
      });
    }

    // ========================================================
    // 3. VALIDATE CREDIT CARD
    // ========================================================

    if (!creditCardAccount || !isValidObjectId(creditCardAccount)) {
      return res.status(400).json({
        success: false,
        message: "Valid credit card account is required",
      });
    }

    // Prevent paying a card from itself
    if (fromAccount === creditCardAccount) {
      return res.status(400).json({
        success: false,
        message: "Payment account and credit card cannot be the same",
      });
    }

    // ========================================================
    // 4. VALIDATE DATE
    // ========================================================

    if (!date) {
      return res.status(400).json({
        success: false,
        message: "Date is required",
      });
    }

    const transactionDate = new Date(date);

    if (isNaN(transactionDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid date",
      });
    }

    // ========================================================
    // 5. VALIDATE DESCRIPTION
    // ========================================================

    const paymentDescription = description?.trim() || "Credit card payment";

    // ========================================================
    // 6. GET PAYMENT ACCOUNT
    // ========================================================

    const paymentAccount = await Account.findOne({
      _id: fromAccount,
      userId,
    });

    if (!paymentAccount) {
      return res.status(404).json({
        success: false,
        message: "Payment account not found",
      });
    }

    // Payment must come from a real-money account
    if (!["BANK", "CASH", "WALLET"].includes(paymentAccount.type)) {
      return res.status(400).json({
        success: false,
        message: "Payment must come from a bank, cash, or wallet account",
      });
    }

    // ========================================================
    // 7. GET CREDIT CARD
    // ========================================================

    const creditCard = await Account.findOne({
      _id: creditCardAccount,
      userId,
    });

    if (!creditCard) {
      return res.status(404).json({
        success: false,
        message: "Credit card account not found",
      });
    }

    if (creditCard.type !== "CREDIT_CARD") {
      return res.status(400).json({
        success: false,
        message: "Selected account is not a credit card",
      });
    }

    // ========================================================
    // 8. CHECK PAYMENT ACCOUNT BALANCE
    // ========================================================

    const paymentBalance = toNumber(paymentAccount.balance);

    if (paymentBalance < numericAmount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient balance. Available balance is ₹${paymentBalance.toFixed(
          2,
        )}`,
      });
    }

    // ========================================================
    // 9. GET CREDIT CARD OUTSTANDING
    // ========================================================

    const currentOutstanding = Math.abs(toNumber(creditCard.balance));

    // ========================================================
    // 10. CHECK OUTSTANDING
    // ========================================================

    if (currentOutstanding === 0) {
      return res.status(400).json({
        success: false,
        message: "Credit card has no outstanding balance",
      });
    }

    // ========================================================
    // 11. PREVENT OVERPAYMENT
    // ========================================================

    if (numericAmount > currentOutstanding) {
      return res.status(400).json({
        success: false,
        message: `Payment cannot exceed outstanding amount of ₹${currentOutstanding.toFixed(
          2,
        )}`,
      });
    }

    // ========================================================
    // 12. UPDATE PAYMENT ACCOUNT
    // ========================================================

    const newPaymentBalance = paymentBalance - numericAmount;

    paymentAccount.balance = toDecimal128(newPaymentBalance);

    // ========================================================
    // 13. UPDATE CREDIT CARD
    // ========================================================

    const newOutstanding = currentOutstanding - numericAmount;

    creditCard.balance = toDecimal128(-newOutstanding);

    // ========================================================
    // 14. CREATE TRANSACTION
    // ========================================================

    const transaction = new Transaction({
      userId,

      type: "CREDIT_CARD_PAYMENT",

      // Credit card receiving the payment
      accountId: creditCard._id,

      // Bank/Cash/Wallet sending the payment
      fromAccountId: paymentAccount._id,

      categoryId: null,

      amount: mongoose.Types.Decimal128.fromString(numericAmount.toString()),

      description: paymentDescription,

      date: transactionDate,

      paymentMethod:
        paymentAccount.type === "BANK"
          ? "BANK"
          : paymentAccount.type === "CASH"
            ? "CASH"
            : "UPI",

      budgetId: null,

      notes: notes?.trim() || null,

      status: "COMPLETED",
    });

    // ========================================================
    // 15. SAVE TRANSACTION
    // ========================================================

    await transaction.save();

    // ========================================================
    // 16. SAVE ACCOUNTS
    // ========================================================

    await paymentAccount.save();
    await creditCard.save();

    // ========================================================
    // 17. GET CREATED TRANSACTION
    // ========================================================

    const createdTransaction = await Transaction.findById(transaction._id)
      .populate("accountId", "name type balance creditLimit")
      .populate("fromAccountId", "name type balance");

    // ========================================================
    // 18. RESPONSE
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Credit card payment completed successfully",
      data: createdTransaction,
    });
  } catch (error) {
    console.error("Create credit card payment error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ============================================================
// EXPORT CONTROLLERS
// ============================================================

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  createCreditCardPayment,
};
