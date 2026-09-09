const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");
const Category = require("../models/Category");
// GET /api/reports/dashboard
const getDashboard = async (req, res) => {
  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // IMPORTANT:
    // Convert string ID to ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(req.user.id);

    // =========================
    // CURRENT MONTH
    // =========================

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // =========================
    // TOTAL BALANCE
    // =========================

    const balanceResult = await Account.aggregate([
      {
        $match: {
          user: userId,
        },
      },
      {
        $group: {
          _id: null,
          totalBalance: {
            $sum: "$balance",
          },
        },
      },
    ]);

    const totalBalance =
      balanceResult.length > 0
        ? Number(balanceResult[0].totalBalance.toString())
        : 0;

    // =========================
    // TOTAL INCOME + EXPENSE
    // =========================

    const summaryResult = await Transaction.aggregate([
      {
        $match: {
          userId,
          status: { $ne: "CANCELLED" },
          type: {
            $in: ["INCOME", "EXPENSE"],
          },
        },
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpenses = 0;

    summaryResult.forEach((item) => {
      const total = Number(item.total.toString());

      if (item._id === "INCOME") {
        totalIncome = total;
      }

      if (item._id === "EXPENSE") {
        totalExpenses = total;
      }
    });

    const savings = totalIncome - totalExpenses;

    // =========================
    // RECENT TRANSACTIONS
    // =========================

    const recentTransactions = await Transaction.find({
      userId: req.user.id,
      status: { $ne: "CANCELLED" },
    })
      .populate("categoryId", "name type icon color")
      .populate("accountId", "name type")
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(5)
      .lean();

    // =========================
    // TOP SPENDING CATEGORIES
    // =========================

    const categoryResult = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "EXPENSE",
          status: { $ne: "CANCELLED" },
          categoryId: { $ne: null },
        },
      },

      {
        $group: {
          _id: "$categoryId",
          total: {
            $sum: "$amount",
          },
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: "$category",
      },

      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: "$category.name",
          icon: "$category.icon",
          color: "$category.color",
          amount: {
            $toDouble: "$total",
          },
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

    // =========================
    // CURRENT MONTH BUDGETS
    // =========================

    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    const budgets = await Budget.find({
      userId: req.user.id,
      month: currentMonth,
      isActive: true,
    })
      .populate("categoryId", "name icon color")
      .lean();

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,

      data: {
        balance: totalBalance,

        income: totalIncome,

        expense: totalExpenses,

        savings,

        recentTransactions,

        topCategories: categoryResult,

        budgets,
      },
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getSummary = async (req, res) => {
  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // IMPORTANT:
    // Aggregation needs ObjectId, not string
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const { startDate, endDate, month } = req.query;

    // Base query
    const query = {
      userId,
      status: { $ne: "CANCELLED" },
      type: { $in: ["INCOME", "EXPENSE"] },
    };

    // =========================
    // MONTH FILTER
    // =========================
    if (month) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return res.status(400).json({
          success: false,
          message: "Month must be in YYYY-MM format",
        });
      }

      const [year, monthNumber] = month.split("-").map(Number);

      const start = new Date(year, monthNumber - 1, 1);

      const end = new Date(year, monthNumber, 1);

      query.date = {
        $gte: start,
        $lt: end,
      };
    }

    // =========================
    // DATE RANGE FILTER
    // =========================
    else {
      if (startDate) {
        const start = new Date(startDate);

        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate",
          });
        }

        query.date = {
          $gte: start,
        };
      }

      if (endDate) {
        const end = new Date(endDate);

        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate",
          });
        }

        // Include the complete end date
        end.setHours(23, 59, 59, 999);

        query.date = {
          ...query.date,
          $lte: end,
        };
      }
    }

    // =========================
    // AGGREGATION
    // =========================
    const result = await Transaction.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: "$type",
          total: {
            $sum: "$amount",
          },
        },
      },
    ]);

    // =========================
    // CALCULATE TOTALS
    // =========================
    let income = 0;
    let expense = 0;

    result.forEach((item) => {
      const total = Number(item.total.toString());

      if (item._id === "INCOME") {
        income = total;
      }

      if (item._id === "EXPENSE") {
        expense = total;
      }
    });

    // Savings = Income - Expense
    const savings = income - expense;

    // =========================
    // RESPONSE
    // =========================
    return res.status(200).json({
      success: true,
      data: {
        income,
        expense,
        savings,
      },
    });
  } catch (error) {
    console.error("Get summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getCategoryReport = async (req, res) => {
  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // IMPORTANT:
    // Convert string ID to ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const { startDate, endDate, month } = req.query;

    // =========================
    // BASE QUERY
    // =========================

    const query = {
      userId,
      type: "EXPENSE",
      status: { $ne: "CANCELLED" },
      categoryId: { $ne: null },
    };

    // =========================
    // MONTH FILTER
    // =========================

    if (month) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return res.status(400).json({
          success: false,
          message: "Month must be in YYYY-MM format",
        });
      }

      const [year, monthNumber] = month.split("-").map(Number);

      const start = new Date(year, monthNumber - 1, 1);

      const end = new Date(year, monthNumber, 1);

      query.date = {
        $gte: start,
        $lt: end,
      };
    }

    // =========================
    // DATE RANGE FILTER
    // =========================
    else {
      if (startDate) {
        const start = new Date(startDate);

        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate",
          });
        }

        query.date = {
          $gte: start,
        };
      }

      if (endDate) {
        const end = new Date(endDate);

        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate",
          });
        }

        // Include complete end date
        end.setHours(23, 59, 59, 999);

        query.date = {
          ...query.date,
          $lte: end,
        };
      }
    }

    console.log("CATEGORY REPORT QUERY:", query);

    // =========================
    // AGGREGATION
    // =========================

    const result = await Transaction.aggregate([
      {
        $match: query,
      },

      {
        $group: {
          _id: "$categoryId",
          total: {
            $sum: "$amount",
          },
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },

      {
        $unwind: "$category",
      },

      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          category: "$category.name",
          icon: "$category.icon",
          color: "$category.color",
          amount: {
            $toDouble: "$total",
          },
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },
    ]);

    console.log("CATEGORY REPORT RESULT:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get category report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMonthlyReport = async (req, res) => {
  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // IMPORTANT:
    // Convert string ID to ObjectId for aggregation
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const { startDate, endDate } = req.query;

    // =========================
    // BASE QUERY
    // =========================

    const query = {
      userId,
      status: { $ne: "CANCELLED" },
      type: {
        $in: ["INCOME", "EXPENSE"],
      },
    };

    // =========================
    // START DATE
    // =========================

    if (startDate) {
      const start = new Date(startDate);

      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate",
        });
      }

      query.date = {
        $gte: start,
      };
    }

    // =========================
    // END DATE
    // =========================

    if (endDate) {
      const end = new Date(endDate);

      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate",
        });
      }

      // Include complete end date
      end.setHours(23, 59, 59, 999);

      query.date = {
        ...query.date,
        $lte: end,
      };
    }

    console.log("MONTHLY REPORT QUERY:", query);

    // =========================
    // AGGREGATION
    // =========================

    const result = await Transaction.aggregate([
      {
        $match: query,
      },

      {
        $group: {
          _id: {
            year: {
              $year: "$date",
            },
            month: {
              $month: "$date",
            },
          },

          income: {
            $sum: {
              $cond: [
                {
                  $eq: ["$type", "INCOME"],
                },
                "$amount",
                0,
              ],
            },
          },

          expense: {
            $sum: {
              $cond: [
                {
                  $eq: ["$type", "EXPENSE"],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },

      // Sort chronologically
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    console.log("MONTHLY REPORT RESULT:", result);

    // =========================
    // FORMAT RESPONSE
    // =========================

    const data = result.map((item) => {
      const year = item._id.year;
      const month = String(item._id.month).padStart(2, "0");

      const income = Number(item.income.toString());
      const expense = Number(item.expense.toString());

      return {
        month: `${year}-${month}`,
        income,
        expense,
        savings: income - expense,
      };
    });

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get monthly report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAccountReport = async (req, res) => {
  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // IMPORTANT:
    // Aggregation requires ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const { startDate, endDate, month } = req.query;

    // =========================
    // BASE QUERY
    // =========================

    const query = {
      userId,
      status: { $ne: "CANCELLED" },
      type: {
        $in: ["INCOME", "EXPENSE"],
      },
      accountId: {
        $ne: null,
      },
    };

    // =========================
    // MONTH FILTER
    // =========================

    if (month) {
      if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
        return res.status(400).json({
          success: false,
          message: "Month must be in YYYY-MM format",
        });
      }

      const [year, monthNumber] = month.split("-").map(Number);

      const start = new Date(year, monthNumber - 1, 1);

      const end = new Date(year, monthNumber, 1);

      query.date = {
        $gte: start,
        $lt: end,
      };
    }

    // =========================
    // DATE RANGE FILTER
    // =========================
    else {
      if (startDate) {
        const start = new Date(startDate);

        if (isNaN(start.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid startDate",
          });
        }

        query.date = {
          $gte: start,
        };
      }

      if (endDate) {
        const end = new Date(endDate);

        if (isNaN(end.getTime())) {
          return res.status(400).json({
            success: false,
            message: "Invalid endDate",
          });
        }

        // Include complete end date
        end.setHours(23, 59, 59, 999);

        query.date = {
          ...query.date,
          $lte: end,
        };
      }
    }

    console.log("ACCOUNT REPORT QUERY:", query);

    // =========================
    // AGGREGATION
    // =========================

    const result = await Transaction.aggregate([
      {
        $match: query,
      },

      // Group transactions by account
      {
        $group: {
          _id: "$accountId",

          income: {
            $sum: {
              $cond: [
                {
                  $eq: ["$type", "INCOME"],
                },
                "$amount",
                0,
              ],
            },
          },

          expense: {
            $sum: {
              $cond: [
                {
                  $eq: ["$type", "EXPENSE"],
                },
                "$amount",
                0,
              ],
            },
          },
        },
      },

      // Get account information
      {
        $lookup: {
          from: "accounts",
          localField: "_id",
          foreignField: "_id",
          as: "account",
        },
      },

      {
        $unwind: "$account",
      },

      // Return required fields
      {
        $project: {
          _id: 0,

          accountId: "$_id",

          account: "$account.name",

          type: "$account.type",

          income: {
            $toDouble: "$income",
          },

          expense: {
            $toDouble: "$expense",
          },

          net: {
            $subtract: [
              {
                $toDouble: "$income",
              },
              {
                $toDouble: "$expense",
              },
            ],
          },
        },
      },

      // Highest activity first
      {
        $sort: {
          expense: -1,
        },
      },
    ]);

    console.log("ACCOUNT REPORT RESULT:", result);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Get account report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
const getTrendsReport = async (req, res) => {
  try {
    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // IMPORTANT:
    // Aggregation requires ObjectId
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const { period = "monthly", startDate, endDate } = req.query;

    // =========================
    // VALIDATE PERIOD
    // =========================

    const allowedPeriods = ["daily", "weekly", "monthly"];

    if (!allowedPeriods.includes(period.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: "Period must be daily, weekly, or monthly",
      });
    }

    const selectedPeriod = period.toLowerCase();

    // =========================
    // BASE QUERY
    // =========================

    const query = {
      userId,
      type: "EXPENSE",
      status: { $ne: "CANCELLED" },
    };

    // =========================
    // START DATE
    // =========================

    if (startDate) {
      const start = new Date(startDate);

      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid startDate",
        });
      }

      query.date = {
        $gte: start,
      };
    }

    // =========================
    // END DATE
    // =========================

    if (endDate) {
      const end = new Date(endDate);

      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid endDate",
        });
      }

      // Include complete end date
      end.setHours(23, 59, 59, 999);

      query.date = {
        ...query.date,
        $lte: end,
      };
    }

    console.log("TRENDS REPORT QUERY:", query);

    // =========================
    // GROUPING
    // =========================

    let groupId;

    if (selectedPeriod === "daily") {
      groupId = {
        year: { $year: "$date" },
        month: { $month: "$date" },
        day: { $dayOfMonth: "$date" },
      };
    }

    if (selectedPeriod === "weekly") {
      groupId = {
        year: { $isoWeekYear: "$date" },
        week: { $isoWeek: "$date" },
      };
    }

    if (selectedPeriod === "monthly") {
      groupId = {
        year: { $year: "$date" },
        month: { $month: "$date" },
      };
    }

    // =========================
    // AGGREGATION
    // =========================

    const result = await Transaction.aggregate([
      {
        $match: query,
      },

      {
        $group: {
          _id: groupId,

          expense: {
            $sum: "$amount",
          },
        },
      },

      // Sort chronologically
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
          "_id.day": 1,
          "_id.week": 1,
        },
      },
    ]);

    console.log("TRENDS REPORT RESULT:", result);

    // =========================
    // FORMAT RESPONSE
    // =========================

    const data = result.map((item) => {
      const year = item._id.year;
      const expense = Number(item.expense.toString());

      // DAILY
      if (selectedPeriod === "daily") {
        const month = String(item._id.month).padStart(2, "0");

        const day = String(item._id.day).padStart(2, "0");

        return {
          date: `${year}-${month}-${day}`,
          expense,
        };
      }

      // WEEKLY
      if (selectedPeriod === "weekly") {
        return {
          year,
          week: item._id.week,
          expense,
        };
      }

      // MONTHLY
      const month = String(item._id.month).padStart(2, "0");

      return {
        month: `${year}-${month}`,
        expense,
      };
    });

    // =========================
    // RESPONSE
    // =========================

    return res.status(200).json({
      success: true,
      period: selectedPeriod,
      data,
    });
  } catch (error) {
    console.error("Get trends report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = {
  getDashboard,
  getSummary,
  getCategoryReport,
  getMonthlyReport,
  getAccountReport,
  getTrendsReport,
};
