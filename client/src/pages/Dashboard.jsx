import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import PageLayout from "../components/layout/PageLayout";
import { getDashboard } from "../api/dashboardApi";
import axiosInstance from "../api/axios";

import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  Receipt,
  Building2,
  Banknote,
  Smartphone,
  Target,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

// =====================================================
// CONSTANTS
// =====================================================

const DONUT_COLORS = [
  "#5B21B6",
  "#2563EB",
  "#F97316",
  "#10B981",
  "#FBBF24",
  "#F472B6",
  "#94A3B8",
];

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

  if (typeof value === "object" && value?.$numberDecimal !== undefined) {
    return Number(value.$numberDecimal) || 0;
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
// DATE FORMAT
// =====================================================

const formatDate = (date) => {
  if (!date) {
    return "-";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "-";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// =====================================================
// ACCOUNT TYPE
// =====================================================

const getAccountType = (type) => {
  switch (type) {
    case "BANK":
      return "Bank Account";

    case "CASH":
      return "Cash";

    case "WALLET":
      return "Wallet";

    case "CREDIT_CARD":
      return "Credit Card";

    default:
      return "Account";
  }
};

// =====================================================
// ACCOUNT ICON
// =====================================================

const AccountIcon = ({ type, size = 18 }) => {
  if (type === "CREDIT_CARD") {
    return <CreditCard size={size} />;
  }

  if (type === "BANK") {
    return <Building2 size={size} />;
  }

  if (type === "CASH") {
    return <Banknote size={size} />;
  }

  if (type === "WALLET") {
    return <Smartphone size={size} />;
  }

  return <Wallet size={size} />;
};

// =====================================================
// TRANSACTION ICON
// =====================================================

const TransactionIcon = ({ type, size = 16 }) => {
  if (type === "INCOME") {
    return <ArrowDownLeft size={size} />;
  }

  if (type === "CREDIT_CARD_PAYMENT") {
    return <CreditCard size={size} />;
  }

  return <ArrowUpRight size={size} />;
};

// =====================================================
// DONUT GRADIENT
// =====================================================

const createDonutGradient = (categories, total) => {
  if (!categories.length || total <= 0) {
    return "conic-gradient(#e5e7eb 0deg 360deg)";
  }

  let currentAngle = 0;

  const segments = categories.slice(0, 7).map((category, index) => {
    const amount = toNumber(category.amount);

    const percentage = total > 0 ? (amount / total) * 100 : 0;

    const start = currentAngle;

    currentAngle += percentage * 3.6;

    const color = category.color || DONUT_COLORS[index % DONUT_COLORS.length];

    return `${color} ${start}deg ${currentAngle}deg`;
  });

  return `conic-gradient(${segments.join(", ")})`;
};

// =====================================================
// DASHBOARD
// =====================================================

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

  // ===================================================
  // LOAD DASHBOARD
  // ===================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getDashboard();

      console.log("Dashboard API Response:", response);

      const data = response?.data ||
        response?.dashboard ||
        response || {
          balance: 0,
          income: 0,
          expense: 0,
          savings: 0,
          recentTransactions: [],
          topCategories: [],
          budgets: [],
        };

      setDashboardData({
        balance: toNumber(data.balance),
        income: toNumber(data.income),
        expense: toNumber(data.expense),
        savings: toNumber(data.savings),

        recentTransactions: Array.isArray(data.recentTransactions)
          ? data.recentTransactions
          : [],

        topCategories: Array.isArray(data.topCategories)
          ? data.topCategories
          : [],

        budgets: Array.isArray(data.budgets) ? data.budgets : [],
      });
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // LOAD ACCOUNTS
  // ===================================================

  const loadAccounts = async () => {
    try {
      const response = await axiosInstance.get("/accounts");

      console.log("Accounts API Response:", response);

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
    } catch (err) {
      console.error("Accounts API error:", err);

      // Accounts should not break Dashboard
      setAccounts([]);
    }
  };

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    loadDashboard();
    loadAccounts();
  }, []);

  // ===================================================
  // CREDIT CARDS
  // ===================================================

  const creditAccounts = accounts.filter(
    (account) => account.type === "CREDIT_CARD",
  );

  const creditAvailable = creditAccounts.reduce((total, account) => {
    const creditLimit = toNumber(account.creditLimit);

    const outstanding = Math.abs(toNumber(account.balance));

    const available = Math.max(creditLimit - outstanding, 0);

    return total + available;
  }, 0);

  // ===================================================
  // CATEGORY DATA
  // ===================================================

  const categories = dashboardData.topCategories || [];

  const totalCategoryExpense = categories.reduce((total, category) => {
    return total + toNumber(category.amount);
  }, 0);

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <PageLayout title="Dashboard">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-violet-600" />

            <p className="text-sm text-gray-500">Loading dashboard...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // ===================================================
  // MAIN UI
  // ===================================================

  return (
    <PageLayout title="Dashboard">
      <div className="min-h-screen bg-[#f8f9fd] pb-6">
        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 sm:px-4">
            <p className="text-xs text-red-600 sm:text-sm">{error}</p>

            <button
              type="button"
              onClick={loadDashboard}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw size={13} />
              Retry
            </button>
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <SummaryCard
            title="Total Balance"
            value={formatMoney(dashboardData.balance)}
            subtitle="Across all accounts"
            icon={<Wallet size={19} />}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
          />

          <SummaryCard
            title="Monthly Expenses"
            value={formatMoney(dashboardData.expense)}
            subtitle="This month"
            icon={<ArrowUpRight size={19} />}
            iconBg="bg-red-50"
            iconColor="text-red-500"
          />

          <SummaryCard
            title="Monthly Income"
            value={formatMoney(dashboardData.income)}
            subtitle="This month"
            icon={<ArrowDownLeft size={19} />}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />

          <SummaryCard
            title="Credit Available"
            value={formatMoney(creditAvailable)}
            subtitle={
              creditAccounts.length > 0 ? "Remaining credit" : "No credit cards"
            }
            icon={<CreditCard size={19} />}
            iconBg="bg-amber-50"
            iconColor="text-amber-500"
          />

          <SummaryCard
            title="Transactions"
            value={dashboardData.recentTransactions?.length || 0}
            subtitle="Recent transactions"
            icon={<Receipt size={19} />}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />
        </div>

        {/* =================================================
            ACCOUNTS + CATEGORIES
        ================================================= */}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* =================================================
              ACCOUNTS
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                Accounts Overview
              </h2>

              <Link
                to="/accounts"
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 sm:text-sm"
              >
                View All
                <ChevronRight size={14} />
              </Link>
            </div>

            {accounts.length > 0 ? (
              <div className="px-3 sm:px-5">
                {accounts.slice(0, 5).map((account) => {
                  const balance = toNumber(account.balance);

                  const isCredit = account.type === "CREDIT_CARD";

                  return (
                    <div
                      key={account._id}
                      className="flex items-center justify-between gap-3 border-b border-gray-100 py-3 last:border-b-0 sm:py-3.5"
                    >
                      {/* LEFT */}

                      <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-10 sm:w-10 sm:rounded-xl ${
                            isCredit
                              ? "bg-orange-50 text-orange-500"
                              : "bg-violet-50 text-violet-600"
                          }`}
                        >
                          <AccountIcon type={account.type} size={17} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-gray-900 sm:text-sm">
                            {account.name}
                          </p>

                          <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                            {getAccountType(account.type)}
                          </p>
                        </div>
                      </div>

                      {/* RIGHT */}

                      <div className="shrink-0 text-right">
                        <p className="text-xs font-bold text-gray-900 sm:text-sm">
                          {formatMoney(Math.abs(balance))}
                        </p>

                        <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                          {isCredit ? "Outstanding" : "Available"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-[230px] items-center justify-center px-4">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    <Wallet size={20} />
                  </div>

                  <p className="text-sm font-semibold text-gray-800">
                    No accounts found
                  </p>

                  <p className="mt-1 text-xs text-gray-500">
                    Add a bank account, cash or wallet.
                  </p>

                  <Link
                    to="/accounts"
                    className="mt-3 inline-flex rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
                  >
                    Add Account
                  </Link>
                </div>
              </div>
            )}

            {accounts.length > 0 && (
              <div className="mx-3 mb-3 rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2.5 sm:mx-5 sm:mb-4">
                <p className="text-[10px] font-medium text-gray-700 sm:text-xs">
                  Bank, cash and wallet balances show available money.
                </p>

                <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">
                  Credit cards show outstanding amount.
                </p>
              </div>
            )}
          </section>

          {/* =================================================
              CATEGORY EXPENSES
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                Expenses by Category
              </h2>

              <Link
                to="/reports"
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 sm:text-sm"
              >
                Report
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="flex min-h-[270px] flex-col items-center justify-center gap-5 p-4 sm:min-h-[300px] sm:p-5 md:flex-row">
              {/* DONUT */}

              <div className="relative h-40 w-40 shrink-0 sm:h-48 sm:w-48">
                {categories.length > 0 && totalCategoryExpense > 0 ? (
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

                    <div className="absolute inset-[29%] flex flex-col items-center justify-center rounded-full bg-white">
                      <p className="text-[9px] text-gray-500 sm:text-xs">
                        Total
                      </p>

                      <p className="mt-0.5 text-sm font-bold text-gray-900 sm:text-lg">
                        {formatMoney(totalCategoryExpense)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full border-[28px] border-gray-100">
                    <span className="text-[10px] text-gray-400 sm:text-xs">
                      No data
                    </span>
                  </div>
                )}
              </div>

              {/* CATEGORY LIST */}

              <div className="w-full max-w-sm space-y-2.5">
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
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor: color,
                          }}
                        />

                        <span className="truncate text-xs text-gray-700 sm:text-sm">
                          {category.name || category.category || "Unknown"}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <span className="text-xs font-semibold text-gray-800 sm:text-sm">
                          {formatMoney(amount)}
                        </span>

                        <span className="w-8 text-right text-[10px] text-gray-500 sm:text-xs">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {categories.length === 0 && (
                  <p className="text-center text-xs text-gray-500 sm:text-sm">
                    No expense categories yet.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            TRANSACTIONS + BUDGETS
        ================================================= */}

        <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
          {/* =================================================
              RECENT TRANSACTIONS
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                Recent Transactions
              </h2>

              <Link
                to="/expenses"
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 sm:text-sm"
              >
                View All
                <ChevronRight size={14} />
              </Link>
            </div>

            {dashboardData.recentTransactions?.length > 0 ? (
              <>
                {/* DESKTOP */}

                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="px-4 py-3 text-left text-[10px] font-semibold text-gray-500 sm:px-5 sm:text-xs">
                          Date
                        </th>

                        <th className="px-2 py-3 text-left text-[10px] font-semibold text-gray-500 sm:text-xs">
                          Description
                        </th>

                        <th className="px-2 py-3 text-left text-[10px] font-semibold text-gray-500 sm:text-xs">
                          Category
                        </th>

                        <th className="px-2 py-3 text-left text-[10px] font-semibold text-gray-500 sm:text-xs">
                          Account
                        </th>

                        <th className="px-4 py-3 text-right text-[10px] font-semibold text-gray-500 sm:px-5 sm:text-xs">
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

                          const isCardPayment =
                            transaction.type === "CREDIT_CARD_PAYMENT";

                          return (
                            <tr
                              key={transaction._id}
                              className="border-b border-gray-50 last:border-0"
                            >
                              <td className="whitespace-nowrap px-4 py-3 text-[10px] text-gray-500 sm:px-5 sm:text-xs">
                                {formatDate(
                                  transaction.date || transaction.createdAt,
                                )}
                              </td>

                              <td className="max-w-[170px] px-2 py-3">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                      isIncome
                                        ? "bg-green-50 text-green-600"
                                        : isCardPayment
                                          ? "bg-blue-50 text-blue-600"
                                          : "bg-red-50 text-red-500"
                                    }`}
                                  >
                                    <TransactionIcon
                                      type={transaction.type}
                                      size={14}
                                    />
                                  </span>

                                  <span className="truncate text-xs font-medium text-gray-800">
                                    {transaction.description || "Transaction"}
                                  </span>
                                </div>
                              </td>

                              <td className="px-2 py-3 text-xs text-gray-600">
                                {transaction.categoryId?.name ||
                                  transaction.category?.name ||
                                  "Other"}
                              </td>

                              <td className="px-2 py-3 text-xs text-gray-600">
                                {transaction.accountId?.name || "-"}
                              </td>

                              <td
                                className={`whitespace-nowrap px-4 py-3 text-right text-xs font-bold sm:px-5 ${
                                  isIncome
                                    ? "text-green-600"
                                    : isCardPayment
                                      ? "text-blue-600"
                                      : "text-red-600"
                                }`}
                              >
                                {isIncome ? "+" : isCardPayment ? "" : "-"}

                                {formatMoney(amount)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {/* MOBILE */}

                <div className="divide-y divide-gray-100 md:hidden">
                  {dashboardData.recentTransactions
                    .slice(0, 5)
                    .map((transaction) => {
                      const amount = toNumber(transaction.amount);

                      const isIncome = transaction.type === "INCOME";

                      const isCardPayment =
                        transaction.type === "CREDIT_CARD_PAYMENT";

                      return (
                        <div
                          key={transaction._id}
                          className="flex items-center gap-2.5 px-3 py-3"
                        >
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              isIncome
                                ? "bg-green-50 text-green-600"
                                : isCardPayment
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-red-50 text-red-500"
                            }`}
                          >
                            <TransactionIcon
                              type={transaction.type}
                              size={16}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-gray-900">
                              {transaction.description || "Transaction"}
                            </p>

                            <p className="mt-0.5 truncate text-[10px] text-gray-500">
                              {transaction.categoryId?.name ||
                                transaction.category?.name ||
                                "Other"}{" "}
                              • {transaction.accountId?.name || "Account"}
                            </p>

                            <p className="mt-0.5 text-[9px] text-gray-400">
                              {formatDate(
                                transaction.date || transaction.createdAt,
                              )}
                            </p>
                          </div>

                          <div
                            className={`shrink-0 text-right text-xs font-bold ${
                              isIncome
                                ? "text-green-600"
                                : isCardPayment
                                  ? "text-blue-600"
                                  : "text-red-600"
                            }`}
                          >
                            {isIncome ? "+" : isCardPayment ? "" : "-"}

                            {formatMoney(amount)}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </>
            ) : (
              <div className="flex min-h-[230px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <Receipt size={20} />
                  </div>

                  <p className="text-sm font-medium text-gray-700">
                    No transactions yet
                  </p>

                  <Link
                    to="/expenses/add"
                    className="mt-3 inline-flex rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
                  >
                    Add Expense
                  </Link>
                </div>
              </div>
            )}
          </section>

          {/* =================================================
              BUDGET OVERVIEW
          ================================================= */}

          <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3.5 sm:px-5">
              <h2 className="text-sm font-bold text-gray-900 sm:text-base">
                Budget Overview
              </h2>

              <Link
                to="/budgets"
                className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 sm:text-sm"
              >
                View All
                <ChevronRight size={14} />
              </Link>
            </div>

            {dashboardData.budgets?.length > 0 ? (
              <div>
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
                    <div
                      key={budget._id}
                      className="border-b border-gray-100 px-3 py-3 last:border-b-0 sm:px-5 sm:py-3.5"
                    >
                      {/* TOP */}

                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                            {budget.categoryId?.icon ? (
                              <span className="text-sm">
                                {budget.categoryId.icon}
                              </span>
                            ) : (
                              <Target size={15} />
                            )}
                          </div>

                          <p className="truncate text-xs font-semibold text-gray-800 sm:text-sm">
                            {budget.categoryId?.name ||
                              budget.category?.name ||
                              "Budget"}
                          </p>
                        </div>

                        <p className="shrink-0 text-xs font-bold text-gray-900 sm:text-sm">
                          {formatMoney(budgetAmount)}
                        </p>
                      </div>

                      {/* PROGRESS */}

                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-violet-600 transition-all"
                            style={{
                              width: `${percentage}%`,
                            }}
                          />
                        </div>

                        <span className="w-9 text-right text-[10px] font-semibold text-gray-600 sm:text-xs">
                          {Math.round(percentage)}%
                        </span>
                      </div>

                      {/* BOTTOM */}

                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-[10px] text-gray-500 sm:text-xs">
                          Spent{" "}
                          <span className="font-medium text-gray-700">
                            {formatMoney(spent)}
                          </span>
                        </p>

                        <p className="text-[10px] text-gray-500 sm:text-xs">
                          Remaining{" "}
                          <span className="font-medium text-gray-700">
                            {formatMoney(remaining)}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="border-t border-gray-100 px-3 py-2.5 sm:px-5">
                  <Link
                    to="/budgets"
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    + Add Budget
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[230px] items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                    <Target size={20} />
                  </div>

                  <p className="text-sm font-medium text-gray-700">
                    No budgets yet
                  </p>

                  <Link
                    to="/budgets"
                    className="mt-3 inline-flex rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-violet-700"
                  >
                    Add Budget
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="py-5 text-center text-[10px] text-gray-500 sm:py-6 sm:text-xs">
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
    <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:rounded-2xl sm:p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 ${iconBg} ${iconColor}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-medium text-gray-500 sm:text-xs">
            {title}
          </p>

          <p className="mt-0.5 truncate text-lg font-bold tracking-tight text-gray-900 sm:text-xl">
            {value}
          </p>

          <p className="mt-0.5 truncate text-[10px] text-gray-500 sm:text-xs">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
