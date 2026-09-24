const mongoose = require("mongoose");

const Loan = require("../models/Loan");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

// =====================================================
// HELPERS
// =====================================================

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

// =====================================================
// CREATE LOAN
// POST /api/loans
// =====================================================

const createLoan = async (req, res) => {
  try {
    const userId = req.user.id;

    const { type, personName, amount, accountId, date, dueDate, notes } =
      req.body;

    // -----------------------------------------------
    // 1. VALIDATION
    // -----------------------------------------------

    if (!type || !personName || !amount || !accountId) {
      return res.status(400).json({
        message: "Type, person name, amount and account are required",
      });
    }

    if (!["LENT", "BORROWED"].includes(type)) {
      return res.status(400).json({
        message: "Invalid loan type",
      });
    }

    const loanAmount = Number(amount);

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than 0",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(accountId)) {
      return res.status(400).json({
        message: "Invalid account ID",
      });
    }

    // -----------------------------------------------
    // 2. FIND ACCOUNT
    // -----------------------------------------------

    const account = await Account.findOne({
      _id: accountId,
      userId,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Loans only use real-money accounts
    if (!["BANK", "CASH", "WALLET"].includes(account.type)) {
      return res.status(400).json({
        message: "Loans can only be linked to bank, cash, or wallet accounts",
      });
    }

    const currentBalance = toNumber(account.balance);

    // -----------------------------------------------
    // 3. CALCULATE ACCOUNT BALANCE
    // -----------------------------------------------

    let newBalance;

    if (type === "LENT") {
      // We give money → account decreases

      if (currentBalance < loanAmount) {
        return res.status(400).json({
          message: `Insufficient balance. Available balance is ₹${currentBalance.toFixed(
            2,
          )}`,
        });
      }

      newBalance = currentBalance - loanAmount;
    } else {
      // We receive borrowed money → account increases

      newBalance = currentBalance + loanAmount;
    }

    // -----------------------------------------------
    // 4. CREATE LOAN
    // -----------------------------------------------

    const loan = await Loan.create({
      userId,

      type,

      personName: personName.trim(),

      amount: toDecimal128(loanAmount),

      repaidAmount: toDecimal128(0),

      remainingAmount: toDecimal128(loanAmount),

      accountId,

      date: date || new Date(),

      dueDate: dueDate || null,

      notes: notes?.trim() || "",

      status: "PENDING",
    });

    // -----------------------------------------------
    // 5. CREATE TRANSACTION
    // -----------------------------------------------

    const transactionType = type === "LENT" ? "LOAN_GIVEN" : "LOAN_RECEIVED";

    const transaction = await Transaction.create({
      userId,

      type: transactionType,

      accountId,

      // IMPORTANT
      // Connect transaction to exact loan
      loanId: loan._id,

      categoryId: null,

      amount: toDecimal128(loanAmount),

      description:
        type === "LENT"
          ? `Money lent to ${personName.trim()}`
          : `Money borrowed from ${personName.trim()}`,

      date: date || new Date(),

      paymentMethod:
        account.type === "BANK"
          ? "BANK"
          : account.type === "CASH"
            ? "CASH"
            : "UPI",

      budgetId: null,

      notes: notes?.trim() || null,

      status: "COMPLETED",
    });

    // -----------------------------------------------
    // 6. UPDATE ACCOUNT BALANCE
    // -----------------------------------------------

    account.balance = toDecimal128(newBalance);

    await account.save();

    // -----------------------------------------------
    // 7. RESPONSE
    // -----------------------------------------------

    const populatedLoan = await Loan.findById(loan._id).populate(
      "accountId",
      "name type currency",
    );

    return res.status(201).json({
      message: "Loan created successfully",

      loan: populatedLoan,

      transaction,
    });
  } catch (error) {
    console.error("Create loan error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET ALL LOANS
// GET /api/loans
// =====================================================

const getLoans = async (req, res) => {
  try {
    const userId = req.user.id;

    const loans = await Loan.find({
      userId,
    })
      .populate("accountId", "name type currency")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      loans,
    });
  } catch (error) {
    console.error("Get loans error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET LOAN BY ID
// GET /api/loans/:id
// =====================================================

const getLoanById = async (req, res) => {
  try {
    const userId = req.user.id;

    const loan = await Loan.findOne({
      _id: req.params.id,
      userId,
    }).populate("accountId", "name type currency");

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    return res.status(200).json({
      loan,
    });
  } catch (error) {
    console.error("Get loan error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// RECORD REPAYMENT
// POST /api/loans/:id/repayment
// =====================================================

const recordRepayment = async (req, res) => {
  try {
    const userId = req.user.id;

    const { amount } = req.body;

    const repaymentAmount = Number(amount);

    // -----------------------------------------------
    // 1. VALIDATE AMOUNT
    // -----------------------------------------------

    if (!Number.isFinite(repaymentAmount) || repaymentAmount <= 0) {
      return res.status(400).json({
        message: "Repayment amount must be greater than 0",
      });
    }

    // -----------------------------------------------
    // 2. FIND LOAN
    // -----------------------------------------------

    const loan = await Loan.findOne({
      _id: req.params.id,
      userId,
    });

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    // -----------------------------------------------
    // 3. FIND ACCOUNT
    // -----------------------------------------------

    const account = await Account.findOne({
      _id: loan.accountId,
      userId,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const currentRemaining = toNumber(loan.remainingAmount);

    // -----------------------------------------------
    // 4. CHECK REPAYMENT AMOUNT
    // -----------------------------------------------

    if (repaymentAmount > currentRemaining) {
      return res.status(400).json({
        message: `Repayment cannot be greater than remaining amount of ₹${currentRemaining.toFixed(
          2,
        )}`,
      });
    }

    // -----------------------------------------------
    // 5. CALCULATE LOAN
    // -----------------------------------------------

    const currentRepaid = toNumber(loan.repaidAmount);

    const newRepaidAmount = currentRepaid + repaymentAmount;

    const newRemainingAmount = currentRemaining - repaymentAmount;

    // -----------------------------------------------
    // 6. CALCULATE ACCOUNT BALANCE
    // -----------------------------------------------

    const currentBalance = toNumber(account.balance);

    let newBalance;

    if (loan.type === "LENT") {
      // Person returns money to us
      // Account increases

      newBalance = currentBalance + repaymentAmount;
    } else {
      // We return borrowed money
      // Account decreases

      if (currentBalance < repaymentAmount) {
        return res.status(400).json({
          message: `Insufficient balance. Available balance is ₹${currentBalance.toFixed(
            2,
          )}`,
        });
      }

      newBalance = currentBalance - repaymentAmount;
    }

    // -----------------------------------------------
    // 7. UPDATE LOAN
    // -----------------------------------------------

    loan.repaidAmount = toDecimal128(newRepaidAmount);

    loan.remainingAmount = toDecimal128(newRemainingAmount);

    loan.status = newRemainingAmount === 0 ? "PAID" : "PARTIALLY_PAID";

    // -----------------------------------------------
    // 8. TRANSACTION TYPE
    // -----------------------------------------------

    const transactionType =
      loan.type === "LENT" ? "LOAN_REPAYMENT_RECEIVED" : "LOAN_REPAYMENT_MADE";

    // -----------------------------------------------
    // 9. CREATE REPAYMENT TRANSACTION
    // -----------------------------------------------

    const transaction = await Transaction.create({
      userId,

      type: transactionType,

      accountId: account._id,

      // IMPORTANT
      // Connect repayment to exact loan
      loanId: loan._id,

      categoryId: null,

      amount: toDecimal128(repaymentAmount),

      description:
        loan.type === "LENT"
          ? `Repayment received from ${loan.personName}`
          : `Repayment made to ${loan.personName}`,

      date: new Date(),

      paymentMethod:
        account.type === "BANK"
          ? "BANK"
          : account.type === "CASH"
            ? "CASH"
            : "UPI",

      budgetId: null,

      notes: null,

      status: "COMPLETED",
    });

    // -----------------------------------------------
    // 10. UPDATE ACCOUNT
    // -----------------------------------------------

    account.balance = toDecimal128(newBalance);

    // -----------------------------------------------
    // 11. SAVE EVERYTHING
    // -----------------------------------------------

    await loan.save();

    await account.save();

    // -----------------------------------------------
    // 12. RESPONSE
    // -----------------------------------------------

    const updatedLoan = await Loan.findById(loan._id).populate(
      "accountId",
      "name type currency",
    );

    return res.status(200).json({
      message: "Repayment recorded successfully",

      loan: updatedLoan,

      transaction,
    });
  } catch (error) {
    console.error("Record repayment error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// DELETE LOAN
// DELETE /api/loans/:id
// =====================================================

const deleteLoan = async (req, res) => {
  try {
    const userId = req.user.id;

    // -----------------------------------------------
    // 1. FIND LOAN
    // -----------------------------------------------

    const loan = await Loan.findOne({
      _id: req.params.id,
      userId,
    });

    if (!loan) {
      return res.status(404).json({
        message: "Loan not found",
      });
    }

    // -----------------------------------------------
    // 2. PREVENT DELETE IF REPAYMENT EXISTS
    // -----------------------------------------------

    const hasRepayment = toNumber(loan.repaidAmount) > 0;

    if (hasRepayment) {
      return res.status(400).json({
        message:
          "Cannot delete a loan that has repayments. Reverse the repayments first.",
      });
    }

    // -----------------------------------------------
    // 3. FIND ACCOUNT
    // -----------------------------------------------

    const account = await Account.findOne({
      _id: loan.accountId,
      userId,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const loanAmount = toNumber(loan.amount);

    const currentBalance = toNumber(account.balance);

    // -----------------------------------------------
    // 4. REVERSE ACCOUNT BALANCE
    // -----------------------------------------------

    if (loan.type === "LENT") {
      // Original:
      // Account - loan amount
      //
      // Delete:
      // Account + loan amount

      account.balance = toDecimal128(currentBalance + loanAmount);
    } else {
      // Original:
      // Account + loan amount
      //
      // Delete:
      // Account - loan amount

      if (currentBalance < loanAmount) {
        return res.status(400).json({
          message:
            "Cannot delete this loan because the account does not have enough balance to reverse the borrowed amount.",
        });
      }

      account.balance = toDecimal128(currentBalance - loanAmount);
    }

    // -----------------------------------------------
    // 5. DELETE ALL TRANSACTIONS
    // CONNECTED TO THIS LOAN
    // -----------------------------------------------

    await Transaction.deleteMany({
      userId,
      loanId: loan._id,
    });

    // -----------------------------------------------
    // 6. SAVE ACCOUNT
    // -----------------------------------------------

    await account.save();

    // -----------------------------------------------
    // 7. DELETE LOAN
    // -----------------------------------------------

    await Loan.deleteOne({
      _id: loan._id,
      userId,
    });

    // -----------------------------------------------
    // 8. RESPONSE
    // -----------------------------------------------

    return res.status(200).json({
      message: "Loan deleted successfully",
    });
  } catch (error) {
    console.error("Delete loan error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createLoan,
  getLoans,
  getLoanById,
  recordRepayment,
  deleteLoan,
};
