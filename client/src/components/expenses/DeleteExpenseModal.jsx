import { useState } from "react";

import { deleteExpense } from "../../api/expenseApi";

const DeleteExpenseModal = ({ isOpen, expense, onClose, onSuccess }) => {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !expense) {
    return null;
  }

  // =========================================================
  // GET AMOUNT
  // =========================================================

  const getAmount = () => {
    if (
      typeof expense.amount === "string" ||
      typeof expense.amount === "number"
    ) {
      return Number(expense.amount);
    }

    if (expense.amount?.$numberDecimal) {
      return Number(expense.amount.$numberDecimal);
    }

    return Number(expense.amount?.toString?.() || 0);
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError("");

      const response = await deleteExpense(expense._id);

      if (response.success === false) {
        setError(response.message || "Failed to delete transaction");

        return;
      }

      onSuccess(expense._id);

      onClose();
    } catch (err) {
      console.error("Delete expense error:", err);

      setError(err.response?.data?.message || "Failed to delete transaction");
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="border-b px-6 py-5">
          <h2 className="text-xl font-semibold text-gray-900">
            Delete Transaction
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            This action cannot be undone.
          </p>
        </div>

        {/* Body */}
        <div className="space-y-4 p-6">
          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="rounded-xl bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Description</span>

              <span className="font-medium text-gray-900">
                {expense.description || "Transaction"}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Amount</span>

              <span
                className={`font-semibold ${
                  expense.type === "INCOME" ? "text-green-600" : "text-red-600"
                }`}
              >
                {expense.type === "INCOME" ? "+" : "-"}₹{getAmount().toFixed(2)}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-500">Type</span>

              <span className="font-medium text-gray-900">{expense.type}</span>
            </div>
          </div>

          <p className="text-sm leading-6 text-gray-600">
            Are you sure you want to delete this transaction? The account
            balance will also be updated.
          </p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteExpenseModal;
