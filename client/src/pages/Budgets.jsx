import { useEffect, useMemo, useState } from "react";

import PageLayout from "../components/layout/PageLayout";
import AddBudgetModal from "../components/budgets/AddBudgetModal";

import {
  WalletCards,
  TrendingUp,
  PieChart as PieChartIcon,
  AlertTriangle,
  CheckCircle2,
  Pencil,
  Trash2,
  Plus,
  CalendarDays,
  Target,
  Lightbulb,
  ArrowUpRight,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
} from "../api/budgetApi";

import { getCategories } from "../api/categoryApi";

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
  "#8B5CF6",
  "#14B8A6",
];

// ======================================================
// HELPERS
// ======================================================

const getNumber = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "object" && value.$numberDecimal !== undefined) {
    return Number(value.$numberDecimal) || 0;
  }

  return Number(value) || 0;
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(getNumber(value));
};

const getCurrentMonth = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
};

const getCategoryName = (budget) => {
  if (budget.categoryId && typeof budget.categoryId === "object") {
    return budget.categoryId.name || "Unknown";
  }

  return "Unknown";
};

const getCategoryIcon = (budget) => {
  if (budget.categoryId && typeof budget.categoryId === "object") {
    return budget.categoryId.icon || null;
  }

  return null;
};

// ======================================================
// COMPONENT
// ======================================================

