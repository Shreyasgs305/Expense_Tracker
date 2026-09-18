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

      const year = Number(selectedMonth.split("-")[0]);

      const month = Number(selectedMonth.split("-")[1]);

      const [budgetResponse, categoryResponse, expenseResponse] =
        await Promise.all([
          getBudgets({
            month: selectedMonth,
          }),

          getCategories(),

          getExpenses({
            month,
            year,
          }).catch(() => null),
        ]);

      // BUDGETS

      setBudgets(
        Array.isArray(budgetResponse?.data) ? budgetResponse.data : [],
      );

      // CATEGORIES

      const categoryData =
        categoryResponse?.data?.categories || categoryResponse?.data || [];

      setCategories(Array.isArray(categoryData) ? categoryData : []);

      // EXPENSES

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
  // TOTALS
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
  // STATUS
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
  // TOP USAGE
  // ====================================================

  const topBudgetUsage = useMemo(() => {
    return [...budgets]
      .sort((a, b) => getBudgetPercentage(b) - getBudgetPercentage(a))
      .slice(0, 5);
  }, [budgets]);

  // ====================================================
  // PIE
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
    const year = Number(selectedMonth.split("-")[0]);

    const month = Number(selectedMonth.split("-")[1]);

    const daysInMonth = new Date(year, month, 0).getDate();

    const spentByDay = {};

    expenses.forEach((expense) => {
      if (expense?.type && String(expense.type).toUpperCase() !== "EXPENSE") {
        return;
      }

      const dateValue = expense.date || expense.createdAt;

      if (!dateValue) {
        return;
      }

      const date = new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const day = date.getDate();

      spentByDay[day] = (spentByDay[day] || 0) + getNumber(expense.amount);
    });

    const points = [1, 5, 10, 15, 20, 25, daysInMonth];

    let runningSpent = 0;
    let previousDay = 0;

    return points
      .filter((day) => day <= daysInMonth)
      .map((day) => {
        for (
          let currentDay = previousDay + 1;
          currentDay <= day;
          currentDay++
        ) {
          runningSpent += spentByDay[currentDay] || 0;
        }

        previousDay = day;

        return {
          day: `${month}/${day}`,
          budget: totalBudget,
          spent: runningSpent,
          remaining: Math.max(totalBudget - runningSpent, 0),
        };
      });
  }, [expenses, totalBudget, selectedMonth]);

  // ====================================================
  // ACTIONS
  // ====================================================

  const handleAddBudget = () => {
    setEditingBudget(null);
    setShowModal(true);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

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

  const handleDeleteBudget = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?",
    );

    if (!confirmed) {
      return;
    }

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
      <div className="mx-auto w-full max-w-[1400px] space-y-3 overflow-hidden sm:space-y-4 lg:space-y-5">
        {/* ==================================================
            TOP ACTIONS
        ================================================== */}

        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
          {/* MONTH */}

          <div className="flex w-full items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 shadow-sm sm:w-auto sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5">
            <CalendarDays
              size={16}
              className="shrink-0 text-slate-500 sm:h-[18px] sm:w-[18px]"
            />

            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-slate-800 outline-none sm:text-sm"
            />
          </div>

          {/* ADD */}

          <button
            type="button"
            onClick={handleAddBudget}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-purple-700 active:bg-purple-800 sm:w-auto sm:gap-2 sm:rounded-xl sm:px-5 sm:py-3 sm:text-sm"
          >
            <Plus size={16} />
            Add Budget
          </button>
        </div>

        {/* ERROR */}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 sm:rounded-xl sm:px-4 sm:py-3 sm:text-sm">
            {error}
          </div>
        )}

        {/* ==================================================
            SUMMARY
        ================================================== */}

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {/* TOTAL BUDGET */}

          <SummaryCard
            title="Total Budget"
            value={formatCurrency(totalBudget)}
            subtitle={monthLabel}
            icon={<WalletCards size={18} />}
            iconClass="bg-blue-50 text-blue-600"
            subtitleClass="text-blue-600"
          />

          {/* SPENT */}

          <SummaryCard
            title="Total Spent"
            value={formatCurrency(totalSpent)}
            subtitle={`${overallPercentage.toFixed(1)}% of budget`}
            icon={<TrendingUp size={18} />}
            iconClass="bg-emerald-50 text-emerald-600"
            subtitleClass="text-emerald-600"
          />

          {/* REMAINING */}

          <SummaryCard
            title="Remaining"
            value={formatCurrency(totalRemaining)}
            subtitle={`${Math.max(100 - overallPercentage, 0).toFixed(
              1,
            )}% left`}
            icon={<PieChartIcon size={18} />}
            iconClass="bg-amber-50 text-amber-500"
            subtitleClass="text-amber-600"
          />

          {/* OVER BUDGET */}

          <SummaryCard
            title="Over Budget"
            value={formatCurrency(overBudgetAmount)}
            subtitle={`${overBudgetItems.length} ${
              overBudgetItems.length === 1 ? "Category" : "Categories"
            }`}
            icon={<Target size={18} />}
            iconClass="bg-purple-50 text-purple-600"
            subtitleClass="text-purple-600"
          />
        </div>

        {/* ==================================================
            LOADING
        ================================================== */}

        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white sm:min-h-[400px] sm:rounded-2xl">
            <div className="text-center">
              <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-purple-600 sm:h-10 sm:w-10" />

              <p className="mt-3 text-xs text-slate-500 sm:text-sm">
                Loading budgets...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ==================================================
                MAIN CONTENT
            ================================================== */}

            <div className="grid grid-cols-1 gap-3 sm:gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
              {/* =================================================
                  LEFT
              ================================================= */}

              <div className="min-w-0 space-y-3 sm:space-y-4 lg:space-y-5">
                {/* ==================================================
                    BUDGET OVERVIEW
                ================================================== */}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
                  {/* HEADER */}

                  <div className="flex items-center justify-between border-b border-slate-100 px-3 py-3 sm:px-5 sm:py-4">
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                        Budget Overview
                      </h2>

                      <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-xs">
                        {monthLabel}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddBudget}
                      className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-purple-600 sm:gap-1.5 sm:text-sm"
                    >
                      <Plus size={14} />
                      <span className="hidden xs:inline sm:inline">
                        Add Budget
                      </span>
                    </button>
                  </div>

                  {/* EMPTY */}

                  {budgets.length === 0 ? (
                    <div className="px-4 py-10 text-center sm:p-12">
                      <WalletCards
                        size={36}
                        className="mx-auto text-slate-300 sm:h-10 sm:w-10"
                      />

                      <h3 className="mt-3 text-sm font-semibold text-slate-700 sm:mt-4 sm:text-base">
                        No budgets yet
                      </h3>

                      <p className="mt-1 text-xs text-slate-400 sm:text-sm">
                        Create your first budget for this month.
                      </p>

                      <button
                        type="button"
                        onClick={handleAddBudget}
                        className="mt-4 rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white hover:bg-purple-700 sm:mt-5 sm:rounded-xl sm:px-5 sm:py-2.5 sm:text-sm"
                      >
                        Add Budget
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* ==================================================
                          MOBILE CARDS
                      ================================================== */}

                      <div className="divide-y divide-slate-100 sm:hidden">
                        {budgets.map((budget) => {
                          const amount = getNumber(budget.amount);

                          const spent = getNumber(budget.spent);

                          const remaining = Math.max(amount - spent, 0);

                          const percentage = getBudgetPercentage(budget);

                          const status = getBudgetStatus(budget);

                          const icon = getCategoryIcon(budget);

                          return (
                            <div key={budget._id} className="px-3 py-3.5">
                              {/* TOP */}

                              <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                  {icon ? (
                                    <span className="text-base">{icon}</span>
                                  ) : (
                                    <WalletCards size={17} />
                                  )}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-semibold text-slate-800">
                                    {getCategoryName(budget)}
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    Budget {formatCurrency(amount)}
                                  </p>
                                </div>

                                <span
                                  className={`shrink-0 rounded-full px-2 py-1 text-[9px] font-semibold ${status.className}`}
                                >
                                  {status.label === "On Track"
                                    ? "On Track"
                                    : status.label === "At Risk"
                                      ? "At Risk"
                                      : "Over"}
                                </span>
                              </div>

                              {/* NUMBERS */}

                              <div className="mt-3 grid grid-cols-3 gap-2">
                                <MiniStat
                                  label="Spent"
                                  value={formatCurrency(spent)}
                                />

                                <MiniStat
                                  label="Remaining"
                                  value={formatCurrency(remaining)}
                                />

                                <MiniStat
                                  label="Used"
                                  value={`${percentage.toFixed(0)}%`}
                                />
                              </div>

                              {/* PROGRESS */}

                              <div className="mt-2.5">
                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
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
                              </div>

                              {/* ACTIONS */}

                              <div className="mt-2 flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleEditBudget(budget)}
                                  title="Edit"
                                  aria-label="Edit budget"
                                  className="rounded-md p-1.5 text-slate-500 transition hover:bg-purple-50 hover:text-purple-600 active:bg-purple-100"
                                >
                                  <Pencil size={15} />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteBudget(budget._id)}
                                  disabled={deletingId === budget._id}
                                  title="Delete"
                                  aria-label="Delete budget"
                                  className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 active:bg-red-100 disabled:opacity-50"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          );
                        })}

                        {/* MOBILE TOTAL */}

                        <div className="bg-slate-50 px-3 py-3">
                          <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                              <p className="text-[9px] uppercase tracking-wide text-slate-400">
                                Budget
                              </p>

                              <p className="mt-0.5 text-xs font-bold text-slate-900">
                                {formatCurrency(totalBudget)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] uppercase tracking-wide text-slate-400">
                                Spent
                              </p>

                              <p className="mt-0.5 text-xs font-bold text-slate-900">
                                {formatCurrency(totalSpent)}
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] uppercase tracking-wide text-slate-400">
                                Remaining
                              </p>

                              <p className="mt-0.5 text-xs font-bold text-slate-900">
                                {formatCurrency(totalRemaining)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ==================================================
                          TABLE - TABLET + DESKTOP
                      ================================================== */}

                      <div className="hidden overflow-x-auto sm:block">
                        <table className="w-full min-w-[760px]">
                          <thead>
                            <tr className="bg-slate-50">
                              <TableHeader>Category</TableHeader>

                              <TableHeader align="right">Budget</TableHeader>

                              <TableHeader align="right">Spent</TableHeader>

                              <TableHeader align="right">Remaining</TableHeader>

                              <TableHeader>Progress</TableHeader>

                              <TableHeader>Status</TableHeader>

                              <TableHeader align="center">Actions</TableHeader>
                            </tr>
                          </thead>

                          <tbody>
                            {budgets.map((budget) => {
                              const amount = getNumber(budget.amount);

                              const spent = getNumber(budget.spent);

                              const remaining = Math.max(amount - spent, 0);

                              const percentage = getBudgetPercentage(budget);

                              const status = getBudgetStatus(budget);

                              const icon = getCategoryIcon(budget);

                              return (
                                <tr
                                  key={budget._id}
                                  className="border-t border-slate-100 transition hover:bg-slate-50"
                                >
                                  {/* CATEGORY */}

                                  <td className="px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 lg:h-9 lg:w-9 lg:rounded-xl">
                                        {icon ? (
                                          <span>{icon}</span>
                                        ) : (
                                          <WalletCards size={16} />
                                        )}
                                      </div>

                                      <span className="text-xs font-semibold text-slate-800 lg:text-sm">
                                        {getCategoryName(budget)}
                                      </span>
                                    </div>
                                  </td>

                                  {/* BUDGET */}

                                  <td className="px-3 py-3 text-right text-xs font-medium text-slate-800 sm:px-4 lg:px-5 lg:py-4 lg:text-sm">
                                    {formatCurrency(amount)}
                                  </td>

                                  {/* SPENT */}

                                  <td className="px-3 py-3 text-right text-xs font-medium text-slate-800 sm:px-4 lg:px-5 lg:py-4 lg:text-sm">
                                    {formatCurrency(spent)}
                                  </td>

                                  {/* REMAINING */}

                                  <td className="px-3 py-3 text-right text-xs font-medium text-slate-800 sm:px-4 lg:px-5 lg:py-4 lg:text-sm">
                                    {formatCurrency(remaining)}
                                  </td>

                                  {/* PROGRESS */}

                                  <td className="px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
                                    <div className="flex items-center gap-2">
                                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100 sm:w-20 lg:h-2 lg:w-24">
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
                                            width: `${Math.min(
                                              percentage,
                                              100,
                                            )}%`,
                                          }}
                                        />
                                      </div>

                                      <span className="text-[10px] font-semibold text-slate-600 lg:text-xs">
                                        {percentage.toFixed(0)}%
                                      </span>
                                    </div>
                                  </td>

                                  {/* STATUS */}

                                  <td className="px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
                                    <span
                                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold lg:px-2.5 lg:text-xs ${status.className}`}
                                    >
                                      {status.label === "On Track" ? (
                                        <CheckCircle2 size={11} />
                                      ) : (
                                        <AlertTriangle size={11} />
                                      )}

                                      <span className="hidden md:inline">
                                        {status.label}
                                      </span>

                                      <span className="md:hidden">
                                        {status.label === "Over Budget"
                                          ? "Over"
                                          : status.label}
                                      </span>
                                    </span>
                                  </td>

                                  {/* ACTIONS */}

                                  <td className="px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
                                    <div className="flex justify-center gap-0.5">
                                      <button
                                        type="button"
                                        onClick={() => handleEditBudget(budget)}
                                        title="Edit"
                                        aria-label="Edit budget"
                                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-purple-50 hover:text-purple-600 lg:rounded-lg lg:p-2"
                                      >
                                        <Pencil size={15} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleDeleteBudget(budget._id)
                                        }
                                        disabled={deletingId === budget._id}
                                        title="Delete"
                                        aria-label="Delete budget"
                                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-red-50 hover:text-red-600 lg:rounded-lg lg:p-2 disabled:opacity-50"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}

                            {/* TOTAL */}

                            <tr className="border-t border-slate-200 bg-slate-50">
                              <td className="px-3 py-3 sm:px-4 lg:px-5 lg:py-4">
                                <button
                                  type="button"
                                  onClick={handleAddBudget}
                                  className="flex items-center gap-1 text-xs font-semibold text-purple-600 lg:text-sm"
                                >
                                  <Plus size={14} />
                                  Add Budget
                                </button>
                              </td>

                              <td className="px-3 py-3 text-right text-xs font-bold text-slate-900 sm:px-4 lg:px-5 lg:py-4 lg:text-sm">
                                {formatCurrency(totalBudget)}
                              </td>

                              <td className="px-3 py-3 text-right text-xs font-bold text-slate-900 sm:px-4 lg:px-5 lg:py-4 lg:text-sm">
                                {formatCurrency(totalSpent)}
                              </td>

                              <td className="px-3 py-3 text-right text-xs font-bold text-slate-900 sm:px-4 lg:px-5 lg:py-4 lg:text-sm">
                                {formatCurrency(totalRemaining)}
                              </td>

                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>

                {/* ==================================================
                    BUDGET TREND
                ================================================== */}

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                  <div className="mb-3 sm:mb-5">
                    <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                      Budget Trend
                    </h2>

                    <p className="mt-0.5 text-[10px] text-slate-500 sm:mt-1 sm:text-xs">
                      Spending progress for {monthLabel}
                    </p>
                  </div>

                  <div className="h-[220px] sm:h-[280px] lg:h-[300px]">
                    {budgetTrend.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400 sm:text-sm">
                        No trend data available
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={budgetTrend}
                          margin={{
                            top: 5,
                            right: 5,
                            left: -18,
                            bottom: 0,
                          }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                          />

                          <XAxis
                            dataKey="day"
                            tick={{
                              fontSize: 9,
                            }}
                          />

                          <YAxis
                            tick={{
                              fontSize: 9,
                            }}
                          />

                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                          />

                          <Legend
                            wrapperStyle={{
                              fontSize: 10,
                            }}
                          />

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
                              r: 2.5,
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
                  RIGHT
              ================================================= */}

              <div className="min-w-0 space-y-3 sm:space-y-4 lg:space-y-5">
                {/* ==================================================
                    BUDGET VS ACTUAL
                ================================================== */}

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Budget vs Actual
                  </h2>

                  <div className="mt-2 h-[210px] sm:mt-4 sm:h-[260px]">
                    {totalBudget === 0 ? (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400 sm:text-sm">
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
                            innerRadius="52%"
                            outerRadius="72%"
                            paddingAngle={2}
                          >
                            <Cell fill="#6D28D9" />

                            <Cell fill="#10B981" />
                          </Pie>

                          <Tooltip
                            formatter={(value) => formatCurrency(value)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    <PieLegend
                      color="bg-purple-600"
                      label="Spent"
                      amount={formatCurrency(totalSpent)}
                      percentage={`${overallPercentage.toFixed(2)}%`}
                    />

                    <PieLegend
                      color="bg-emerald-500"
                      label="Remaining"
                      amount={formatCurrency(totalRemaining)}
                      percentage={`${Math.max(
                        100 - overallPercentage,
                        0,
                      ).toFixed(2)}%`}
                    />
                  </div>
                </div>

                {/* ==================================================
                    TOP BUDGET USAGE
                ================================================== */}

                <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
                  <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                    Top Budget Usage
                  </h2>

                  <div className="mt-3 space-y-3 sm:mt-5 sm:space-y-5">
                    {topBudgetUsage.length === 0 ? (
                      <p className="py-5 text-center text-xs text-slate-400 sm:py-6 sm:text-sm">
                        No budget data
                      </p>
                    ) : (
                      topBudgetUsage.map((budget, index) => {
                        const percentage = getBudgetPercentage(budget);

                        return (
                          <div key={budget._id}>
                            <div className="mb-1.5 flex items-center justify-between gap-2 sm:mb-2">
                              <span className="truncate text-xs font-medium text-slate-700 sm:text-sm">
                                {getCategoryName(budget)}
                              </span>

                              <span className="shrink-0 text-[10px] font-bold text-slate-600 sm:text-xs">
                                {percentage.toFixed(0)}%
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 sm:h-2">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${Math.min(percentage, 100)}%`,
                                  backgroundColor:
                                    COLORS[index % COLORS.length],
                                }}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* ==================================================
                    TIPS
                ================================================== */}

                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 sm:rounded-2xl sm:p-5">
                  <div className="flex items-start gap-2.5 sm:gap-3">
                    <div className="shrink-0 rounded-full bg-white p-1.5 text-emerald-600 shadow-sm sm:p-2">
                      <Lightbulb size={17} />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                        Budget Tips
                      </h2>

                      <p className="mt-1.5 text-[11px] leading-5 text-slate-700 sm:mt-3 sm:text-sm sm:leading-6">
                        {overallPercentage < 80
                          ? "You're doing great! Try to keep your spending under 80% of your budget to save more."
                          : overallPercentage < 100
                            ? "You're getting close to your budget limit. Keep an eye on your remaining spending."
                            : "You've reached your overall budget limit. Consider reviewing your spending categories."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ==================================================
                    QUICK ACTION
                ================================================== */}

                <button
                  type="button"
                  onClick={handleAddBudget}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-purple-300 bg-purple-50 px-3 py-3 text-xs font-semibold text-purple-700 transition hover:bg-purple-100 sm:gap-2 sm:rounded-2xl sm:px-4 sm:py-4 sm:text-sm"
                >
                  <Plus size={16} />
                  Create Another Budget
                </button>
              </div>
            </div>
          </>
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

