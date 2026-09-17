import { useEffect, useMemo, useState } from "react";
import PageLayout from "../components/layout/PageLayout";

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Wallet,
  CalendarDays,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  PiggyBank,
  CreditCard,
  CircleDollarSign,
} from "lucide-react";

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import {
  getSummaryReport,
  getCategoryReport,
  getMonthlyReport,
  getAccountReport,
  getTrendsReport,
} from "../api/reportApi";

import { getExpenses } from "../api/expenseApi";

// ======================================================
// HELPERS
// ======================================================

const COLORS = [
  "#6D28D9",
  "#2563EB",
  "#F97316",
  "#10B981",
  "#FBBF24",
  "#EC4899",
  "#94A3B8",
  "#14B8A6",
];

const getNumber = (value) => {
  if (value === null || value === undefined) return 0;

  if (typeof value === "object" && value.$numberDecimal) {
    return Number(value.$numberDecimal);
  }

  return Number(value) || 0;
};

const getExpenseId = (expense) => {
  return expense?._id || expense?.id;
};

const getExpenseAmount = (expense) => {
  return getNumber(expense?.amount ?? expense?.value ?? expense?.totalAmount);
};

const getExpenseDescription = (expense) => {
  return expense?.description || expense?.title || expense?.note || "Expense";
};

const getExpenseCategory = (expense) => {
  if (typeof expense?.categoryId === "object") {
    return expense.categoryId?.name || expense.categoryId?.title || "Others";
  }

  if (typeof expense?.category === "object") {
    return expense.category?.name || expense.category?.title || "Others";
  }

  return expense?.categoryName || "Others";
};

const getExpenseAccount = (expense) => {
  if (typeof expense?.accountId === "object") {
    return expense.accountId?.name || expense.accountId?.title || "Account";
  }

  if (typeof expense?.account === "object") {
    return expense.account?.name || expense.account?.title || "Account";
  }

  return expense?.accountName || "Account";
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(getNumber(value));
};

