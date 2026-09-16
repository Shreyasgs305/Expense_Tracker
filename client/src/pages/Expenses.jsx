import { useEffect, useMemo, useState } from "react";

import PageLayout from "../components/layout/PageLayout";

import AddExpenseModal from "../components/expenses/AddExpenseModal";
import EditExpenseModal from "../components/expenses/EditExpenseModal";
import DeleteExpenseModal from "../components/expenses/DeleteExpenseModal";

import { getExpenses } from "../api/expenseApi";

const Expenses = () => {
  // =========================================================
  // STATE
  // =========================================================

  const [expenses, setExpenses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [typeFilter, setTypeFilter] = useState("ALL");

  const [addModalOpen, setAddModalOpen] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedExpense, setSelectedExpense] = useState(null);

  // =========================================================
  // LOAD EXPENSES
  // =========================================================

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getExpenses();

      if (response.success === false) {
        setError(response.message || "Failed to load transactions");

        return;
      }

      setExpenses(response.data || []);
    } catch (err) {
      console.error("Load expenses error:", err);

      setError(err.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadExpenses();
  }, []);

  // =========================================================
  // GET AMOUNT
  // =========================================================

  const getAmount = (amount) => {
    if (typeof amount === "number" || typeof amount === "string") {
      return Number(amount);
    }

    if (amount?.$numberDecimal) {
      return Number(amount.$numberDecimal);
    }

    return Number(amount?.toString?.() || 0);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =========================================================
  // FILTER EXPENSES
  // =========================================================

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      // Type filter
      if (typeFilter !== "ALL" && expense.type !== typeFilter) {
        return false;
      }

      // Search
      const searchText = search.toLowerCase().trim();

      if (!searchText) {
        return true;
      }

      const description = expense.description?.toLowerCase() || "";

      const categoryName = expense.categoryId?.name?.toLowerCase() || "";

      const accountName = expense.accountId?.name?.toLowerCase() || "";

      return (
        description.includes(searchText) ||
        categoryName.includes(searchText) ||
        accountName.includes(searchText)
      );
    });
  }, [expenses, search, typeFilter]);

  // =========================================================
  // ADD SUCCESS
  // =========================================================

  const handleAddSuccess = (newExpense) => {
    setExpenses((prev) => [newExpense, ...prev]);
  };

  // =========================================================
  // EDIT CLICK
  // =========================================================

  const handleEdit = (expense) => {
    setSelectedExpense(expense);

    setEditModalOpen(true);
  };

  // =========================================================
  // EDIT SUCCESS
  // =========================================================

  const handleEditSuccess = (updatedExpense) => {
    setExpenses((prev) =>
      prev.map((expense) =>
        expense._id === updatedExpense._id ? updatedExpense : expense,
      ),
    );

    setSelectedExpense(null);
  };

  // =========================================================
  // DELETE CLICK
  // =========================================================

  const handleDelete = (expense) => {
    setSelectedExpense(expense);

    setDeleteModalOpen(true);
  };

  // =========================================================
  // DELETE SUCCESS
  // =========================================================

  const handleDeleteSuccess = (deletedId) => {
    setExpenses((prev) => prev.filter((expense) => expense._id !== deletedId));

    setSelectedExpense(null);
  };

  // =========================================================
  // CLOSE MODALS
  // =========================================================

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

  // =========================================================
  // SUMMARY
  // =========================================================

  const totalExpense = expenses
    .filter((expense) => expense.type === "EXPENSE")
    .reduce((total, expense) => total + getAmount(expense.amount), 0);

  const totalIncome = expenses
    .filter((expense) => expense.type === "INCOME")
    .reduce((total, expense) => total + getAmount(expense.amount), 0);

  // =========================================================
  // UI
  // =========================================================

  return (
    <PageLayout title="Expenses" subtitle="Manage your income and expenses">
      <div className="space-y-6">
        {/* ================================================= */}
        {/* TOP SECTION */}
        {/* ================================================= */}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>

            <p className="mt-1 text-sm text-gray-500">
              Track where your money goes
            </p>
          </div>

          <button
            onClick={() => setAddModalOpen(true)}
            className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            + Add Transaction
          </button>
        </div>

        {/* ================================================= */}
        {/* SUMMARY CARDS */}
        {/* ================================================= */}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Total transactions */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Transactions</p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              {expenses.length}
            </p>
          </div>

          {/* Total expense */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Expenses</p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              -₹{totalExpense.toFixed(2)}
            </p>
          </div>

          {/* Total income */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Income</p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              +₹{totalIncome.toFixed(2)}
            </p>
          </div>
        </div>

        {/* ================================================= */}
        {/* FILTERS */}
        {/* ================================================= */}

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search description, category or account..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Type */}
            <div className="w-full md:w-48">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
              >
                <option value="ALL">All Transactions</option>

                <option value="EXPENSE">Expenses</option>

                <option value="INCOME">Income</option>
              </select>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* TRANSACTIONS */}
        {/* ================================================= */}

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 px-5 py-4">
            <h2 className="font-semibold text-gray-900">All Transactions</h2>

            <p className="mt-1 text-sm text-gray-500">
              {filteredExpenses.length} transaction
              {filteredExpenses.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="py-16 text-center">
              <p className="text-gray-500">Loading transactions...</p>
            </div>
          ) : filteredExpenses.length === 0 ? (
            /* Empty */
            <div className="py-16 text-center">
              <div className="text-4xl">💸</div>

              <h3 className="mt-4 font-semibold text-gray-900">
                No transactions found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Add your first transaction to get started.
              </p>

              <button
                onClick={() => setAddModalOpen(true)}
                className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                + Add Transaction
              </button>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Description
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Category
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Account
                      </th>

                      <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Amount
                      </th>

                      <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {filteredExpenses.map((expense) => {
                      const amount = getAmount(expense.amount);

                      const isIncome = expense.type === "INCOME";

                      return (
                        <tr key={expense._id} className="hover:bg-gray-50">
                          {/* Description */}
                          <td className="px-5 py-4">
                            <div className="font-medium text-gray-900">
                              {expense.description}
                            </div>

                            <div className="mt-1 text-xs text-gray-400">
                              {expense.paymentMethod || "-"}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span>{expense.categoryId?.icon || "📁"}</span>

                              <span className="text-sm text-gray-700">
                                {expense.categoryId?.name || "Uncategorized"}
                              </span>
                            </div>
                          </td>

                          {/* Account */}
                          <td className="px-5 py-4 text-sm text-gray-700">
                            {expense.accountId?.name || "Unknown"}
                          </td>

                          {/* Date */}
                          <td className="px-5 py-4 text-sm text-gray-600">
                            {formatDate(expense.date)}
                          </td>

                          {/* Amount */}
                          <td className="px-5 py-4 text-right">
                            <span
                              className={`font-semibold ${
                                isIncome ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {isIncome ? "+" : "-"}₹{amount.toFixed(2)}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-5 py-4">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(expense)}
                                className="rounded-lg px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                              >
                                Edit
                              </button>

                              <button
                                onClick={() => handleDelete(expense)}
                                className="rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-gray-100 md:hidden">
                {filteredExpenses.map((expense) => {
                  const amount = getAmount(expense.amount);

                  const isIncome = expense.type === "INCOME";

                  return (
                    <div key={expense._id} className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h3 className="font-medium text-gray-900">
                            {expense.description}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            {expense.categoryId?.icon || "📁"}{" "}
                            {expense.categoryId?.name || "Uncategorized"}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {expense.accountId?.name || "Unknown"} •{" "}
                            {formatDate(expense.date)}
                          </p>
                        </div>

                        <div
                          className={`shrink-0 font-semibold ${
                            isIncome ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {isIncome ? "+" : "-"}₹{amount.toFixed(2)}
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="flex-1 rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(expense)}
                          className="flex-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ===================================================== */}
      {/* ADD MODAL */}
      {/* ===================================================== */}

      <AddExpenseModal
        isOpen={addModalOpen}
        onClose={closeAddModal}
        onSuccess={handleAddSuccess}
      />

      {/* ===================================================== */}
      {/* EDIT MODAL */}
      {/* ===================================================== */}

      <EditExpenseModal
        isOpen={editModalOpen}
        expense={selectedExpense}
        onClose={closeEditModal}
        onSuccess={handleEditSuccess}
      />

      {/* ===================================================== */}
      {/* DELETE MODAL */}
      {/* ===================================================== */}

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
