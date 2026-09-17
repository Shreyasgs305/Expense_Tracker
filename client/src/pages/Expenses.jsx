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
      // ------------------------------------------
      // TYPE FILTER
      // ------------------------------------------

      if (typeFilter !== "ALL" && expense.type !== typeFilter) {
        return false;
      }

      // ------------------------------------------
      // SEARCH
      // ------------------------------------------

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

    // Go back if current page becomes empty
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
  // ====================================================

  const TransactionCard = ({ expense }) => {
    const amount = getAmount(expense.amount);

    const isIncome = expense.type === "INCOME";

    const isCreditCardPayment = expense.type === "CREDIT_CARD_PAYMENT";

    return (
      <div className="p-4 sm:p-5">
        {/* -----------------------------------------
            TOP
        ----------------------------------------- */}

        <div className="flex items-start gap-3">
          {/* ICON */}

          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
              isIncome
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isIncome ? (
              <ArrowDownLeft size={20} />
            ) : (
              <ArrowUpRight size={20} />
            )}
          </div>

          {/* DETAILS */}

          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-slate-900 sm:text-base">
              {expense.description || "Untitled Transaction"}
            </h3>

            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="truncate">
                {expense.categoryId?.icon || "📁"}{" "}
                {expense.categoryId?.name || "Uncategorized"}
              </span>

              <span className="hidden sm:inline">•</span>

              <span className="truncate">
                {expense.accountId?.name || "Unknown Account"}
              </span>
            </div>
          </div>

          {/* AMOUNT */}

          <div
            className={`shrink-0 text-right text-sm font-bold sm:text-base ${
              isIncome ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {isIncome ? "+" : "-"}
            {formatCurrency(amount)}
          </div>
        </div>

        {/* -----------------------------------------
            DETAILS
        ----------------------------------------- */}

        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 sm:grid-cols-3">
          {/* DATE */}

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Date
            </p>

            <p className="mt-1 truncate text-xs font-medium text-slate-700 sm:text-sm">
              {formatDate(expense.date)}
            </p>
          </div>

          {/* PAYMENT */}

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Payment
            </p>

            <p className="mt-1 truncate text-xs font-medium text-slate-700 sm:text-sm">
              {expense.paymentMethod || "-"}
            </p>
          </div>

          {/* TYPE */}

          <div className="col-span-2 min-w-0 sm:col-span-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              Type
            </p>

            <p className="mt-1 truncate text-xs font-medium text-slate-700 sm:text-sm">
              {isCreditCardPayment
                ? "Card Payment"
                : isIncome
                  ? "Income"
                  : "Expense"}
            </p>
          </div>
        </div>

        {/* -----------------------------------------
            ACTION ICONS
        ----------------------------------------- */}

        <div className="mt-3 flex justify-end gap-1">
          <button
            type="button"
            onClick={() => handleEdit(expense)}
            title="Edit"
            aria-label="Edit transaction"
            className="rounded-lg p-2.5 text-blue-600 transition hover:bg-blue-50 active:bg-blue-100"
          >
            <Edit3 size={17} />
          </button>

          <button
            type="button"
            onClick={() => handleDelete(expense)}
            title="Delete"
            aria-label="Delete transaction"
            className="rounded-lg p-2.5 text-red-600 transition hover:bg-red-50 active:bg-red-100"
          >
            <Trash2 size={17} />
          </button>
        </div>
      </div>
    );
  };

  // ====================================================
  // PAGINATION COMPONENT
  // ====================================================

  const Pagination = () => {
    if (totalPages <= 1) {
      return null;
    }

    const pages = [];

    // ------------------------------------------
    // ALWAYS SHOW FIRST
    // ------------------------------------------

    pages.push(1);

    // ------------------------------------------
    // MIDDLE PAGES
    // ------------------------------------------

    for (let page = 2; page <= totalPages - 1; page++) {
      if (Math.abs(page - currentPage) <= 1) {
        pages.push(page);
      }
    }

    // ------------------------------------------
    // ALWAYS SHOW LAST
    // ------------------------------------------

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    // Remove duplicates
    const uniquePages = [...new Set(pages)].sort((a, b) => a - b);

    return (
      <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        {/* --------------------------------------
            SHOWING
        -------------------------------------- */}

        <p className="text-center text-xs text-slate-500 sm:text-left sm:text-sm">
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
          {" transactions"}
        </p>

        {/* --------------------------------------
            PAGINATION
        -------------------------------------- */}

        <div className="flex items-center justify-center gap-1">
          {/* PREVIOUS */}

          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => goToPage(currentPage - 1)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
                {showDots && <span className="px-1 text-slate-400">...</span>}

                <button
                  type="button"
                  onClick={() => goToPage(page)}
                  className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2.5 text-sm font-semibold transition ${
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
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
      <div className="mx-auto w-full max-w-[1400px] space-y-5 overflow-hidden">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
              Transactions
            </h1>

            <p className="mt-1 text-xs text-slate-500 sm:text-sm">
              Track where your money goes
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto sm:px-5"
          >
            <Plus size={18} />
            Add Transaction
          </button>
        </div>

        {/* =================================================
            SUMMARY
        ================================================= */}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* TRANSACTIONS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Transactions
                </p>

                <p className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                  {expenses.length}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <Receipt size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              {expenseCount} expenses • {incomeCount} income
            </p>
          </div>

          {/* EXPENSE */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Total Expenses
                </p>

                <p className="mt-2 truncate text-xl font-bold text-red-600 sm:text-2xl">
                  - {formatCurrency(totalExpense)}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 p-3 text-red-600">
                <ArrowDownLeft size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">Money spent</p>
          </div>

          {/* INCOME */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Total Income
                </p>

                <p className="mt-2 truncate text-xl font-bold text-emerald-600 sm:text-2xl">
                  + {formatCurrency(totalIncome)}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <ArrowUpRight size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">Money received</p>
          </div>
        </div>

        {/* =================================================
            SEARCH / FILTER
        ================================================= */}

        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            {/* SEARCH */}

            <div className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, category or account..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>

            {/* TYPE FILTER */}

            <div className="flex flex-col gap-2 sm:flex-row lg:w-auto">
              <div className="relative min-w-0 sm:min-w-[190px]">
                <Receipt
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-9 text-sm text-slate-700 outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                >
                  <option value="ALL">All Transactions</option>

                  <option value="EXPENSE">Expenses</option>

                  <option value="INCOME">Income</option>
                </select>
              </div>

              {(search || typeFilter !== "ALL") && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <span className="shrink-0">⚠️</span>

            <p className="min-w-0">{error}</p>
          </div>
        )}

        {/* =================================================
            TRANSACTIONS
        ================================================= */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* -----------------------------------------------
              HEADER
          ----------------------------------------------- */}

          <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                  All Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-500 sm:text-sm">
                  {filteredExpenses.length === 0
                    ? "No transactions"
                    : `Showing ${startIndex + 1} – ${Math.min(
                        endIndex,
                        filteredExpenses.length,
                      )} of ${filteredExpenses.length} transactions`}
                </p>
              </div>

              {totalPages > 1 && (
                <p className="text-xs font-medium text-blue-600">
                  Page {currentPage} of {totalPages}
                </p>
              )}
            </div>
          </div>

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (
            <div className="flex min-h-[350px] items-center justify-center p-8">
              <div className="text-center">
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

                <p className="mt-4 text-sm text-slate-500">
                  Loading transactions...
                </p>
              </div>
            </div>
          ) : filteredExpenses.length === 0 ? (
            /* =================================================
                EMPTY
            ================================================= */

            <div className="px-5 py-16 text-center sm:py-20">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Receipt size={30} />
              </div>

              <h3 className="mt-5 text-base font-bold text-slate-900 sm:text-lg">
                No transactions found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {search || typeFilter !== "ALL"
                  ? "Try changing your search or filter."
                  : "Add your first transaction to get started."}
              </p>

              <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                {(search || typeFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Clear Filters
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <span className="inline-flex items-center gap-2">
                    <Plus size={17} />
                    Add Transaction
                  </span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* =================================================
                  DESKTOP TABLE
                  1024px+
              ================================================= */}

              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Description
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Category
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Account
                      </th>

                      <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paginatedExpenses.map((expense) => {
                      const amount = getAmount(expense.amount);

                      const isIncome = expense.type === "INCOME";

                      return (
                        <tr
                          key={expense._id}
                          className="transition hover:bg-slate-50"
                        >
                          {/* DESCRIPTION */}

                          <td className="px-5 py-4">
                            <div className="flex min-w-0 items-center gap-3">
                              <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                  isIncome
                                    ? "bg-emerald-50 text-emerald-600"
                                    : "bg-red-50 text-red-600"
                                }`}
                              >
                                {isIncome ? (
                                  <ArrowUpRight size={18} />
                                ) : (
                                  <ArrowDownLeft size={18} />
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-[220px] truncate text-sm font-semibold text-slate-900">
                                  {expense.description ||
                                    "Untitled Transaction"}
                                </p>

                                <p className="mt-1 max-w-[180px] truncate text-xs text-slate-400">
                                  {expense.paymentMethod || "-"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm">
                                {expense.categoryId?.icon || "📁"}
                              </span>

                              <span className="max-w-[150px] truncate text-sm text-slate-700">
                                {expense.categoryId?.name || "Uncategorized"}
                              </span>
                            </div>
                          </td>

                          {/* ACCOUNT */}

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <Wallet
                                size={16}
                                className="shrink-0 text-slate-400"
                              />

                              <span className="max-w-[150px] truncate text-sm text-slate-700">
                                {expense.accountId?.name || "Unknown"}
                              </span>
                            </div>
                          </td>

                          {/* DATE */}

                          <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                              <CalendarDays
                                size={15}
                                className="text-slate-400"
                              />

                              {formatDate(expense.date)}
                            </div>
                          </td>

                          {/* AMOUNT */}

                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <span
                              className={`text-sm font-bold ${
                                isIncome ? "text-emerald-600" : "text-red-600"
                              }`}
                            >
                              {isIncome ? "+" : "-"}

                              {formatCurrency(amount)}
                            </span>
                          </td>

                          {/* ACTION ICONS */}

                          <td className="px-5 py-4">
                            <div className="flex justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEdit(expense)}
                                title="Edit"
                                aria-label="Edit transaction"
                                className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                              >
                                <Edit3 size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(expense)}
                                title="Delete"
                                aria-label="Delete transaction"
                                className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* =================================================
                  MOBILE + TABLET
                  < 1024px
              ================================================= */}

              <div className="divide-y divide-slate-100 lg:hidden">
                {paginatedExpenses.map((expense) => (
                  <TransactionCard key={expense._id} expense={expense} />
                ))}
              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              <Pagination />
            </>
          )}
        </div>

        {/* =================================================
            BOTTOM SUMMARY
        ================================================= */}

        {!loading && filteredExpenses.length > 0 && (
          <div className="flex flex-col gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700 sm:flex-row sm:items-center sm:justify-between sm:px-5">
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

      {/* =====================================================
          ADD EXPENSE MODAL
      ===================================================== */}

      <AddExpenseModal
        isOpen={addModalOpen}
        onClose={closeAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* =====================================================
          EDIT EXPENSE MODAL
      ===================================================== */}

      <EditExpenseModal
        isOpen={editModalOpen}
        expense={selectedExpense}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* =====================================================
          DELETE EXPENSE MODAL
      ===================================================== */}

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