const formatDate = (date) => {
  if (!date) return "-";

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

// ======================================================
// COMPONENT
// ======================================================

const Reports = () => {
  // ====================================================
  // CURRENT DATE
  // ====================================================

  const currentDate = new Date();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // ====================================================
  // FILTERS
  // ====================================================

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);

  const [accountFilter, setAccountFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [transactionType, setTransactionType] = useState("ALL");

  // ====================================================
  // REPORT STATES
  // ====================================================

  const [summary, setSummary] = useState(null);

  const [categories, setCategories] = useState([]);

  const [monthly, setMonthly] = useState([]);

  const [accounts, setAccounts] = useState([]);

  const [trends, setTrends] = useState([]);

  const [expenses, setExpenses] = useState([]);

  // ====================================================
  // UI STATES
  // ====================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ====================================================
  // MONTH NAME
  // ====================================================

  const selectedMonthName = new Date(year, month - 1, 1).toLocaleString(
    "en-US",
    {
      month: "long",
    },
  );

  // ====================================================
  // LOAD REPORTS
  // ====================================================

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        year,
        month,
      };

      const [
        summaryResponse,
        categoryResponse,
        monthlyResponse,
        accountResponse,
        trendsResponse,
        expenseResponse,
      ] = await Promise.all([
        getSummaryReport(params),

        getCategoryReport(params),

        getMonthlyReport({
          year,
        }),

        getAccountReport(params),

        getTrendsReport({
          months: 6,
        }),

        getExpenses({
          year,
          month,
        }).catch(() => null),
      ]);

      // SUMMARY

      setSummary(summaryResponse?.data || null);

      // CATEGORY

      setCategories(categoryResponse?.data?.categories || []);

      // MONTHLY

      setMonthly(monthlyResponse?.data?.monthly || []);

      // ACCOUNTS

      setAccounts(accountResponse?.data?.accounts || []);

      // TRENDS

      setTrends(trendsResponse?.data?.trends || []);

      // EXPENSES

      const expenseData =
        expenseResponse?.data?.expenses || expenseResponse?.data || [];

      setExpenses(Array.isArray(expenseData) ? expenseData : []);
    } catch (err) {
      console.error("Reports error:", err);

      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // LOAD ON FILTER CHANGE
  // ====================================================

  useEffect(() => {
    loadReports();
  }, [year, month]);

  // ====================================================
  // RESET FILTERS
  // ====================================================

  const handleReset = () => {
    setYear(currentYear);
    setMonth(currentMonth);

    setAccountFilter("ALL");
    setCategoryFilter("ALL");
    setTransactionType("ALL");
  };

  // ====================================================
  // CATEGORY CHART DATA
  // ====================================================

  const categoryChartData = useMemo(() => {
    return categories.map((category) => ({
      name: category.name,
      value: getNumber(category.amount),
    }));
  }, [categories]);

  // ====================================================
  // TOP CATEGORIES
  // ====================================================

  const topCategories = useMemo(() => {
    return [...categories]
      .sort((a, b) => getNumber(b.amount) - getNumber(a.amount))
      .slice(0, 5);
  }, [categories]);

  // ====================================================
  // FILTER OPTIONS
  // ====================================================

  const accountOptions = useMemo(() => {
    return accounts.map((account) => account.name).filter(Boolean);
  }, [accounts]);

  const categoryOptions = useMemo(() => {
    return categories.map((category) => category.name).filter(Boolean);
  }, [categories]);

  // ====================================================
  // RECENT HIGH VALUE TRANSACTIONS
  // ====================================================

  const highValueTransactions = useMemo(() => {
    let filtered = [...expenses];

    if (accountFilter !== "ALL") {
      filtered = filtered.filter(
        (expense) => getExpenseAccount(expense) === accountFilter,
      );
    }

    if (categoryFilter !== "ALL") {
      filtered = filtered.filter(
        (expense) => getExpenseCategory(expense) === categoryFilter,
      );
    }

    if (transactionType !== "ALL") {
      filtered = filtered.filter((expense) => {
        const type = expense?.type || expense?.transactionType || "EXPENSE";

        return String(type).toUpperCase() === transactionType;
      });
    }

    return filtered
      .sort((a, b) => getExpenseAmount(b) - getExpenseAmount(a))
      .slice(0, 5);
  }, [expenses, accountFilter, categoryFilter, transactionType]);

  // ====================================================
  // AVERAGE DAILY EXPENSE
  // ====================================================

  const averageDailyExpense = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();

    const expense = getNumber(summary?.expense);

    return daysInMonth > 0 ? expense / daysInMonth : 0;
  }, [summary, year, month]);

  // ====================================================
  // SAVINGS
  // ====================================================

  const savings = getNumber(summary?.savings);

  const income = getNumber(summary?.income);

  const expense = getNumber(summary?.expense);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <PageLayout
      title="Reports"
      subtitle="Analyze your spending and get insights"
    >
      <div className="mx-auto max-w-[1400px] space-y-5">
        {/* =================================================
            TOP FILTER / MONTH
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Financial Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {selectedMonthName} {year}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <CalendarDays size={18} className="text-slate-500" />

              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="bg-transparent text-sm font-semibold text-slate-800 outline-none"
              >
                {Array.from({ length: 12 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    {new Date(2000, index, 1).toLocaleString("en-US", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm outline-none"
            >
              {Array.from({ length: 5 }, (_, index) => {
                const selectedYear = currentYear - index;

                return (
                  <option key={selectedYear} value={selectedYear}>
                    {selectedYear}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        {!loading && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* TOTAL EXPENSE */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Expenses</p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(expense)}
                  </h3>
                </div>

                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                  <CircleDollarSign size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="flex items-center font-semibold text-red-500">
                  <ArrowDownRight size={15} />
                  Expenses
                </span>

                <span className="text-slate-400">
                  {summary?.expenseCount || 0} transactions
                </span>
              </div>
            </div>

            {/* TOTAL INCOME */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Total Income</p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(income)}
                  </h3>
                </div>

                <div className="rounded-full bg-emerald-100 p-3 text-emerald-600">
                  <TrendingUp size={22} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs">
                <span className="flex items-center font-semibold text-emerald-600">
                  <ArrowUpRight size={15} />
                  Income
                </span>

                <span className="text-slate-400">
                  {summary?.incomeCount || 0} transactions
                </span>
              </div>
            </div>

            {/* NET SAVINGS */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">Net Savings</p>

                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      savings >= 0 ? "text-slate-900" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(savings)}
                  </h3>
                </div>

                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                  <PiggyBank size={22} />
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                Income − Expenses
              </div>
            </div>

            {/* AVERAGE DAILY */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    Average Daily Expense
                  </p>

                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(averageDailyExpense)}
                  </h3>
                </div>

                <div className="rounded-full bg-amber-100 p-3 text-amber-600">
                  <Wallet size={22} />
                </div>
              </div>

              <div className="mt-4 text-xs text-slate-400">
                Based on {selectedMonthName} {year}
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            FILTER BAR
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter size={18} className="text-purple-600" />

            <h3 className="font-semibold text-slate-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {/* DATE */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Date Range
              </label>

              <div className="flex items-center rounded-xl border border-slate-200 px-3 py-2.5">
                <CalendarDays size={16} className="mr-2 text-slate-400" />

                <span className="text-sm text-slate-700">
                  {selectedMonthName} {year}
                </span>
              </div>
            </div>

            {/* ACCOUNT */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Account
              </label>

              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-purple-500"
              >
                <option value="ALL">All Accounts</option>

                {accountOptions.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Category
              </label>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-purple-500"
              >
                <option value="ALL">All Categories</option>

                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* TYPE */}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-500">
                Transaction Type
              </label>

              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-purple-500"
              >
                <option value="ALL">All Types</option>

                <option value="EXPENSE">Expenses</option>

                <option value="INCOME">Income</option>
              </select>
            </div>

            {/* RESET */}

            <div className="flex items-end">
              <button
                onClick={handleReset}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <RefreshCw size={16} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />

              <p className="mt-3 text-sm text-slate-500">Loading reports...</p>
            </div>
          </div>
        ) : (
          <>
            {/* =================================================
                CHART ROW 1
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {/* INCOME VS EXPENSE */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Income vs Expenses
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Monthly comparison for {year}
                    </p>
                  </div>

                  <BarChart3 size={20} className="text-purple-600" />
                </div>

                <div className="h-[330px]">
                  {monthly.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No monthly data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthly}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />

                        <YAxis tick={{ fontSize: 11 }} />

                        <Tooltip formatter={(value) => formatCurrency(value)} />

                        <Legend />

                        <Bar
                          dataKey="income"
                          name="Income"
                          fill="#6D28D9"
                          radius={[5, 5, 0, 0]}
                        />

                        <Bar
                          dataKey="expense"
                          name="Expenses"
                          fill="#F97316"
                          radius={[5, 5, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* EXPENSES BY CATEGORY */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Expenses by Category
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      {selectedMonthName} {year}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-2">
                  <div className="h-[300px]">
                    {categoryChartData.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-sm text-slate-400">
                        No expense data
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={2}
                          >
                            {categoryChartData.map((_, index) => (
                              <Cell
                                key={`category-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="space-y-3">
                    {categoryChartData.slice(0, 7).map((category, index) => {
                      const total = categoryChartData.reduce(
                        (sum, item) => sum + item.value,
                        0,
                      );

                      const percentage =
                        total > 0
                          ? ((category.value / total) * 100).toFixed(1)
                          : 0;

                      return (
                        <div
                          key={category.name}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-3 w-3 shrink-0 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />

                            <span className="truncate text-sm text-slate-700">
                              {category.name}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-slate-800">
                              {formatCurrency(category.value)}
                            </span>

                            <span className="w-10 text-right text-xs text-slate-400">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* =================================================
                CHART ROW 2
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {/* MONTHLY TREND */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="font-bold text-slate-900">Monthly Trend</h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Income and expenses over the last 6 months
                  </p>
                </div>

                <div className="h-[320px]">
                  {trends.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No trend data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis dataKey="monthName" tick={{ fontSize: 12 }} />

                        <YAxis tick={{ fontSize: 11 }} />

                        <Tooltip formatter={(value) => formatCurrency(value)} />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="income"
                          name="Income"
                          stroke="#6D28D9"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="expense"
                          name="Expenses"
                          stroke="#F97316"
                          strokeWidth={3}
                          dot={{
                            r: 4,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* TOP SPENDING CATEGORIES */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900">
                      Top Spending Categories
                    </h3>

                    <p className="mt-1 text-xs text-slate-500">
                      Highest expense categories
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-purple-600">
                    {selectedMonthName}
                  </span>
                </div>

                <div className="space-y-4">
                  {topCategories.length === 0 ? (
                    <div className="py-10 text-center text-sm text-slate-400">
                      No category data
                    </div>
                  ) : (
                    topCategories.map((category, index) => {
                      const maxAmount = getNumber(topCategories[0]?.amount);

                      const percentage =
                        maxAmount > 0
                          ? Math.min(
                              100,
                              (getNumber(category.amount) / maxAmount) * 100,
                            )
                          : 0;

                      return (
                        <div key={category.categoryId || category.name}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-50 text-xs font-bold text-purple-600">
                                {index + 1}
                              </span>

                              <span className="text-sm font-medium text-slate-800">
                                {category.name}
                              </span>
                            </div>

                            <span className="text-sm font-semibold text-slate-900">
                              {formatCurrency(category.amount)}
                            </span>
                          </div>

                          <div className="ml-10 h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-purple-600 transition-all"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                INSIGHTS + HIGH VALUE
            ================================================= */}

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              {/* SPENDING INSIGHTS */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h3 className="font-bold text-slate-900">
                    Spending Insights
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Quick insights from your financial activity
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* INCOME */}

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <TrendingUp size={18} />
                    </div>

                    <p className="text-xl font-bold text-emerald-600">
                      {formatCurrency(income)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Total income this month
                    </p>
                  </div>

                  {/* EXPENSE */}

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-red-100 text-red-600">
                      <TrendingDown size={18} />
                    </div>

                    <p className="text-xl font-bold text-red-600">
                      {formatCurrency(expense)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Total expenses this month
                    </p>
                  </div>

                  {/* TOP CATEGORY */}

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <CreditCard size={18} />
                    </div>

                    <p className="truncate text-xl font-bold text-blue-600">
                      {topCategories[0]?.name || "No data"}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Most spent category
                    </p>
                  </div>

                  {/* SAVINGS */}

                  <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                      <PiggyBank size={18} />
                    </div>

                    <p
                      className={`text-xl font-bold ${
                        savings >= 0 ? "text-purple-600" : "text-red-600"
                      }`}
                    >
                      {formatCurrency(savings)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">Net savings</p>
                  </div>
                </div>
              </div>

              {/* RECENT HIGH VALUE TRANSACTIONS */}

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">
                        Recent High Value Transactions
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Your largest transactions
                      </p>
                    </div>

                    <CircleDollarSign size={20} className="text-purple-600" />
                  </div>
                </div>

                {highValueTransactions.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-400">
                    No transaction data available
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Date
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Description
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Category
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Account
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {highValueTransactions.map((transaction) => {
                          const amount = getExpenseAmount(transaction);

                          return (
                            <tr
                              key={getExpenseId(transaction)}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="whitespace-nowrap px-5 py-3 text-xs text-slate-500">
                                {formatDate(
                                  transaction.date || transaction.createdAt,
                                )}
                              </td>

                              <td className="max-w-[160px] truncate px-5 py-3 text-sm font-medium text-slate-800">
                                {getExpenseDescription(transaction)}
                              </td>

                              <td className="px-5 py-3 text-xs text-slate-600">
                                {getExpenseCategory(transaction)}
                              </td>

                              <td className="px-5 py-3 text-xs text-slate-600">
                                {getExpenseAccount(transaction)}
                              </td>

                              <td className="whitespace-nowrap px-5 py-3 text-right text-sm font-semibold text-red-500">
                                - {formatCurrency(amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                CATEGORY BREAKDOWN
            ================================================= */}

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 p-5">
                <h3 className="font-bold text-slate-900">Category Breakdown</h3>

                <p className="mt-1 text-xs text-slate-500">
                  Detailed spending for {selectedMonthName} {year}
                </p>
              </div>

              {categories.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  No category expenses for this month.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {categories.map((category, index) => {
                    const amount = getNumber(category.amount);

                    const total = categories.reduce(
                      (sum, item) => sum + getNumber(item.amount),
                      0,
                    );

                    const percentage =
                      total > 0 ? ((amount / total) * 100).toFixed(1) : 0;

                    return (
                      <div
                        key={category.categoryId || category.name}
                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />

                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {category.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {category.count || 0} transactions
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-5">
                          <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>

                          <span className="w-24 text-right text-sm font-semibold text-slate-900">
                            {formatCurrency(amount)}
                          </span>

                          <span className="w-12 text-right text-xs text-slate-400">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="py-4 text-center">
              <p className="text-xs text-slate-400">
                Expense Tracker • Financial Reports
              </p>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

export default Reports;
