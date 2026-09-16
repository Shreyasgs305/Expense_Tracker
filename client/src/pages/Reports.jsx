import { useEffect, useState } from "react";

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

const Reports = () => {
  // ==========================================
  // CURRENT DATE
  // ==========================================

  const currentDate = new Date();

  // ==========================================
  // FILTER STATES
  // ==========================================

  const [year, setYear] = useState(currentDate.getFullYear());

  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  // ==========================================
  // REPORT STATES
  // ==========================================

  const [summary, setSummary] = useState(null);

  const [categories, setCategories] = useState([]);

  const [monthly, setMonthly] = useState([]);

  const [accounts, setAccounts] = useState([]);

  const [trends, setTrends] = useState([]);

  // ==========================================
  // UI STATES
  // ==========================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================
  // FORMAT CURRENCY
  // ==========================================

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));
  };

  // ==========================================
  // LOAD REPORTS
  // ==========================================

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
      ]);

      // Summary

      setSummary(summaryResponse.data);

      // Categories

      setCategories(categoryResponse.data?.categories || []);

      // Monthly

      setMonthly(monthlyResponse.data?.monthly || []);

      // Accounts

      setAccounts(accountResponse.data?.accounts || []);

      // Trends

      setTrends(trendsResponse.data?.trends || []);
    } catch (err) {
      console.error("Reports error:", err);

      setError(err.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOAD WHEN FILTER CHANGES
  // ==========================================

  useEffect(() => {
    loadReports();
  }, [year, month]);

  // ==========================================
  // SELECTED MONTH NAME
  // ==========================================

  const selectedMonthName = new Date(year, month - 1, 1).toLocaleString(
    "en-US",
    {
      month: "long",
    },
  );

  // ==========================================
  // CATEGORY CHART DATA
  // ==========================================

  const categoryChartData = categories.map((category) => ({
    name: category.name,
    value: Number(category.amount || 0),
  }));

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ======================================
            HEADER
        ====================================== */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

            <p className="mt-1 text-sm text-gray-500">
              Analyze your income and expenses
            </p>
          </div>

          {/* FILTERS */}

          <div className="flex gap-3">
            {/* MONTH */}

            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {Array.from({ length: 12 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  {new Date(2000, index, 1).toLocaleString("en-US", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>

            {/* YEAR */}

            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {Array.from({ length: 5 }, (_, index) => {
                const selectedYear = currentDate.getFullYear() - index;

                return (
                  <option key={selectedYear} value={selectedYear}>
                    {selectedYear}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ======================================
            LOADING
        ====================================== */}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

              <p className="mt-3 text-sm text-gray-500">Loading reports...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================
                SUMMARY CARDS
            ================================== */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* INCOME */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Income</p>

                <p className="mt-2 text-2xl font-bold text-green-600">
                  {formatCurrency(summary?.income)}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {summary?.incomeCount || 0} transactions
                </p>
              </div>

              {/* EXPENSE */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Expenses</p>

                <p className="mt-2 text-2xl font-bold text-red-600">
                  {formatCurrency(summary?.expense)}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {summary?.expenseCount || 0} transactions
                </p>
              </div>

              {/* SAVINGS */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Savings</p>

                <p
                  className={`mt-2 text-2xl font-bold ${
                    Number(summary?.savings || 0) >= 0
                      ? "text-blue-600"
                      : "text-red-600"
                  }`}
                >
                  {formatCurrency(summary?.savings)}
                </p>

                <p className="mt-1 text-xs text-gray-400">Income − Expenses</p>
              </div>

              {/* TRANSACTIONS */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <p className="text-sm text-gray-500">Transactions</p>

                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {summary?.transactionCount || 0}
                </p>

                <p className="mt-1 text-xs text-gray-400">
                  {selectedMonthName} {year}
                </p>
              </div>
            </div>

            {/* ==================================
                MONTHLY INCOME / EXPENSE
            ================================== */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Monthly Income & Expenses
                </h2>

                <p className="text-sm text-gray-500">{year}</p>
              </div>

              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="monthName" />

                    <YAxis />

                    <Tooltip formatter={(value) => formatCurrency(value)} />

                    <Legend />

                    <Bar dataKey="income" name="Income" />

                    <Bar dataKey="expense" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ==================================
                CATEGORY + ACCOUNT
            ================================== */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* CATEGORY */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Spending by Category
                  </h2>

                  <p className="text-sm text-gray-500">
                    {selectedMonthName} {year}
                  </p>
                </div>

                {categoryChartData.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-sm text-gray-400">No expense data</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryChartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label
                        >
                          {categoryChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} />
                          ))}
                        </Pie>

                        <Tooltip formatter={(value) => formatCurrency(value)} />

                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* ACCOUNT */}

              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Spending by Account
                  </h2>

                  <p className="text-sm text-gray-500">
                    {selectedMonthName} {year}
                  </p>
                </div>

                {accounts.length === 0 ? (
                  <div className="flex h-[300px] items-center justify-center">
                    <p className="text-sm text-gray-400">No expense data</p>
                  </div>
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={accounts} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis type="number" />

                        <YAxis type="category" dataKey="name" width={100} />

                        <Tooltip formatter={(value) => formatCurrency(value)} />

                        <Bar dataKey="amount" name="Expenses" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* ==================================
                SPENDING TREND
            ================================== */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Spending Trend
                </h2>

                <p className="text-sm text-gray-500">Last 6 months</p>
              </div>

              <div className="h-[350px]">
                {trends.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="text-sm text-gray-400">
                      No trend data available
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trends}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis dataKey="monthName" />

                      <YAxis />

                      <Tooltip formatter={(value) => formatCurrency(value)} />

                      <Legend />

                      <Line
                        type="monotone"
                        dataKey="income"
                        name="Income"
                        strokeWidth={2}
                      />

                      <Line
                        type="monotone"
                        dataKey="expense"
                        name="Expenses"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* ==================================
                CATEGORY BREAKDOWN
            ================================== */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 p-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Category Breakdown
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedMonthName} {year}
                </p>
              </div>

              {categories.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-400">
                  No category expenses for this month.
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <div
                      key={category.categoryId}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {category.name}
                        </p>

                        <p className="text-xs text-gray-500">
                          {category.count} transactions
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          {formatCurrency(category.amount)}
                        </p>

                        <p className="text-xs text-gray-500">
                          {category.percentage}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