const Budgets = () => {
  // ====================================================
  // FILTER
  // ====================================================

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  // ====================================================
  // DATA
  // ====================================================

  const [budgets, setBudgets] = useState([]);

  const [categories, setCategories] = useState([]);

  const [expenses, setExpenses] = useState([]);

  // ====================================================
  // UI
  // ====================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [editingBudget, setEditingBudget] = useState(null);

  const [deletingId, setDeletingId] = useState(null);

  // ====================================================
  // LOAD DATA
  // ====================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetResponse, categoryResponse, expenseResponse] =
        await Promise.all([
          getBudgets({
            month: selectedMonth,
          }),

          getCategories(),

          getExpenses({
            month: Number(selectedMonth.split("-")[1]),
            year: Number(selectedMonth.split("-")[0]),
          }).catch(() => null),
        ]);

      // ------------------------------
      // BUDGETS
      // ------------------------------

      setBudgets(budgetResponse?.data || []);

      // ------------------------------
      // CATEGORIES
      // ------------------------------

      const categoryData =
        categoryResponse?.data?.categories || categoryResponse?.data || [];

      setCategories(Array.isArray(categoryData) ? categoryData : []);

      // ------------------------------
      // EXPENSES
      // ------------------------------

      const expenseData =
        expenseResponse?.data?.expenses || expenseResponse?.data || [];

      setExpenses(Array.isArray(expenseData) ? expenseData : []);
    } catch (err) {
      console.error("Budget page error:", err);

      setError(err.response?.data?.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth]);

  // ====================================================
  // BUDGET TOTALS
  // ====================================================

  const totalBudget = useMemo(() => {
    return budgets.reduce(
      (total, budget) => total + getNumber(budget.amount),
      0,
    );
  }, [budgets]);

  const totalSpent = useMemo(() => {
    return budgets.reduce(
      (total, budget) => total + getNumber(budget.spent),
      0,
    );
  }, [budgets]);

  const totalRemaining = Math.max(totalBudget - totalSpent, 0);

  const overallPercentage =
    totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  // ====================================================
  // OVER BUDGET
  // ====================================================

  const overBudgetItems = useMemo(() => {
    return budgets.filter((budget) => {
      const amount = getNumber(budget.amount);

      const spent = getNumber(budget.spent);

      return amount > 0 && spent > amount;
    });
  }, [budgets]);

  const overBudgetAmount = useMemo(() => {
    return overBudgetItems.reduce(
      (total, budget) =>
        total + Math.max(getNumber(budget.spent) - getNumber(budget.amount), 0),
      0,
    );
  }, [overBudgetItems]);

  // ====================================================
  // BUDGET STATUS
  // ====================================================

  const getBudgetPercentage = (budget) => {
    const amount = getNumber(budget.amount);

    const spent = getNumber(budget.spent);

    if (amount <= 0) {
      return 0;
    }

    return (spent / amount) * 100;
  };

  const getBudgetStatus = (budget) => {
    const percentage = getBudgetPercentage(budget);

    if (percentage >= 100) {
      return {
        label: "Over Budget",
        className: "bg-red-50 text-red-600",
      };
    }

    const alertPercentage = getNumber(budget.alertPercentage) || 80;

    if (percentage >= alertPercentage) {
      return {
        label: "At Risk",
        className: "bg-orange-50 text-orange-600",
      };
    }

    return {
      label: "On Track",
      className: "bg-emerald-50 text-emerald-600",
    };
  };

  // ====================================================
  // TOP BUDGET USAGE
  // ====================================================

  const topBudgetUsage = useMemo(() => {
    return [...budgets]
      .sort((a, b) => getBudgetPercentage(b) - getBudgetPercentage(a))
      .slice(0, 5);
  }, [budgets]);

  // ====================================================
  // PIE CHART
  // ====================================================

  const pieData = [
    {
      name: "Spent",
      value: totalSpent,
    },
    {
      name: "Remaining",
      value: totalRemaining,
    },
  ];

  // ====================================================
  // BUDGET TREND
  // ====================================================

  const budgetTrend = useMemo(() => {
    const daysInMonth = new Date(
      Number(selectedMonth.split("-")[0]),
      Number(selectedMonth.split("-")[1]),
      0,
    ).getDate();

    const spentByDay = {};

    expenses.forEach((expense) => {
      const dateValue = expense.date || expense.createdAt;

      if (!dateValue) return;

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const day = date.getDate();

      spentByDay[day] = (spentByDay[day] || 0) + getNumber(expense.amount);
    });

    const result = [];

    let runningSpent = 0;

    const points = [1, 5, 10, 15, 20, 25, daysInMonth];

    points.forEach((day) => {
      if (day > daysInMonth) return;

      runningSpent +=
        Object.keys(spentByDay)
          .filter((key) => Number(key) <= day)
          .reduce((sum, key) => sum + spentByDay[key], 0) -
        Object.keys(spentByDay)
          .filter((key) => Number(key) < day)
          .reduce((sum, key) => sum + spentByDay[key], 0);

      result.push({
        day: `${selectedMonth.split("-")[1].replace(/^0/, "")}/${day}`,
        budget: totalBudget,
        spent: runningSpent,
        remaining: Math.max(totalBudget - runningSpent, 0),
      });
    });

    return result;
  }, [expenses, totalBudget, selectedMonth]);

  // ====================================================
  // ADD BUDGET
  // ====================================================

  const handleAddBudget = () => {
    setEditingBudget(null);
    setShowModal(true);
  };

  // ====================================================
  // EDIT BUDGET
  // ====================================================

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  // ====================================================
  // SAVE BUDGET
  // ====================================================

  const handleSubmitBudget = async (budgetData) => {
    try {
      if (editingBudget) {
        await updateBudget(editingBudget._id, budgetData);
      } else {
        await createBudget(budgetData);
      }

      setShowModal(false);
      setEditingBudget(null);

      await loadData();
    } catch (err) {
      console.error("Save budget error:", err);

      throw err;
    }
  };

  // ====================================================
  // DELETE
  // ====================================================

  const handleDeleteBudget = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);

      await deleteBudget(id);

      await loadData();
    } catch (err) {
      console.error("Delete budget error:", err);

      setError(err.response?.data?.message || "Failed to delete budget");
    } finally {
      setDeletingId(null);
    }
  };

  // ====================================================
  // MONTH LABEL
  // ====================================================

  const monthLabel = new Date(
    Number(selectedMonth.split("-")[0]),
    Number(selectedMonth.split("-")[1]) - 1,
    1,
  ).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <PageLayout
      title="Budgets"
      subtitle="Plan your spending and track your budget"
    >
      <div className="mx-auto max-w-[1400px] space-y-5">
        {/* ==================================================
            TOP ACTIONS
        ================================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
            <CalendarDays size={18} className="text-slate-500" />

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-sm font-semibold text-slate-800 outline-none"
            />
          </div>

          <button
            onClick={handleAddBudget}
            className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-700"
          >
            <Plus size={18} />
            Add Budget
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ==================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* TOTAL BUDGET */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Budget</p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalBudget)}
                </h3>
              </div>

              <div className="rounded-full bg-blue-50 p-3 text-blue-600">
                <WalletCards size={22} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-blue-600">
              {monthLabel}
            </p>
          </div>

          {/* TOTAL SPENT */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Total Spent</p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalSpent)}
                </h3>
              </div>

              <div className="rounded-full bg-emerald-50 p-3 text-emerald-600">
                <TrendingUp size={22} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-emerald-600">
              {overallPercentage.toFixed(2)}% of budget
            </p>
          </div>

          {/* REMAINING */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Remaining</p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(totalRemaining)}
                </h3>
              </div>

              <div className="rounded-full bg-amber-50 p-3 text-amber-500">
                <PieChartIcon size={22} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-amber-600">
              {Math.max(100 - overallPercentage, 0).toFixed(2)}% left
            </p>
          </div>

          {/* OVER BUDGET */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">Over Budget</p>

                <h3 className="mt-2 text-2xl font-bold text-slate-900">
                  {formatCurrency(overBudgetAmount)}
                </h3>
              </div>

              <div className="rounded-full bg-purple-50 p-3 text-purple-600">
                <Target size={22} />
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold text-purple-600">
              {overBudgetItems.length} Categories
            </p>
          </div>
        </div>

        {/* ==================================================
            MAIN CONTENT
        ================================================== */}

        {loading ? (
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600" />

              <p className="mt-3 text-sm text-slate-500">Loading budgets...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="space-y-5">
              {/* BUDGET OVERVIEW */}

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 p-5">
                  <div>
                    <h2 className="font-bold text-slate-900">
                      Budget Overview
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">{monthLabel}</p>
                  </div>

                  <button
                    onClick={handleAddBudget}
                    className="flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700"
                  >
                    <Plus size={16} />
                    Add Budget
                  </button>
                </div>

                {budgets.length === 0 ? (
                  <div className="p-12 text-center">
                    <WalletCards size={40} className="mx-auto text-slate-300" />

                    <h3 className="mt-4 font-semibold text-slate-700">
                      No budgets yet
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      Create your first budget for this month.
                    </p>

                    <button
                      onClick={handleAddBudget}
                      className="mt-5 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-purple-700"
                    >
                      Add Budget
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px]">
                      <thead>
                        <tr className="bg-slate-50">
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Category
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                            Budget
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                            Spent
                          </th>

                          <th className="px-5 py-3 text-right text-xs font-semibold text-slate-500">
                            Remaining
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Progress
                          </th>

                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500">
                            Status
                          </th>

                          <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {budgets.map((budget, index) => {
                          const budgetAmount = getNumber(budget.amount);

                          const spent = getNumber(budget.spent);

                          const remaining = Math.max(budgetAmount - spent, 0);

                          const percentage = getBudgetPercentage(budget);

                          const status = getBudgetStatus(budget);

                          const icon = getCategoryIcon(budget);

                          return (
                            <tr
                              key={budget._id}
                              className="border-t border-slate-100 transition hover:bg-slate-50"
                            >
                              {/* CATEGORY */}

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                                    {icon ? (
                                      <span>{icon}</span>
                                    ) : (
                                      <WalletCards size={18} />
                                    )}
                                  </div>

                                  <span className="text-sm font-semibold text-slate-800">
                                    {getCategoryName(budget)}
                                  </span>
                                </div>
                              </td>

                              {/* BUDGET */}

                              <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                                {formatCurrency(budgetAmount)}
                              </td>

                              {/* SPENT */}

                              <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                                {formatCurrency(spent)}
                              </td>

                              {/* REMAINING */}

                              <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                                {formatCurrency(remaining)}
                              </td>

                              {/* PROGRESS */}

                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
                                    <div
                                      className={`h-full rounded-full ${
                                        percentage >= 100
                                          ? "bg-red-500"
                                          : percentage >=
                                              (getNumber(
                                                budget.alertPercentage,
                                              ) || 80)
                                            ? "bg-orange-500"
                                            : "bg-purple-600"
                                      }`}
                                      style={{
                                        width: `${Math.min(percentage, 100)}%`,
                                      }}
                                    />
                                  </div>

                                  <span className="text-xs font-semibold text-slate-600">
                                    {percentage.toFixed(0)}%
                                  </span>
                                </div>
                              </td>

                              {/* STATUS */}

                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                >
                                  {status.label === "On Track" ? (
                                    <CheckCircle2 size={12} />
                                  ) : (
                                    <AlertTriangle size={12} />
                                  )}

                                  {status.label}
                                </span>
                              </td>

                              {/* ACTIONS */}

                              <td className="px-5 py-4">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleEditBudget(budget)}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-purple-50 hover:text-purple-600"
                                    title="Edit"
                                  >
                                    <Pencil size={16} />
                                  </button>

                                  <button
                                    onClick={() =>
                                      handleDeleteBudget(budget._id)
                                    }
                                    disabled={deletingId === budget._id}
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}

                        {/* TOTAL */}

                        <tr className="border-t border-slate-200 bg-slate-50">
                          <td className="px-5 py-4">
                            <button
                              onClick={handleAddBudget}
                              className="flex items-center gap-1 text-sm font-semibold text-purple-600"
                            >
                              <Plus size={16} />
                              Add Budget
                            </button>
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(totalBudget)}
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(totalSpent)}
                          </td>

                          <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(totalRemaining)}
                          </td>

                          <td></td>

                          <td></td>

                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* BUDGET TREND */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-slate-900">Budget Trend</h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Spending progress for {monthLabel}
                    </p>
                  </div>
                </div>

                <div className="h-[300px]">
                  {budgetTrend.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No trend data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={budgetTrend}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />

                        <XAxis
                          dataKey="day"
                          tick={{
                            fontSize: 11,
                          }}
                        />

                        <YAxis
                          tick={{
                            fontSize: 11,
                          }}
                        />

                        <Tooltip formatter={(value) => formatCurrency(value)} />

                        <Legend />

                        <Line
                          type="monotone"
                          dataKey="budget"
                          name="Budget"
                          stroke="#6D28D9"
                          strokeWidth={2}
                          strokeDasharray="6 5"
                          dot={false}
                        />

                        <Line
                          type="monotone"
                          dataKey="spent"
                          name="Spent"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={{
                            r: 3,
                          }}
                        />

                        <Line
                          type="monotone"
                          dataKey="remaining"
                          name="Remaining"
                          stroke="#94A3B8"
                          strokeWidth={2}
                          strokeDasharray="3 3"
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div className="space-y-5">
              {/* BUDGET VS ACTUAL */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-slate-900">Budget vs Actual</h2>

                <div className="mt-4 h-[260px]">
                  {totalBudget === 0 ? (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      No budget data
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={95}
                          paddingAngle={2}
                        >
                          <Cell fill="#6D28D9" />

                          <Cell fill="#10B981" />
                        </Pie>

                        <Tooltip formatter={(value) => formatCurrency(value)} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-purple-600" />

                      <span className="text-sm text-slate-600">Spent</span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(totalSpent)}
                      </p>

                      <p className="text-xs text-slate-400">
                        {overallPercentage.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full bg-emerald-500" />

                      <span className="text-sm text-slate-600">Remaining</span>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">
                        {formatCurrency(totalRemaining)}
                      </p>

                      <p className="text-xs text-slate-400">
                        {Math.max(100 - overallPercentage, 0).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* TOP BUDGET USAGE */}

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-bold text-slate-900">Top Budget Usage</h2>

                <div className="mt-5 space-y-5">
                  {topBudgetUsage.length === 0 ? (
                    <p className="py-6 text-center text-sm text-slate-400">
                      No budget data
                    </p>
                  ) : (
                    topBudgetUsage.map((budget, index) => {
                      const percentage = getBudgetPercentage(budget);

                      return (
                        <div key={budget._id}>
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                              {getCategoryName(budget)}
                            </span>

                            <span className="text-xs font-bold text-slate-600">
                              {percentage.toFixed(0)}%
                            </span>
                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${Math.min(percentage, 100)}%`,
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* BUDGET TIPS */}

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-white p-2 text-emerald-600 shadow-sm">
                    <Lightbulb size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">Budget Tips</h2>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {overallPercentage < 80
                        ? "You're doing great! Try to keep your spending under 80% of your budget to save more."
                        : overallPercentage < 100
                          ? "You're getting close to your budget limit. Keep an eye on your remaining spending."
                          : "You've reached your overall budget limit. Consider reviewing your spending categories."}
                    </p>
                  </div>
                </div>
              </div>

              {/* QUICK ACTION */}

              <button
                onClick={handleAddBudget}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-purple-300 bg-purple-50 px-4 py-4 text-sm font-semibold text-purple-700 transition hover:bg-purple-100"
              >
                <Plus size={18} />
                Create Another Budget
              </button>
            </div>
          </div>
        )}

        {/* ==================================================
            MODAL
        ================================================== */}

        {showModal && (
          <AddBudgetModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingBudget(null);
            }}
            onSubmit={handleSubmitBudget}
            editingBudget={editingBudget}
            categories={categories.filter(
              (category) => category.type === "EXPENSE",
            )}
          />
        )}
      </div>
    </PageLayout>
  );
};

export default Budgets;
