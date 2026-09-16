import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PageLayout from "../components/layout/PageLayout";
import { getDashboard } from "../api/dashboardApi";
import axiosInstance from "../api/axios";

const DONUT_COLORS = [
  "#5B21B6",
  "#2563EB",
  "#F97316",
  "#10B981",
  "#FBBF24",
  "#F472B6",
  "#94A3B8",
];

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    income: 0,
    expense: 0,
    savings: 0,
    recentTransactions: [],
    topCategories: [],
    budgets: [],
  });

  const [accounts, setAccounts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // NUMBER HELPER
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

    return Number(value) || 0;
  };

  // =====================================================
  // MONEY FORMAT
  // =====================================================

  const formatMoney = (value) => {
    return `₹${toNumber(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboard();

      console.log("Dashboard API Response:", response);

      setDashboardData(
        response?.data || {
          balance: 0,
          income: 0,
          expense: 0,
          savings: 0,
          recentTransactions: [],
          topCategories: [],
          budgets: [],
        },
      );
    } catch (error) {
      console.error("Dashboard error:", error);

      setError(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ACCOUNTS
  // =====================================================

  const loadAccounts = async () => {
    try {
      const response = await axiosInstance.get("/accounts");

      console.log("Accounts API Response:", response);

      /*
        Handle possible backend response formats:

        1. { success: true, data: [...] }

        2. { data: [...] }

        3. [...]

        4. { success: true, data: { data: [...] } }

        5. { success: true, accounts: [...] }
      */

      const responseData = response?.data;

      let accountList = [];

      if (Array.isArray(responseData)) {
        accountList = responseData;
      } else if (Array.isArray(responseData?.data)) {
        accountList = responseData.data;
      } else if (Array.isArray(responseData?.accounts)) {
        accountList = responseData.accounts;
      } else if (Array.isArray(responseData?.data?.data)) {
        accountList = responseData.data.data;
      } else if (Array.isArray(responseData?.data?.accounts)) {
        accountList = responseData.data.accounts;
      }

      console.log("Final Accounts:", accountList);

      setAccounts(accountList);
    } catch (error) {
      console.error("Accounts API error:", error);

      // Don't break Dashboard if accounts API fails
      setAccounts([]);
    }
  };

  // =====================================================
  // LOAD EVERYTHING
  // =====================================================

  useEffect(() => {
    loadDashboard();
    loadAccounts();
  }, []);

  // =====================================================
  // CREDIT CARD
  // =====================================================

  const creditAccounts = accounts.filter(
    (account) => account.type === "CREDIT_CARD",
  );

  // Credit Available = Credit Limit - Outstanding Amount
  // Credit cards are loans, so they are not included in Total Balance.
  const creditAvailable = creditAccounts.reduce((total, account) => {
    const creditLimit = toNumber(account.creditLimit);
    const outstanding = Math.abs(toNumber(account.balance));

    return total + Math.max(creditLimit - outstanding, 0);
  }, 0);

  // =====================================================
  // CATEGORY DATA
  // =====================================================

  const categories = dashboardData.topCategories || [];

  const totalCategoryExpense = categories.reduce((total, category) => {
    return total + toNumber(category.amount);
  }, 0);

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <PageLayout title="Dashboard">
        <div className="flex min-h-[500px] items-center justify-center bg-[#f8f9fd]">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />

            <p className="text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <PageLayout title="Dashboard">
      <div className="min-h-screen bg-[#f8f9fd] pb-6">
        {/* =================================================
            IMPORTANT:
            NO SECOND HEADER HERE.

            PageLayout already provides:
            - menu
            - Dashboard title
            - month selector
            - Add Expense
            - notification
            - profile
        ================================================= */}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-5 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>

            <button
              onClick={loadDashboard}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <SummaryCard
            title="Total Balance"
            value={formatMoney(dashboardData.balance)}
            subtitle="Across all accounts"
            icon="wallet"
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />

          <SummaryCard
            title="Monthly Expenses"
            value={formatMoney(dashboardData.expense)}
            subtitle="This month"
            icon="expense"
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />

          <SummaryCard
            title="Monthly Income"
            value={formatMoney(dashboardData.income)}
            subtitle="This month"
            icon="income"
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />

          <SummaryCard
            title="Credit Available"
            value={formatMoney(creditAvailable)}
            subtitle={
              creditAccounts.length > 0
                ? "Remaining credit across cards"
                : "No credit cards"
            }
            icon="card"
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />

          <SummaryCard
            title="Transactions"
            value={dashboardData.recentTransactions?.length || 0}
            subtitle="Recent transactions"
            icon="transaction"
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
        </div>

        {/* =================================================
            ACCOUNTS + EXPENSE CATEGORY
        ================================================= */}

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* =================================================
              ACCOUNTS OVERVIEW
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Accounts Overview
              </h2>

              <Link
                to="/accounts"
                className="text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                View All
              </Link>
            </div>

            <div className="px-5">
              {accounts.length > 0 ? (
                accounts.slice(0, 5).map((account) => {
                  const balance = toNumber(account.balance);

                  const isCredit = account.type === "CREDIT_CARD";

                  return (
                    <div
                      key={account._id}
                      className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0"
                    >
                      {/* Account left */}
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                            isCredit
                              ? "bg-orange-50 text-orange-500"
                              : "bg-violet-50 text-violet-600"
                          }`}
                        >
                          {isCredit ? "▣" : "▰"}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {account.name}
                          </p>

                          <p className="mt-0.5 text-xs text-gray-500">
                            {getAccountType(account.type)}
                          </p>
                        </div>
                      </div>

                      {/* Account right */}
                      <div className="ml-3 text-right">
                        <p className="text-sm font-bold text-gray-900">
                          {formatMoney(Math.abs(balance))}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-500">
                          {isCredit ? "Outstanding" : "Available Balance"}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex min-h-[270px] items-center justify-center">
                  <div className="text-center">
                    <div className="mb-3 text-4xl">💳</div>

                    <p className="text-sm font-semibold text-gray-800">
                      No accounts found
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Add your bank account, cash or wallet.
                    </p>

                    <Link
                      to="/accounts"
                      className="mt-4 inline-flex rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                    >
                      Add Account
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {accounts.length > 0 && (
              <div className="mx-5 mb-4 rounded-xl border border-violet-100 bg-violet-50/60 px-4 py-3">
                <p className="text-xs font-medium text-gray-700">
                  Account balance shows the available amount for spending.
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Credit cards show the amount currently used.
                </p>
              </div>
            )}
          </div>

          {/* =================================================
              EXPENSES BY CATEGORY
          ================================================= */}

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Expenses by Category (This Month)
              </h2>

              <Link
                to="/reports"
                className="text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                View Report
              </Link>
            </div>

            <div className="flex min-h-[300px] flex-col items-center justify-center gap-6 p-5 md:flex-row">
              {/* DONUT */}

              <div className="relative h-52 w-52 shrink-0">
                {categories.length > 0 ? (
                  <>
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: createDonutGradient(
                          categories,
                          totalCategoryExpense,
                        ),
                      }}
                    />

                    <div className="absolute inset-[30%] flex flex-col items-center justify-center rounded-full bg-white">
                      <p className="text-xs text-gray-500">Total Expenses</p>

                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {formatMoney(totalCategoryExpense)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border-[35px] border-gray-100">
                    <span className="text-xs text-gray-400">No data</span>
                  </div>
                )}
              </div>

              {/* CATEGORY LIST */}

              <div className="w-full max-w-sm space-y-3">
                {categories.slice(0, 7).map((category, index) => {
                  const amount = toNumber(category.amount);

                  const percentage =
                    totalCategoryExpense > 0
                      ? ((amount / totalCategoryExpense) * 100).toFixed(1)
                      : "0.0";

                  const color =
                    category.color || DONUT_COLORS[index % DONUT_COLORS.length];

                  return (
                    <div
                      key={category.categoryId || category._id || index}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{
                            backgroundColor: color,
                          }}
                        />

                        <span className="truncate text-sm text-gray-700">
                          {category.name || "Unknown"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium text-gray-800">
                          {formatMoney(amount)}
                        </span>

                        <span className="w-10 text-right text-xs text-gray-500">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {categories.length === 0 && (
                  <p className="text-center text-sm text-gray-500">
                    No expense categories yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            TRANSACTIONS + BUDGETS
        ================================================= */}

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* =================================================
              RECENT TRANSACTIONS
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Recent Transactions
              </h2>

              <Link
                to="/expenses"
                className="text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                View All
              </Link>
            </div>

            {dashboardData.recentTransactions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                        Date
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                        Description
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                        Category
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                        Paid From
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                        Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboardData.recentTransactions
                      .slice(0, 5)
                      .map((transaction) => {
                        const amount = toNumber(transaction.amount);

                        const isIncome = transaction.type === "INCOME";

                        return (
                          <tr
                            key={transaction._id}
                            className="border-b border-gray-50 last:border-0"
                          >
                            <td className="whitespace-nowrap px-5 py-3.5 text-xs text-gray-600">
                              {transaction.date
                                ? new Date(transaction.date).toLocaleDateString(
                                    "en-IN",
                                    {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    },
                                  )
                                : "-"}
                            </td>

                            <td className="max-w-[160px] px-3 py-3.5">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                    isIncome
                                      ? "bg-green-50 text-green-600"
                                      : "bg-red-50 text-red-500"
                                  }`}
                                >
                                  {isIncome ? "↗" : "↘"}
                                </span>

                                <span className="truncate text-xs font-medium text-gray-800">
                                  {transaction.description || "Transaction"}
                                </span>
                              </div>
                            </td>

                            <td className="px-3 py-3.5 text-xs text-gray-600">
                              {transaction.categoryId?.name || "Other"}
                            </td>

                            <td className="px-3 py-3.5 text-xs text-gray-600">
                              {transaction.accountId?.name || "-"}
                            </td>

                            <td
                              className={`whitespace-nowrap px-5 py-3.5 text-right text-xs font-bold ${
                                isIncome ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isIncome ? "+" : "-"}
                              {formatMoney(amount)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-[270px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 text-4xl">💸</div>

                  <p className="text-sm font-medium text-gray-700">
                    No transactions yet
                  </p>

                  <Link
                    to="/expenses/add"
                    className="mt-4 inline-flex rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add Expense
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              BUDGET OVERVIEW
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-base font-bold text-gray-900">
                Budget Overview (This Month)
              </h2>

              <Link
                to="/budgets"
                className="text-sm font-semibold text-violet-600 hover:text-violet-700"
              >
                View All
              </Link>
            </div>

            {dashboardData.budgets?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="px-5 py-3 text-left text-xs font-medium text-gray-500">
                        Category
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                        Budget
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                        Spent
                      </th>

                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500">
                        Remaining
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-medium text-gray-500">
                        Progress
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dashboardData.budgets.slice(0, 5).map((budget) => {
                      const budgetAmount = toNumber(budget.amount);

                      const spent = toNumber(
                        budget.spent ?? budget.expense ?? budget.used,
                      );

                      const remaining = Math.max(budgetAmount - spent, 0);

                      const percentage =
                        budgetAmount > 0
                          ? Math.min((spent / budgetAmount) * 100, 100)
                          : 0;

                      return (
                        <tr
                          key={budget._id}
                          className="border-b border-gray-50 last:border-0"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-50 text-xs">
                                {budget.categoryId?.icon || "📁"}
                              </span>

                              <span className="text-xs font-medium text-gray-800">
                                {budget.categoryId?.name ||
                                  budget.category?.name ||
                                  "Budget"}
                              </span>
                            </div>
                          </td>

                          <td className="px-3 py-3.5 text-xs text-gray-700">
                            {formatMoney(budgetAmount)}
                          </td>

                          <td className="px-3 py-3.5 text-xs text-gray-700">
                            {formatMoney(spent)}
                          </td>

                          <td className="px-3 py-3.5 text-xs text-gray-700">
                            {formatMoney(remaining)}
                          </td>

                          <td className="px-5 py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-200">
                                <div
                                  className="h-full rounded-full bg-violet-600"
                                  style={{
                                    width: `${percentage}%`,
                                  }}
                                />
                              </div>

                              <span className="w-8 text-right text-xs font-semibold text-green-600">
                                {Math.round(percentage)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="border-t border-gray-100 px-5 py-3">
                  <Link
                    to="/budgets"
                    className="text-sm font-semibold text-violet-600 hover:text-violet-700"
                  >
                    + Add Budget
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[270px] items-center justify-center">
                <div className="text-center">
                  <div className="mb-3 text-4xl">🎯</div>

                  <p className="text-sm font-medium text-gray-700">
                    No budgets yet
                  </p>

                  <Link
                    to="/budgets"
                    className="mt-4 inline-flex rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    + Add Budget
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="py-6 text-center text-xs text-gray-500">
          © 2026 Expense Tracker. All rights reserved.
        </div>
      </div>
    </PageLayout>
  );
};

// =====================================================
// SUMMARY CARD
// =====================================================

const SummaryCard = ({ title, value, subtitle, icon, iconBg, iconColor }) => {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
        >
          {icon === "wallet" && <span className="text-xl">▰</span>}

          {icon === "expense" && <span className="text-xl">↕</span>}

          {icon === "income" && <span className="text-xl">↗</span>}

          {icon === "card" && <span className="text-xl">▣</span>}

          {icon === "transaction" && <span className="text-xl">▤</span>}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-gray-500">{title}</p>

          <p className="mt-1 truncate text-xl font-bold tracking-tight text-gray-900">
            {value}
          </p>

          <p className="mt-1 text-xs text-gray-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};

// =====================================================
// ACCOUNT TYPE
// =====================================================

const getAccountType = (type) => {
  switch (type) {
    case "BANK":
      return "Bank Account";

    case "CASH":
      return "Cash Account";

    case "CREDIT_CARD":
      return "Credit Card";

    case "WALLET":
      return "Wallet Account";

    default:
      return "Account";
  }
};

// =====================================================
// DONUT GRADIENT
// =====================================================

const createDonutGradient = (categories, total) => {
  let currentAngle = 0;

  const segments = categories.slice(0, 7).map((category, index) => {
    const amount = Number(category.amount) || 0;

    const percentage = total > 0 ? (amount / total) * 100 : 0;

    const start = currentAngle;

    currentAngle += percentage * 3.6;

    const color = category.color || DONUT_COLORS[index % DONUT_COLORS.length];

    return `${color} ${start}deg ${currentAngle}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
};

export default Dashboard;
