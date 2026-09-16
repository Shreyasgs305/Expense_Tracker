const mongoose = require("mongoose");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const Budget = require("../models/Budget");

// ==========================================
// HELPER: VALIDATE USER
// ==========================================

const getUserId = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
    res.status(401).json({
      success: false,
      message: "Invalid user ID",
    });

    return null;
  }

  return new mongoose.Types.ObjectId(req.user.id);
};

// ==========================================
// HELPER: GET DATE RANGE
// ==========================================

const getDateRange = (query) => {
  const now = new Date();

  const year = Number(query.year) || now.getFullYear();

  const month =
    query.month !== undefined ? Number(query.month) : now.getMonth() + 1;

  const startDate = new Date(year, month - 1, 1);

  const endDate = new Date(year, month, 1);

  return {
    startDate,
    endDate,
    year,
    month,
  };
};

// ==========================================
// GET /api/reports/dashboard
// ==========================================

const getDashboard = async (req, res) => {
  try {
    const userId = getUserId(req, res);

    if (!userId) return;

    const now = new Date();

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // =========================
    // TOTAL BALANCE
    // =========================

    const balanceResult = await Account.aggregate([
      {
        $match: {
          userId,
          isActive: true,
          type: {
            $in: ["BANK", "CASH", "WALLET"],
          },
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
    // AVAILABLE CREDIT
    // =========================

    const creditResult = await Account.aggregate([
      {
        $match: {
          userId,
          isActive: true,
          type: "CREDIT_CARD",
        },
      },
      {
        $project: {
          creditLimit: {
            $toDouble: {
              $ifNull: ["$creditLimit", 0],
            },
          },

          outstanding: {
            $abs: {
              $toDouble: {
                $ifNull: ["$balance", 0],
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,

          creditAvailable: {
            $sum: {
              $max: [
                {
                  $subtract: ["$creditLimit", "$outstanding"],
                },
                0,
              ],
            },
          },
        },
      },
    ]);

    const creditAvailable =
      creditResult.length > 0 ? Number(creditResult[0].creditAvailable) : 0;

    // =========================
    // INCOME + EXPENSE
    // =========================

    const summaryResult = await Transaction.aggregate([
      {
        $match: {
          userId,
          status: {
            $ne: "CANCELLED",
          },
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
      userId,

      status: {
        $ne: "CANCELLED",
      },
    })
      .populate("categoryId", "name type icon color")
      .populate("accountId", "name type")
      .populate("fromAccountId", "name type")
      .sort({
        date: -1,
        createdAt: -1,
      })
      .limit(5)
      .lean();

    // =========================
    // TOP CATEGORIES
    // =========================

    const categoryResult = await Transaction.aggregate([
      {
        $match: {
          userId,
          type: "EXPENSE",
          status: {
            $ne: "CANCELLED",
          },
          categoryId: {
            $ne: null,
          },
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
    // CURRENT MONTH BUDGET
    // =========================

    const currentMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}`;

    const budgets = await Budget.find({
      userId,

      month: currentMonth,

      isActive: true,
    })
      .populate("categoryId", "name icon color")
      .lean();

    const budgetSpending = await Transaction.aggregate([
      {
        $match: {
          userId,

          type: "EXPENSE",

          status: {
            $ne: "CANCELLED",
          },

          date: {
            $gte: startOfMonth,
            $lt: startOfNextMonth,
          },

          categoryId: {
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: "$categoryId",

          spent: {
            $sum: "$amount",
          },
        },
      },
      {
        $project: {
          _id: 0,

          categoryId: "$_id",

          spent: {
            $toDouble: "$spent",
          },
        },
      },
    ]);

    const budgetsWithSpent = budgets.map((budget) => {
      const spending = budgetSpending.find(
        (item) =>
          item.categoryId?.toString() === budget.categoryId?._id?.toString(),
      );

      return {
        ...budget,

        spent: spending ? spending.spent : 0,
      };
    });

    return res.status(200).json({
      success: true,

      data: {
        balance: totalBalance,

        income: totalIncome,

        expense: totalExpenses,

        savings,

        creditAvailable,

        recentTransactions,

        topCategories: categoryResult,

        budgets: budgetsWithSpent,
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

// ==========================================
// GET /api/reports/summary
// ==========================================

const getSummary = async (req, res) => {
  try {
    const userId = getUserId(req, res);

    if (!userId) return;

    const { startDate, endDate, year, month } = getDateRange(req.query);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId,

          date: {
            $gte: startDate,
            $lt: endDate,
          },

          status: {
            $ne: "CANCELLED",
          },

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

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    let income = 0;
    let expense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    result.forEach((item) => {
      const total = Number(item.total.toString());

      if (item._id === "INCOME") {
        income = total;
        incomeCount = item.count;
      }

      if (item._id === "EXPENSE") {
        expense = total;
        expenseCount = item.count;
      }
    });

    return res.status(200).json({
      success: true,

      data: {
        year,
        month,

        income,

        expense,

        savings: income - expense,

        incomeCount,

        expenseCount,

        transactionCount: incomeCount + expenseCount,
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

// ==========================================
// GET /api/reports/category
// ==========================================

const getCategory = async (req, res) => {
  try {
    const userId = getUserId(req, res);

    if (!userId) return;

    const { startDate, endDate, year, month } = getDateRange(req.query);

    const categories = await Transaction.aggregate([
      {
        $match: {
          userId,

          type: "EXPENSE",

          status: {
            $ne: "CANCELLED",
          },

          date: {
            $gte: startDate,
            $lt: endDate,
          },

          categoryId: {
            $ne: null,
          },
        },
      },

      {
        $group: {
          _id: "$categoryId",

          amount: {
            $sum: "$amount",
          },

          count: {
            $sum: 1,
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
            $toDouble: "$amount",
          },

          count: 1,
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },
    ]);

    const totalExpense = categories.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    const data = categories.map((item) => ({
      ...item,

      percentage:
        totalExpense > 0
          ? Number(((item.amount / totalExpense) * 100).toFixed(2))
          : 0,
    }));

    return res.status(200).json({
      success: true,

      data: {
        year,
        month,

        totalExpense,

        categories: data,
      },
    });
  } catch (error) {
    console.error("Get category report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// GET /api/reports/monthly
// ==========================================

const getMonthly = async (req, res) => {
  try {
    const userId = getUserId(req, res);

    if (!userId) return;

    const year = Number(req.query.year) || new Date().getFullYear();

    const startDate = new Date(year, 0, 1);

    const endDate = new Date(year + 1, 0, 1);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId,

          date: {
            $gte: startDate,
            $lt: endDate,
          },

          status: {
            $ne: "CANCELLED",
          },

          type: {
            $in: ["INCOME", "EXPENSE"],
          },
        },
      },

      {
        $group: {
          _id: {
            month: {
              $month: "$date",
            },

            type: "$type",
          },

          total: {
            $sum: "$amount",
          },
        },
      },

      {
        $project: {
          _id: 0,

          month: "$_id.month",

          type: "$_id.type",

          amount: {
            $toDouble: "$total",
          },
        },
      },

      {
        $sort: {
          month: 1,
        },
      },
    ]);

    const monthlyData = Array.from({ length: 12 }, (_, index) => ({
      month: index + 1,

      monthName: new Date(year, index, 1).toLocaleString("en-US", {
        month: "short",
      }),

      income: 0,

      expense: 0,

      savings: 0,
    }));

    result.forEach((item) => {
      const month = monthlyData[item.month - 1];

      if (!month) return;

      if (item.type === "INCOME") {
        month.income = item.amount;
      }

      if (item.type === "EXPENSE") {
        month.expense = item.amount;
      }
    });

    monthlyData.forEach((item) => {
      item.savings = item.income - item.expense;
    });

    return res.status(200).json({
      success: true,

      data: {
        year,

        monthly: monthlyData,
      },
    });
  } catch (error) {
    console.error("Get monthly report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// GET /api/reports/account
// ==========================================

const getAccount = async (req, res) => {
  try {
    const userId = getUserId(req, res);

    if (!userId) return;

    const { startDate, endDate, year, month } = getDateRange(req.query);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId,

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
          _id: "$accountId",

          amount: {
            $sum: "$amount",
          },

          count: {
            $sum: 1,
          },
        },
      },

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

      {
        $project: {
          _id: 0,

          accountId: "$_id",

          name: "$account.name",

          type: "$account.type",

          amount: {
            $toDouble: "$amount",
          },

          count: 1,
        },
      },

      {
        $sort: {
          amount: -1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      data: {
        year,
        month,

        accounts: result,
      },
    });
  } catch (error) {
    console.error("Get account report error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ==========================================
// GET /api/reports/trends
// ==========================================

const getTrends = async (req, res) => {
  try {
    const userId = getUserId(req, res);

    if (!userId) return;

    const months = Math.min(Math.max(Number(req.query.months) || 6, 1), 24);

    const now = new Date();

    const startDate = new Date(
      now.getFullYear(),
      now.getMonth() - months + 1,
      1,
    );

    const result = await Transaction.aggregate([
      {
        $match: {
          userId,

          date: {
            $gte: startDate,
          },

          status: {
            $ne: "CANCELLED",
          },

          type: {
            $in: ["INCOME", "EXPENSE"],
          },
        },
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

            type: "$type",
          },

          total: {
            $sum: "$amount",
          },
        },
      },

      {
        $project: {
          _id: 0,

          year: "$_id.year",

          month: "$_id.month",

          type: "$_id.type",

          amount: {
            $toDouble: "$total",
          },
        },
      },

      {
        $sort: {
          year: 1,
          month: 1,
        },
      },
    ]);

    const trendMap = {};

    result.forEach((item) => {
      const key = `${item.year}-${item.month}`;

      if (!trendMap[key]) {
        trendMap[key] = {
          year: item.year,

          month: item.month,

          income: 0,

          expense: 0,

          savings: 0,
        };
      }

      if (item.type === "INCOME") {
        trendMap[key].income = item.amount;
      }

      if (item.type === "EXPENSE") {
        trendMap[key].expense = item.amount;
      }
    });

    const trends = Object.values(trendMap);

    trends.forEach((item) => {
      item.savings = item.income - item.expense;

      item.monthName = new Date(item.year, item.month - 1, 1).toLocaleString(
        "en-US",
        {
          month: "short",
        },
      );
    });

    return res.status(200).json({
      success: true,

      data: {
        months,

        trends,
      },
    });
  } catch (error) {
    console.error("Get trends report error:", error);

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
  getDashboard,
  getSummary,
  getCategory,
  getMonthly,
  getAccount,
  getTrends,
};
