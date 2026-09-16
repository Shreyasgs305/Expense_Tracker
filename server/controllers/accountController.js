const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

// =====================================================
// GET ALL ACCOUNTS
// =====================================================

const getAccounts = async (req, res) => {
  try {
    const userId = req.user.id;

    const accounts = await Account.find({
      userId: userId,
    });

    return res.status(200).json({
      accounts,
    });
  } catch (error) {
    console.error("Get accounts error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// GET ACCOUNT BY ID
// =====================================================

const getAccountById = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const account = await Account.findOne({
      _id: accountId,
      userId: userId,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    return res.status(200).json({
      account,
    });
  } catch (error) {
    console.error("Get account error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// CREATE ACCOUNT
// =====================================================

const createAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      name,
      type,
      balance = 0,
      creditLimit,
      currency = "INR",
      institutionName,
      icon,
      color,
    } = req.body;

    // -----------------------------------------------
    // Validate name and type
    // -----------------------------------------------

    if (!name || !type) {
      return res.status(400).json({
        message: "Name and type are required",
      });
    }

    // -----------------------------------------------
    // Validate account type
    // -----------------------------------------------

    const allowedTypes = ["BANK", "CASH", "CREDIT_CARD", "WALLET"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Invalid account type",
      });
    }

    // -----------------------------------------------
    // Validate normal account balance
    // -----------------------------------------------

    if (typeof balance !== "number" || !Number.isFinite(balance)) {
      return res.status(400).json({
        message: "Balance must be a valid number",
      });
    }

    // -----------------------------------------------
    // CREDIT CARD VALIDATION
    // -----------------------------------------------

    if (type === "CREDIT_CARD") {
      if (
        creditLimit === undefined ||
        creditLimit === null ||
        creditLimit === ""
      ) {
        return res.status(400).json({
          message: "Credit limit is required for credit card",
        });
      }

      if (typeof creditLimit !== "number" || !Number.isFinite(creditLimit)) {
        return res.status(400).json({
          message: "Credit limit must be a valid number",
        });
      }

      if (creditLimit <= 0) {
        return res.status(400).json({
          message: "Credit limit must be greater than 0",
        });
      }
    }

    // -----------------------------------------------
    // CREATE ACCOUNT
    // -----------------------------------------------

    const account = await Account.create({
      userId: userId,

      name: name.trim(),

      type: type,

      // Credit card starts with 0 outstanding
      balance: type === "CREDIT_CARD" ? 0 : balance,

      // Credit limit only for credit cards
      creditLimit: type === "CREDIT_CARD" ? creditLimit : null,

      currency: currency,

      institutionName: institutionName?.trim() || null,

      icon: icon || null,

      color: color || null,
    });

    return res.status(201).json({
      message: "Account created successfully",
      account,
    });
  } catch (error) {
    console.error("Create account error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// UPDATE ACCOUNT
// =====================================================

const updateAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const { name, type, creditLimit } = req.body;

    const updates = {};

    // -----------------------------------------------
    // Name
    // -----------------------------------------------

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      updates.name = name.trim();
    }

    // -----------------------------------------------
    // Type
    // -----------------------------------------------

    if (type !== undefined) {
      const allowedTypes = ["BANK", "CASH", "CREDIT_CARD", "WALLET"];

      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          message: "Invalid account type",
        });
      }

      updates.type = type;
    }

    // -----------------------------------------------
    // Credit Limit
    // -----------------------------------------------

    if (creditLimit !== undefined) {
      if (typeof creditLimit !== "number" || !Number.isFinite(creditLimit)) {
        return res.status(400).json({
          message: "Credit limit must be a valid number",
        });
      }

      if (creditLimit <= 0) {
        return res.status(400).json({
          message: "Credit limit must be greater than 0",
        });
      }

      updates.creditLimit = creditLimit;
    }

    // -----------------------------------------------
    // At least one field
    // -----------------------------------------------

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    // -----------------------------------------------
    // Update account
    // -----------------------------------------------

    const account = await Account.findOneAndUpdate(
      {
        _id: accountId,
        userId: userId,
      },
      {
        $set: updates,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    return res.status(200).json({
      message: "Account updated successfully",
      account,
    });
  } catch (error) {
    console.error("Update account error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// DELETE ACCOUNT
// =====================================================

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const account = await Account.findOne({
      _id: accountId,
      userId: userId,
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Check transactions
    const transactionCount = await Transaction.countDocuments({
      accountId: accountId,
      userId: userId,
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        message: "Cannot delete account because transactions exist",
      });
    }

    await Account.findByIdAndDelete(accountId);

    return res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// UPDATE ACCOUNT BALANCE
// =====================================================

const updateAccountBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const accountId = req.params.id;

    const { balance } = req.body;

    if (balance === undefined || balance === null) {
      return res.status(400).json({
        message: "Balance is required",
      });
    }

    if (typeof balance !== "number" || !Number.isFinite(balance)) {
      return res.status(400).json({
        message: "Balance must be a valid number",
      });
    }

    const account = await Account.findOneAndUpdate(
      {
        _id: accountId,
        userId: userId,
      },
      {
        $set: {
          balance: balance,
        },
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    return res.status(200).json({
      message: "Account balance updated successfully",
      account,
    });
  } catch (error) {
    console.error("Update account balance error:", error);

    return res.status(500).json({
      message: "Server error",
    });
  }
};

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  updateAccountBalance,
};
