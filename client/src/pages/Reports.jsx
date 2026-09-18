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
  ArrowDownLeft,
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
// COLORS
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

// ======================================================
// HELPERS
// ======================================================

const getNumber = (value) => {
  if (value === null || value === undefined) return 0;

  if (typeof value === "object" && value.$numberDecimal) {
    return Number(value.$numberDecimal) || 0;
  }

  return Number(value) || 0;
};

const getExpenseId = (expense) => expense?._id || expense?.id;

const getExpenseAmount = (expense) =>
  getNumber(expense?.amount ?? expense?.value ?? expense?.totalAmount);

const getExpenseDescription = (expense) =>
  expense?.description || expense?.title || expense?.note || "Expense";

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

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(getNumber(value));

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
// REPORTS
// ======================================================

const Reports = () => {
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
  // DATA
  // ====================================================

  const [summary, setSummary] = useState(null);

  const [categories, setCategories] = useState([]);

  const [monthly, setMonthly] = useState([]);

  const [accounts, setAccounts] = useState([]);

  const [trends, setTrends] = useState([]);

  const [expenses, setExpenses] = useState([]);

  // ====================================================
  // UI
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

      setSummary(summaryResponse?.data || null);

      setCategories(categoryResponse?.data?.categories || []);

      setMonthly(monthlyResponse?.data?.monthly || []);

      setAccounts(accountResponse?.data?.accounts || []);

      setTrends(trendsResponse?.data?.trends || []);

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

  useEffect(() => {
    loadReports();
  }, [year, month]);

  // ====================================================
  // RESET
  // ====================================================

  const handleReset = () => {
    setYear(currentYear);
    setMonth(currentMonth);
    setAccountFilter("ALL");
    setCategoryFilter("ALL");
    setTransactionType("ALL");
  };

  // ====================================================
  // CHART DATA
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

  const accountOptions = useMemo(
    () => accounts.map((account) => account.name).filter(Boolean),
    [accounts],
  );

  const categoryOptions = useMemo(
    () => categories.map((category) => category.name).filter(Boolean),
    [categories],
  );

  // ====================================================
  // HIGH VALUE TRANSACTIONS
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
  // FINANCIAL VALUES
  // ====================================================

  const income = getNumber(summary?.income);

  const expense = getNumber(summary?.expense);

  const savings = getNumber(summary?.savings);

  const averageDailyExpense = useMemo(() => {
    const daysInMonth = new Date(year, month, 0).getDate();

    return daysInMonth > 0 ? expense / daysInMonth : 0;
  }, [expense, year, month]);

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <PageLayout
      title="Reports"
      subtitle="Analyze your spending and get insights"
    >
      <div className="mx-auto w-full max-w-[1400px] space-y-3 overflow-hidden sm:space-y-4 lg:space-y-5">
        {/* ==================================================
            TOP HEADER
        ================================================== */}

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Financial Overview
            </h2>

            <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
              {selectedMonthName} {year}
            </p>
          </div>

          <div className="flex w-full gap-2 sm:gap-3 lg:w-auto">
            {/* MONTH */}

            <div className="flex min-w-0 flex-1 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 shadow-sm sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 lg:flex-none">
              <CalendarDays
                size={16}
                className="shrink-0 text-slate-500 sm:h-[18px] sm:w-[18px]"
              />

              <select
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none sm:text-sm lg:flex-none"
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

            {/* YEAR */}

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 shadow-sm outline-none sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm lg:flex-none"
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

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
            {error}
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        {!loading && (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-4">
            {/* EXPENSE */}

            <SummaryCard
              title="Total Expenses"
              value={formatCurrency(expense)}
              subtitle={`${summary?.expenseCount || 0} transactions`}
              icon={<CircleDollarSign size={18} />}
              iconClass="bg-purple-100 text-purple-600"
              bottom={
                <span className="flex items-center gap-1 font-semibold text-red-500">
                  <ArrowUpRight size={13} />
                  Expenses
                </span>
              }
            />

            {/* INCOME */}

            <SummaryCard
              title="Total Income"
              value={formatCurrency(income)}
              subtitle={`${summary?.incomeCount || 0} transactions`}
              icon={<TrendingUp size={18} />}
              iconClass="bg-emerald-100 text-emerald-600"
              bottom={
                <span className="flex items-center gap-1 font-semibold text-emerald-600">
                  <ArrowDownLeft size={13} />
                  Income
                </span>
              }
            />

            {/* SAVINGS */}

            <SummaryCard
              title="Net Savings"
              value={formatCurrency(savings)}
              subtitle="Income − Expenses"
              icon={<PiggyBank size={18} />}
              iconClass="bg-blue-100 text-blue-600"
              valueClass={savings >= 0 ? "text-slate-900" : "text-red-600"}
            />

            {/* DAILY */}

            <SummaryCard
              title="Average Daily Expense"
              value={formatCurrency(averageDailyExpense)}
              subtitle={`Based on ${selectedMonthName}`}
              icon={<Wallet size={18} />}
              iconClass="bg-amber-100 text-amber-600"
            />
          </div>
        )}

        {/* ==================================================
            FILTERS
        ================================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-4">
          <div className="mb-3 flex items-center gap-1.5 sm:mb-4 sm:gap-2">
            <Filter size={16} className="text-purple-600" />

            <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
              Filters
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-5">
            {/* DATE */}

            <FilterBox label="Date Range">
              <div className="flex min-h-[38px] items-center rounded-lg border border-slate-200 px-2.5 py-2 sm:rounded-xl sm:px-3 sm:py-2.5">
                <CalendarDays
                  size={14}
                  className="mr-1.5 shrink-0 text-slate-400 sm:mr-2"
                />

                <span className="truncate text-[11px] text-slate-700 sm:text-sm">
                  {selectedMonthName} {year}
                </span>
              </div>
            </FilterBox>

            {/* ACCOUNT */}

            <FilterBox label="Account">
              <select
                value={accountFilter}
                onChange={(e) => setAccountFilter(e.target.value)}
                className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] text-slate-700 outline-none focus:border-purple-500 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm"
              >
                <option value="ALL">All Accounts</option>

                {accountOptions.map((account) => (
                  <option key={account} value={account}>
                    {account}
                  </option>
                ))}
              </select>
            </FilterBox>

            {/* CATEGORY */}

            <FilterBox label="Category">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] text-slate-700 outline-none focus:border-purple-500 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm"
              >
                <option value="ALL">All Categories</option>

                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </FilterBox>

            {/* TYPE */}

            <FilterBox label="Transaction Type">
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full min-h-[38px] rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] text-slate-700 outline-none focus:border-purple-500 sm:rounded-xl sm:px-3 sm:py-2.5 sm:text-sm"
              >
                <option value="ALL">All Types</option>

                <option value="EXPENSE">Expenses</option>

                <option value="INCOME">Income</option>
              </select>
            </FilterBox>

            {/* RESET */}

            <div className="col-span-2 flex items-end xl:col-span-1">
              <button
                type="button"
                onClick={handleReset}
                className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
              >
                <RefreshCw size={14} />
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />

              <p className="mt-3 text-xs text-slate-500 sm:text-sm">
                Loading reports...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                INCOME VS EXPENSE + CATEGORY
            ================================================== */}

            <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
              {/* INCOME VS EXPENSE */}

              <ReportCard
                title="Income vs Expenses"
                subtitle={`Monthly comparison for ${year}`}
                icon={<BarChart3 size={18} />}
              >
                <div className="h-[240px] sm:h-[300px] lg:h-[330px]">
                  {monthly.length === 0 ? (
                    <EmptyChart text="No monthly data available" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={monthly}
                        margin={{
                          top: 5,
                          right: 5,
                          left: -15,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis
                          dataKey="monthName"
                          tick={{
                            fontSize: 10,
                          }}
                        />

                        <YAxis
                          tick={{
                            fontSize: 9,
                          }}
                        />

                        <Tooltip formatter={(value) => formatCurrency(value)} />

                        <Legend
                          wrapperStyle={{
                            fontSize: 11,
                          }}
                        />

                        <Bar
                          dataKey="income"
                          name="Income"
                          fill="#6D28D9"
                          radius={[4, 4, 0, 0]}
                        />

                        <Bar
                          dataKey="expense"
                          name="Expenses"
                          fill="#F97316"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </ReportCard>

              {/* CATEGORY */}

              <ReportCard
                title="Expenses by Category"
                subtitle={`${selectedMonthName} ${year}`}
              >
                <div className="grid grid-cols-1 items-center gap-2 sm:gap-4 md:grid-cols-2">
                  <div className="h-[230px] sm:h-[280px] lg:h-[300px]">
                    {categoryChartData.length === 0 ? (
                      <EmptyChart text="No expense data" />
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="45%"
                            outerRadius="72%"
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

                  <div className="space-y-2 sm:space-y-3">
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
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />

                            <span className="truncate text-[11px] text-slate-700 sm:text-sm">
                              {category.name}
                            </span>
                          </div>

                          <div className="flex shrink-0 items-center gap-2">
                            <span className="text-[11px] font-medium text-slate-800 sm:text-sm">
                              {formatCurrency(category.value)}
                            </span>

                            <span className="w-8 text-right text-[10px] text-slate-400 sm:w-10 sm:text-xs">
                              {percentage}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </ReportCard>
            </div>

            {/* ==================================================
                MONTHLY TREND + TOP CATEGORIES
            ================================================== */}

            <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
              {/* TREND */}

              <ReportCard
                title="Monthly Trend"
                subtitle="Income and expenses over the last 6 months"
              >
                <div className="h-[240px] sm:h-[290px] lg:h-[320px]">
                  {trends.length === 0 ? (
                    <EmptyChart text="No trend data available" />
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={trends}
                        margin={{
                          top: 5,
                          right: 5,
                          left: -15,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis
                          dataKey="monthName"
                          tick={{
                            fontSize: 10,
                          }}
                        />

                        <YAxis
                          tick={{
                            fontSize: 9,
                          }}
                        />

                        <Tooltip formatter={(value) => formatCurrency(value)} />

                        <Legend
                          wrapperStyle={{
                            fontSize: 11,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="income"
                          name="Income"
                          stroke="#6D28D9"
                          strokeWidth={2.5}
                          dot={{
                            r: 3,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="expense"
                          name="Expenses"
                          stroke="#F97316"
                          strokeWidth={2.5}
                          dot={{
                            r: 3,
                          }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </ReportCard>

              {/* TOP CATEGORIES */}

              <ReportCard
                title="Top Spending Categories"
                subtitle="Highest expense categories"
                rightText={selectedMonthName}
              >
                <div className="space-y-2.5 sm:space-y-4">
                  {topCategories.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400 sm:text-sm">
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
                          <div className="mb-1 flex items-center justify-between sm:mb-1.5">
                            <div className="flex min-w-0 items-center gap-2">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-50 text-[10px] font-bold text-purple-600 sm:h-7 sm:w-7 sm:text-xs">
                                {index + 1}
                              </span>

                              <span className="truncate text-[11px] font-medium text-slate-800 sm:text-sm">
                                {category.name}
                              </span>
                            </div>

                            <span className="ml-2 shrink-0 text-xs font-semibold text-slate-900 sm:text-sm">
                              {formatCurrency(category.amount)}
                            </span>
                          </div>

                          <div className="ml-8 h-1.5 overflow-hidden rounded-full bg-slate-100 sm:ml-10 sm:h-2">
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
              </ReportCard>
            </div>

            {/* ==================================================
                INSIGHTS + HIGH VALUE
            ================================================== */}

            <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-2">
              {/* INSIGHTS */}

              <ReportCard
                title="Spending Insights"
                subtitle="Quick insights from your financial activity"
              >
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <InsightCard
                    icon={<TrendingUp size={16} />}
                    iconClass="bg-emerald-100 text-emerald-600"
                    value={formatCurrency(income)}
                    valueClass="text-emerald-600"
                    label="Total income this month"
                  />

                  <InsightCard
                    icon={<TrendingDown size={16} />}
                    iconClass="bg-red-100 text-red-600"
                    value={formatCurrency(expense)}
                    valueClass="text-red-600"
                    label="Total expenses this month"
                  />

                  <InsightCard
                    icon={<CreditCard size={16} />}
                    iconClass="bg-blue-100 text-blue-600"
                    value={topCategories[0]?.name || "No data"}
                    valueClass="text-blue-600"
                    label="Most spent category"
                  />

                  <InsightCard
                    icon={<PiggyBank size={16} />}
                    iconClass="bg-purple-100 text-purple-600"
                    value={formatCurrency(savings)}
                    valueClass={
                      savings >= 0 ? "text-purple-600" : "text-red-600"
                    }
                    label="Net savings"
                  />
                </div>
              </ReportCard>

              {/* HIGH VALUE */}

              <ReportCard
                title="Recent High Value Transactions"
                subtitle="Your largest transactions"
                icon={<CircleDollarSign size={18} />}
              >
                {highValueTransactions.length === 0 ? (
                  <div className="py-10 text-center text-xs text-slate-400 sm:text-sm">
                    No transaction data available
                  </div>
                ) : (
                  <div className="w-full overflow-x-auto">
                    <table className="w-full min-w-[560px]">
                      <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                          <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 sm:px-5 sm:py-3 sm:text-xs">
                            Date
                          </th>

                          <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 sm:px-5 sm:py-3 sm:text-xs">
                            Description
                          </th>

                          <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 sm:px-5 sm:py-3 sm:text-xs">
                            Category
                          </th>

                          <th className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-500 sm:px-5 sm:py-3 sm:text-xs">
                            Account
                          </th>

                          <th className="px-3 py-2.5 text-right text-[10px] font-semibold text-slate-500 sm:px-5 sm:py-3 sm:text-xs">
                            Amount
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {highValueTransactions.map((transaction) => {
                          const amount = getExpenseAmount(transaction);

                          const type = String(
                            transaction?.type || "EXPENSE",
                          ).toUpperCase();

                          const isIncome = type === "INCOME";

                          return (
                            <tr
                              key={getExpenseId(transaction)}
                              className="border-b border-slate-50 last:border-0"
                            >
                              <td className="whitespace-nowrap px-3 py-2.5 text-[10px] text-slate-500 sm:px-5 sm:py-3 sm:text-xs">
                                {formatDate(
                                  transaction.date || transaction.createdAt,
                                )}
                              </td>

                              <td className="max-w-[140px] truncate px-3 py-2.5 text-xs font-medium text-slate-800 sm:max-w-[160px] sm:px-5 sm:py-3 sm:text-sm">
                                {getExpenseDescription(transaction)}
                              </td>

                              <td className="px-3 py-2.5 text-[10px] text-slate-600 sm:px-5 sm:py-3 sm:text-xs">
                                {getExpenseCategory(transaction)}
                              </td>

                              <td className="px-3 py-2.5 text-[10px] text-slate-600 sm:px-5 sm:py-3 sm:text-xs">
                                {getExpenseAccount(transaction)}
                              </td>

                              <td
                                className={`whitespace-nowrap px-3 py-2.5 text-right text-xs font-semibold sm:px-5 sm:py-3 sm:text-sm ${
                                  isIncome ? "text-emerald-600" : "text-red-500"
                                }`}
                              >
                                {isIncome ? "+" : "-"} {formatCurrency(amount)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </ReportCard>
            </div>

            {/* ==================================================
                CATEGORY BREAKDOWN
            ================================================== */}

            <ReportCard
              title="Category Breakdown"
              subtitle={`Detailed spending for ${selectedMonthName} ${year}`}
            >
              {categories.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 sm:py-10 sm:text-sm">
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
                        className="flex flex-col gap-2 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-4"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />

                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800 sm:text-sm">
                              {category.name}
                            </p>

                            <p className="text-[10px] text-slate-400 sm:text-xs">
                              {category.count || 0} transactions
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pl-4 sm:justify-end sm:gap-5 sm:pl-0">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 sm:w-32 sm:flex-none sm:h-2">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>

                          <span className="w-20 text-right text-xs font-semibold text-slate-900 sm:w-24 sm:text-sm">
                            {formatCurrency(amount)}
                          </span>

                          <span className="w-9 text-right text-[10px] text-slate-400 sm:w-12 sm:text-xs">
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ReportCard>

            {/* FOOTER */}

            <div className="py-3 text-center sm:py-4">
              <p className="text-[10px] text-slate-400 sm:text-xs">
                Expense Tracker • Financial Reports
              </p>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
};

// ======================================================
// SUMMARY CARD
// ======================================================

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  bottom,
  valueClass = "text-slate-900",
}) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] text-slate-500 sm:text-sm">
            {title}
          </p>

          <h3
            className={`mt-1.5 truncate text-base font-bold sm:mt-2 sm:text-2xl ${valueClass}`}
          >
            {value}
          </h3>
        </div>

        <div className={`shrink-0 rounded-full p-2 sm:p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-1.5 text-[10px] sm:mt-4 sm:text-xs">
        {bottom || <span className="truncate text-slate-400">{subtitle}</span>}

        {bottom && <span className="truncate text-slate-400">{subtitle}</span>}
      </div>
    </div>
  );
};

// ======================================================
// REPORT CARD
// ======================================================

const ReportCard = ({ title, subtitle, icon, rightText, children }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="mb-3 flex items-start justify-between gap-2 sm:mb-5">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold text-slate-900 sm:text-base">
            {title}
          </h3>

          {subtitle && (
            <p className="mt-0.5 truncate text-[10px] text-slate-500 sm:mt-1 sm:text-xs">
              {subtitle}
            </p>
          )}
        </div>

        {rightText ? (
          <span className="shrink-0 text-[10px] font-semibold text-purple-600 sm:text-xs">
            {rightText}
          </span>
        ) : (
          icon && <div className="shrink-0 text-purple-600">{icon}</div>
        )}
      </div>

      {children}
    </div>
  );
};

// ======================================================
// FILTER BOX
// ======================================================

const FilterBox = ({ label, children }) => {
  return (
    <div className="min-w-0">
      <label className="mb-1 block text-[10px] font-medium text-slate-500 sm:mb-1.5 sm:text-xs">
        {label}
      </label>

      {children}
    </div>
  );
};

// ======================================================
// INSIGHT CARD
// ======================================================

const InsightCard = ({ icon, iconClass, value, valueClass, label }) => {
  return (
    <div className="min-w-0 rounded-lg border border-slate-100 bg-slate-50 p-2.5 sm:rounded-xl sm:p-4">
      <div
        className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full sm:mb-3 sm:h-9 sm:w-9 ${iconClass}`}
      >
        {icon}
      </div>

      <p className={`truncate text-sm font-bold sm:text-xl ${valueClass}`}>
        {value}
      </p>

      <p className="mt-1 line-clamp-2 text-[10px] text-slate-500 sm:text-xs">
        {label}
      </p>
    </div>
  );
};

// ======================================================
// EMPTY CHART
// ======================================================

const EmptyChart = ({ text }) => {
  return (
    <div className="flex h-full items-center justify-center text-xs text-slate-400 sm:text-sm">
      {text}
    </div>
  );
};

export default Reports;