// ======================================================
// SUMMARY CARD
// ======================================================

const SummaryCard = ({
  title,
  value,
  subtitle,
  icon,
  iconClass,
  subtitleClass,
}) => {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[10px] text-slate-500 sm:text-sm">
            {title}
          </p>

          <h3 className="mt-1 truncate text-base font-bold text-slate-900 sm:mt-2 sm:text-2xl">
            {value}
          </h3>
        </div>

        <div className={`shrink-0 rounded-full p-2 sm:p-3 ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p
        className={`mt-2 truncate text-[10px] font-semibold sm:mt-4 sm:text-xs ${subtitleClass}`}
      >
        {subtitle}
      </p>
    </div>
  );
};

// ======================================================
// MINI STAT
// ======================================================

const MiniStat = ({ label, value }) => {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-2 py-1.5">
      <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-700">
        {value}
      </p>
    </div>
  );
};

// ======================================================
// TABLE HEADER
// ======================================================

const TableHeader = ({ children, align = "left" }) => {
  return (
    <th
      className={`px-3 py-2.5 text-${align} text-[10px] font-semibold text-slate-500 sm:px-4 lg:px-5 lg:py-3 lg:text-xs`}
    >
      {children}
    </th>
  );
};

// ======================================================
// PIE LEGEND
// ======================================================

const PieLegend = ({ color, label, amount, percentage }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />

        <span className="truncate text-xs text-slate-600 sm:text-sm">
          {label}
        </span>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-xs font-semibold text-slate-900 sm:text-sm">
          {amount}
        </p>

        <p className="text-[10px] text-slate-400 sm:text-xs">{percentage}</p>
      </div>
    </div>
  );
};

export default Budgets;
