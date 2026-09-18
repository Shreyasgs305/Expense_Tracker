import { useEffect, useMemo, useState } from "react";

import PageLayout from "../components/layout/PageLayout";

import AddExpenseModal from "../components/expenses/AddExpenseModal";
import EditExpenseModal from "../components/expenses/EditExpenseModal";
import DeleteExpenseModal from "../components/expenses/DeleteExpenseModal";

import { getExpenses } from "../api/expenseApi";

import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Receipt,
  Edit3,
  Trash2,
  CalendarDays,
  Wallet,
  X,
} from "lucide-react";

// ======================================================
// CONSTANTS
// ======================================================

const ITEMS_PER_PAGE = 10;

// ======================================================
// COMPONENT
// ======================================================

const Expenses = () => {
  // ====================================================
  // DATA
  // ====================================================

  const [expenses, setExpenses] = useState([]);

  // ====================================================
  // LOADING / ERROR
  // ====================================================

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ====================================================
  // FILTERS
  // ====================================================

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // ====================================================
  // PAGINATION
  // ====================================================

  const [currentPage, setCurrentPage] = useState(1);

  // ====================================================
  // MODALS
  // ====================================================

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedExpense, setSelectedExpense] = useState(null);

  // ====================================================
  // LOAD EXPENSES
  // ====================================================

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getExpenses();

      if (response?.success === false) {
        setError(response.message || "Failed to load transactions");
        return;
      }

      setExpenses(response?.data || []);
    } catch (err) {
      console.error("Load expenses error:", err);

      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // ====================================================
  // INITIAL LOAD
  // ====================================================

  useEffect(() => {
    loadExpenses();
  }, []);

  // ====================================================
  // GET NUMBER
  // ====================================================

  const getAmount = (amount) => {
    if (amount === null || amount === undefined) {
      return 0;
    }

    if (typeof amount === "number" || typeof amount === "string") {
      return Number(amount) || 0;
    }

    if (typeof amount === "object" && amount.$numberDecimal) {
      return Number(amount.$numberDecimal) || 0;
    }

    return Number(amount?.toString?.() || 0);
  };

  // ====================================================
  // FORMAT CURRENCY
  // ====================================================

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // ====================================================
  // FORMAT DATE
  // ====================================================

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

  // ====================================================
  // FILTER TRANSACTIONS
  // ====================================================

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // ------------------------------------------------
      // TYPE FILTER
      // ------------------------------------------------

      if (typeFilter !== "ALL" && expense.type !== typeFilter) {
        return false;
      }

      // ------------------------------------------------
      // SEARCH
      // ------------------------------------------------

      const searchText = search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      const description = expense.description?.toLowerCase() || "";

      const categoryName = expense.categoryId?.name?.toLowerCase() || "";

      const accountName = expense.accountId?.name?.toLowerCase() || "";

      const paymentMethod = expense.paymentMethod?.toLowerCase() || "";

      return (
        description.includes(searchText) ||
        categoryName.includes(searchText) ||
        accountName.includes(searchText) ||
        paymentMethod.includes(searchText)
      );
    });
  }, [expenses, search, typeFilter]);

  // ====================================================
  // PAGINATION
  // ====================================================

  const totalPages = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

  const endIndex = startIndex + ITEMS_PER_PAGE;

  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  // ====================================================
  // RESET PAGE WHEN FILTER CHANGES
  // ====================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, typeFilter]);

  // ====================================================
  // SAFETY
  // ====================================================

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // ====================================================
  // SUMMARY
  // ====================================================

  const totalExpense = useMemo(() => {
    return expenses
      .filter((expense) => expense.type === "EXPENSE")
      .reduce((total, expense) => total + getAmount(expense.amount), 0);
  }, [expenses]);

  const totalIncome = useMemo(() => {
    return expenses
      .filter((expense) => expense.type === "INCOME")
      .reduce((total, expense) => total + getAmount(expense.amount), 0);
  }, [expenses]);

  const expenseCount = expenses.filter(
    (expense) => expense.type === "EXPENSE",
  ).length;

  const incomeCount = expenses.filter(
    (expense) => expense.type === "INCOME",
  ).length;

  const cardPaymentCount = expenses.filter(
    (expense) => expense.type === "CREDIT_CARD_PAYMENT",
  ).length;

  // ====================================================
  // ADD SUCCESS
  // ====================================================

  const handleAddSuccess = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);

    setCurrentPage(1);
  };

  // ====================================================
  // EDIT
  // ====================================================

  const handleEdit = (expense) => {
    setSelectedExpense(expense);
    setEditModalOpen(true);
  };

  // ====================================================
  // EDIT SUCCESS
  // ====================================================

  const handleEditSuccess = (updatedExpense) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense._id === updatedExpense._id ? updatedExpense : expense,
      ),
    );

    setEditModalOpen(false);
    setSelectedExpense(null);
  };

  // ====================================================
  // DELETE
  // ====================================================

  const handleDelete = (expense) => {
    setSelectedExpense(expense);
    setDeleteModalOpen(true);
  };

  // ====================================================
  // DELETE SUCCESS
  // ====================================================

  const handleDeleteSuccess = (deletedId) => {
    setExpenses((prev) => prev.filter((expense) => expense._id !== deletedId));

    setDeleteModalOpen(false);
    setSelectedExpense(null);

    const remainingItems = filteredExpenses.length - 1;

    const newTotalPages = Math.ceil(remainingItems / ITEMS_PER_PAGE);

    if (newTotalPages > 0 && currentPage > newTotalPages) {
      setCurrentPage(newTotalPages);
    }
  };

  // ====================================================
  // CLOSE MODALS
  // ====================================================

  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedExpense(null);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedExpense(null);
  };

  // ====================================================
  // CLEAR FILTERS
  // ====================================================

  const clearFilters = () => {
    setSearch("");
    setTypeFilter("ALL");
    setCurrentPage(1);
  };

  // ====================================================
  // PAGE CHANGE
  // ====================================================

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ====================================================
  // TRANSACTION CARD
  // MOBILE + TABLET
  // ====================================================

  const TransactionCard = ({ expense }) => {
    const amount = getAmount(expense.amount);

    const isIncome = expense.type === "INCOME";

    const isCreditCardPayment = expense.type === "CREDIT_CARD_PAYMENT";

    return (
      <div className="px-3 py-2.5 sm:px-4 sm:py-3">
        {/* ============================================
            TOP ROW
        ============================================ */}

        <div className="flex items-center gap-2.5">
          {/* ICON */}

          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              isIncome
                ? "bg-emerald-50 text-emerald-600"
                : isCreditCardPayment
                  ? "bg-blue-50 text-blue-600"
                  : "bg-red-50 text-red-600"
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft size={17} />
            ) : (
              <ArrowUpRight size={17} />
            )}
          </div>

          {/* DETAILS */}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-xs font-semibold leading-4 text-slate-900 sm:text-sm">
              {expense.description || "Untitled Transaction"}
            </h3>

            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[10px] leading-4 text-slate-500 sm:text-xs">
              <span className="truncate">
                {expense.categoryId?.icon || "📁"}{" "}
                {expense.categoryId?.name || "Uncategorized"}
              </span>

              <span className="shrink-0 text-slate-300">•</span>

              <span className="truncate">
                {expense.accountId?.name || "Unknown Account"}
              </span>
            </div>
          </div>

          {/* AMOUNT */}

          <div
            className={`shrink-0 text-right text-xs font-bold sm:text-sm ${
              isIncome
                ? "text-emerald-600"
                : isCreditCardPayment
                  ? "text-blue-600"
                  : "text-red-600"
            }`}
          >
            {isIncome ? "+" : isCreditCardPayment ? "" : "-"}

            {formatCurrency(amount)}
          </div>
        </div>

        {/* ============================================
            DETAILS
        ============================================ */}

        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 sm:mt-2.5 sm:gap-3 sm:px-3 sm:py-2.5">
          {/* DATE */}

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Date
            </p>

            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-700 sm:text-xs">
              {formatDate(expense.date)}
            </p>
          </div>

          {/* PAYMENT */}

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Payment
            </p>

            <p className="mt-0.5 truncate text-[10px] font-medium text-slate-700 sm:text-xs">
              {expense.paymentMethod || "-"}
            </p>
          </div>

          {/* TYPE */}

          <div className="col-span-2 min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
              Type
            </p>

            <p
              className={`mt-0.5 truncate text-[10px] font-semibold sm:text-xs ${
                isIncome
                  ? "text-emerald-600"
                  : isCreditCardPayment
                    ? "text-blue-600"
                    : "text-red-600"
              }`}
            >
              {isCreditCardPayment
                ? "Credit Card Payment"
                : isIncome
                  ? "Income"
                  : "Expense"}
            </p>
          </div>
        </div>

        {/* ============================================
            ACTIONS
        ============================================ */}

        <div className="mt-1 flex justify-end gap-0.5 sm:mt-1.5 sm:gap-1">
          <button
            type="button"
            onClick={() => handleEdit(expense)}
            title="Edit"
            aria-label="Edit transaction"
            className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50 active:bg-blue-100 sm:p-2"
          >
            <Edit3 size={15} />
          </button>

          <button
            type="button"
            onClick={() => handleDelete(expense)}
            title="Delete"
            aria-label="Delete transaction"
            className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50 active:bg-red-100 sm:p-2"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  };

  // ====================================================
  // PAGINATION
  // ====================================================

  const Pagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];

    // FIRST

    pages.push(1);

    // MIDDLE

    for (let page = 2; page <= totalPages - 1; page++) {
      if (Math.abs(page - currentPage) <= 1) {
        pages.push(page);
      }
    }

    // LAST

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    const uniquePages = [...new Set(pages)].sort((a, b) => a - b);

    return (
      <div className="flex flex-col gap-2 border-t border-slate-100 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        {/* SHOWING */}

        <p className="text-center text-[10px] text-slate-500 sm:text-left sm:text-xs">
          Showing{" "}
          <span className="font-semibold text-slate-700">{startIndex + 1}</span>
          {" – "}
          <span className="font-semibold text-slate-700">
            {Math.min(endIndex, filteredExpenses.length)}
          </span>
          {" of "}
          <span className="font-semibold text-slate-700">
            {filteredExpenses.length}
          </span>
        </p>

        {/* PAGINATION */}

        <div className="flex items-center justify-center gap-1">
          {/* PREVIOUS */}

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Previous page"
          >
            ←
          </button>

          {/* PAGE NUMBERS */}

          {uniquePages.map((page, index) => {
            const previousPage = uniquePages[index - 1];

            const showDots = previousPage && page - previousPage > 1;

            return (
              <div key={page} className="flex items-center gap-1">
                {showDots && (
                  <span className="px-0.5 text-xs text-slate-400">...</span>
                )}

                <button
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                    currentPage === page
                      ? "bg-blue-600 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              </div>
            );
          })}

          {/* NEXT */}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => goToPage(currentPage + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Next page"
          >
            →
          </button>
        </div>
      </div>
    );
  };

  // ====================================================
  // RENDER
  // ====================================================

  return (
    <PageLayout title="Expenses" subtitle="Manage your income and expenses">
      <div className="mx-auto w-full max-w-[1400px] space-y-4 overflow-hidden sm:space-y-5">
        {/* ==============================================
            HEADER
        ============================================== */}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl">
              Transactions
            </h1>

            <p className="mt-0.5 text-[11px] text-slate-500 sm:mt-1 sm:text-xs lg:text-sm">
              Track where your money goes
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:h-10 sm:w-auto sm:px-5 sm:text-sm"
          >
            <Plus size={17} />
            Add Transaction
          </button>
        </div>

        {/* ==============================================
            SUMMARY CARDS
        ============================================== */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* TRANSACTIONS */}

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5 sm:py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium text-slate-500 sm:text-xs lg:text-sm">
                  Transactions
                </p>

                <p className="mt-1.5 text-xl font-bold text-slate-900 sm:text-2xl">
                  {expenses.length}
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 p-2.5 text-blue-600">
                <Receipt size={18} />
              </div>
            </div>

            <p className="mt-2 text-[10px] text-slate-400 sm:text-xs">
              {expenseCount} expenses • {incomeCount} income
              {cardPaymentCount > 0 && ` • ${cardPaymentCount} card payments`}
            </p>
          </div>

          {/* EXPENSE */}

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 sm:text-xs lg:text-sm">
                  Total Expenses
                </p>

                <p className="mt-1.5 truncate text-lg font-bold text-red-600 sm:text-2xl">
                  - {formatCurrency(totalExpense)}
                </p>
              </div>

              <div className="rounded-lg bg-red-50 p-2.5 text-red-600">
                <ArrowUpRight size={18} />
              </div>
            </div>

            <p className="mt-2 text-[10px] text-slate-400 sm:text-xs">
              Money spent
            </p>
          </div>

          {/* INCOME */}

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 shadow-sm sm:px-5 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-slate-500 sm:text-xs lg:text-sm">
                  Total Income
                </p>

                <p className="mt-1.5 truncate text-lg font-bold text-emerald-600 sm:text-2xl">
                  + {formatCurrency(totalIncome)}
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50 p-2.5 text-emerald-600">
                <ArrowDownLeft size={18} />
              </div>
            </div>

            <p className="mt-2 text-[10px] text-slate-400 sm:text-xs">
              Money received
            </p>
          </div>
        </div>

        {/* ==============================================
            SEARCH / FILTER
        ============================================== */}

        <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm sm:p-3">
          <div className="flex flex-col gap-2.5 lg:flex-row">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, category or account..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* TYPE FILTER */}

            <div className="flex gap-2 lg:w-auto">
              <div className="relative min-w-0 flex-1 sm:min-w-[180px] sm:flex-none">
                <Receipt
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-10 w-full appearance-none rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:text-sm"
                >
                  <option value="ALL">All Transactions</option>

                  <option value="EXPENSE">Expenses</option>

                  <option value="INCOME">Income</option>

                  <option value="CREDIT_CARD_PAYMENT">Card Payments</option>
                </select>
              </div>

              {(search || typeFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-10 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50 sm:px-4 sm:text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ==============================================
            ERROR
        ============================================== */}

        {error && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-600 sm:px-4 sm:py-3 sm:text-sm">
            <span className="shrink-0">⚠️</span>

            <p className="min-w-0">{error}</p>
          </div>
        )}

        {/* ==============================================
            TRANSACTIONS CONTAINER
        ============================================== */}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* HEADER */}

          <div className="border-b border-slate-100 px-3 py-3 sm:px-4 sm:py-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  All Transactions
                </h2>

                <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">
                  {filteredExpenses.length === 0
                    ? "No transactions"
                    : `${filteredExpenses.length} transactions`}
                </p>
              </div>

              {totalPages > 1 && (
                <p className="shrink-0 text-[10px] font-medium text-blue-600 sm:text-xs">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>
          </div>

          {/* ============================================
              LOADING
          ============================================ */}

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center p-6">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-3 text-xs text-slate-500">
                  Loading transactions...
                </p>
              </div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            /* ==========================================
                EMPTY
            ========================================== */

            <div className="px-4 py-12 text-center sm:py-16">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Receipt size={26} />
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-900 sm:text-base">
                No transactions found
              </h3>

              <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500 sm:text-sm">
                {search || typeFilter !== "ALL"
                  ? "Try changing your search or filter."
                  : "Add your first transaction to get started."}
              </p>

              <div className="mt-4 flex flex-col justify-center gap-2 sm:flex-row">
                {(search || typeFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 sm:text-sm"
                  >
                    Clear Filters
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 sm:text-sm"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Plus size={15} />
                    Add Transaction
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ========================================
                  DESKTOP TABLE
                  1024px+
              ======================================== */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[850px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Description
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Category
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Account
                      </th>

                      <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-4 py-3 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedExpenses.map((expense) => {
                      const amount = getAmount(expense.amount);

                      const isIncome = expense.type === "INCOME";

                      const isCreditCardPayment =
                        expense.type === "CREDIT_CARD_PAYMENT";

                      return (
                        <tr
                          key={expense._id}
                          className="transition hover:bg-slate-50"
                        >
                          {/* DESCRIPTION */}

                          <td className="px-4 py-3">
                            <div className="flex min-w-0 items-center gap-2.5">
                              <div
                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                  isIncome
                                    ? "bg-emerald-50 text-emerald-600"
                                    : isCreditCardPayment
                                      ? "bg-blue-50 text-blue-600"
                                      : "bg-red-50 text-red-600"
                                }`}
                              >
                                {isIncome ? (
                                  <ArrowDownLeft size={17} />
                                ) : (
                                  <ArrowUpRight size={17} />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[210px] truncate text-xs font-semibold text-slate-900">
                                  {expense.description ||
                                    "Untitled Transaction"}
                                </p>

                                <p className="mt-0.5 max-w-[170px] truncate text-[10px] text-slate-400">
                                  {expense.paymentMethod || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY */}

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs">
                                {expense.categoryId?.icon || "📁"}
                              </span>

                              <span className="max-w-[130px] truncate text-xs text-slate-700">
                                {expense.categoryId?.name || "Uncategorized"}
                              </span>
                            </div>
                          </td>

                          {/* ACCOUNT */}

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Wallet
                                size={14}
                                className="shrink-0 text-slate-400"
                              />

                              <span className="max-w-[130px] truncate text-xs text-slate-700">
                                {expense.accountId?.name || "Unknown"}
                              </span>
                            </div>
                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600">
                            <div className="flex items-center gap-1.5">
                              <CalendarDays
                                size={14}
                                className="text-slate-400"
                              />

                              {formatDate(expense.date)}
                            </div>
                          </td>

                          {/* AMOUNT */}

                          <td className="whitespace-nowrap px-4 py-3 text-right">
                            <span
                              className={`text-xs font-bold ${
                                isIncome
                                  ? "text-emerald-600"
                                  : isCreditCardPayment
                                    ? "text-blue-600"
                                    : "text-red-600"
                              }`}
                            >
                              {isIncome ? "+" : isCreditCardPayment ? "" : "-"}

                              {formatCurrency(amount)}
                            </span>
                          </td>

                          {/* ACTIONS */}

                          <td className="px-4 py-3">
                            <div className="flex justify-center gap-0.5">
                              <button
                                type="button"
                                onClick={() => handleEdit(expense)}
                                title="Edit"
                                aria-label="Edit transaction"
                                className="rounded-md p-1.5 text-blue-600 transition hover:bg-blue-50"
                              >
                                <Edit3 size={16} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(expense)}
                                title="Delete"
                                aria-label="Delete transaction"
                                className="rounded-md p-1.5 text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* ========================================
                  MOBILE + TABLET
                  < 1024px
              ======================================== */}

              <div className="divide-y divide-slate-100 lg:hidden">
                {paginatedExpenses.map((expense) => (
                  <TransactionCard key={expense._id} expense={expense} />
                ))}
              </div>

              {/* PAGINATION */}

              <Pagination />
            </>
          )}
        </div>

        {/* ==============================================
            BOTTOM SUMMARY
        ============================================== */}

        {!loading && filteredExpenses.length > 0 && (
          <div className="flex flex-col gap-1.5 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2.5 text-[10px] text-blue-700 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:text-xs">
            <span>
              Displaying <strong>{paginatedExpenses.length}</strong> of{" "}
              <strong>{filteredExpenses.length}</strong> transactions
            </span>

            <span>
              Total expenses: <strong>{formatCurrency(totalExpense)}</strong>
            </span>
          </div>
        )}
      </div>

      {/* ==============================================
          ADD EXPENSE MODAL
      ============================================== */}

      <AddExpenseModal
        isOpen={addModalOpen}
        onClose={closeAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* ==============================================
          EDIT EXPENSE MODAL
      ============================================== */}

      <EditExpenseModal
        isOpen={editModalOpen}
        expense={selectedExpense}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* ==============================================
          DELETE EXPENSE MODAL
      ============================================== */}

      <DeleteExpenseModal
        isOpen={deleteModalOpen}
        expense={selectedExpense}
        onClose={closeDeleteModal}
        onSuccess={handleDeleteSuccess}
      />
    </PageLayout>
  );
};

export default Expenses;
