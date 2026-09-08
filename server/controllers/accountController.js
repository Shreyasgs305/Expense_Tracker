const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

const getAccounts = async (req, res) => {
  try {
    // Get logged-in user's ID
    const userId = req.user.id;

    // Find only accounts belonging to this user
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

const getAccountById = async (req, res) => {
  try {
    // Logged-in user's ID
    const userId = req.user.id;

    // Account ID from URL
    const accountId = req.params.id;

    // Find account AND check ownership
    const account = await Account.findOne({
      _id: accountId,
      userId: userId,
    });

    // Account not found or doesn't belong to user
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Return account
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

const createAccount = async (req, res) => {
  try {
    // Get logged-in user's ID
    const userId = req.user.id;

    // Get account data from request body
    const { name, type, balance = 0 } = req.body;

    // Validate required fields
    if (!name || !type) {
      return res.status(400).json({
        message: "Name and type are required",
      });
    }

    // Validate balance
    if (typeof balance !== "number") {
      return res.status(400).json({
        message: "Balance must be a number",
      });
    }

    // Create account
    const account = await Account.create({
      name: name.trim(),
      type,
      balance,
      userId: userId,
    });

    // Return created account
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
const updateAccount = async (req, res) => {
  try {
    // Get logged-in user's ID
    const userId = req.user.id;

    // Get account ID from URL
    const accountId = req.params.id;

    // Get only allowed fields
    const { name, type } = req.body;

    // Create update object
    const updates = {};

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          message: "Name cannot be empty",
        });
      }

      updates.name = name.trim();
    }

    if (type !== undefined) {
      updates.type = type;
    }

    // Make sure at least one field is provided
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    // Find account belonging to logged-in user
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

    // Account not found
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Return updated account
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

const deleteAccount = async (req, res) => {
  try {
    // Get logged-in user's ID
    const userId = req.user.id;

    // Get account ID from URL
    const accountId = req.params.id;

    // Find account belonging to logged-in user
    const account = await Account.findOne({
      _id: accountId,
      userId: userId,
    });

    // Account not found
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Check whether transactions exist
    const transactionCount = await Transaction.countDocuments({
      account: accountId,
      userId: userId,
    });

    // Don't allow deletion if transactions exist
    if (transactionCount > 0) {
      return res.status(400).json({
        message: "Cannot delete account because transactions exist",
      });
    }

    // Delete account
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

const updateAccountBalance = async (req, res) => {
  try {
    // Get logged-in user's ID
    const userId = req.user.id;

    // Get account ID from URL
    const accountId = req.params.id;

    // Get balance from request body
    const { balance } = req.body;

    // Validate balance
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

    // Find account belonging to logged-in user
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

    // Account not found
    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    // Return updated account
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

module.exports = {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  updateAccountBalance,
};
