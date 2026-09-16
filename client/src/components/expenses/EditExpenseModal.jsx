import { useEffect, useState } from "react";

import { updateExpense } from "../../api/expenseApi";
import { getAccounts } from "../../api/accountApi";
import { getCategories } from "../../api/categoryApi";

const EditExpenseModal = ({ isOpen, expense, onClose, onSuccess }) => {
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingData, setLoadingData] = useState(false);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    amount: "",
    type: "EXPENSE",
    category: "",
    account: "",
    date: "",
    description: "",
    paymentMethod: "UPI",
    notes: "",
  });

  // =========================================================
  // LOAD ACCOUNTS & CATEGORIES
  // =========================================================

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        setLoadingData(true);
        setError("");

        const [accountsResponse, categoriesResponse] = await Promise.all([
          getAccounts(),
          getCategories(),
        ]);

        setAccounts(accountsResponse?.data || accountsResponse?.accounts || []);

        setCategories(
          categoriesResponse?.data || categoriesResponse?.categories || [],
        );
      } catch (err) {
        console.error("Load edit data error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load accounts and categories",
        );
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [isOpen]);

  // =========================================================
  // SET EXPENSE DATA
  // =========================================================

  useEffect(() => {
    if (!expense) return;

    let amount = "";

    if (typeof expense.amount === "string") {
      amount = expense.amount;
    } else if (typeof expense.amount === "number") {
      amount = expense.amount.toString();
    } else if (expense.amount?.$numberDecimal) {
      amount = expense.amount.$numberDecimal;
    } else if (expense.amount?.toString) {
      amount = expense.amount.toString();
    }

    const date = expense.date
      ? new Date(expense.date).toISOString().split("T")[0]
      : "";

    setFormData({
      amount,

      type: expense.type || "EXPENSE",

      category:
        typeof expense.categoryId === "object"
          ? expense.categoryId?._id || ""
          : expense.categoryId || "",

      account:
        typeof expense.accountId === "object"
          ? expense.accountId?._id || ""
          : expense.accountId || "",

      date,

      description: expense.description || "",

      paymentMethod: expense.paymentMethod || "UPI",

      notes: expense.notes || "",
    });
  }, [expense]);

  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        type: value,
        category: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    if (saving) return;

    setError("");
    onClose();
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!expense?._id) {
      setError("Transaction ID is missing");
      return;
    }

    if (!formData.amount) {
      setError("Amount is required");
      return;
    }

    if (Number(formData.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (!formData.account) {
      setError("Please select an account");
      return;
    }

    if (!formData.category) {
      setError("Please select a category");
      return;
    }

    if (!formData.date) {
      setError("Please select a date");
      return;
    }

    if (!formData.description.trim()) {
      setError("Description is required");
      return;
    }

    try {
      setSaving(true);

      const data = {
        amount: Number(formData.amount),

        type: formData.type,

        category: formData.category,

        account: formData.account,

        date: formData.date,

        description: formData.description.trim(),

        paymentMethod: formData.paymentMethod,

        notes: formData.notes.trim() || undefined,
      };

      const response = await updateExpense(expense._id, data);

      if (response.success === false) {
        setError(response.message || "Failed to update transaction");
        return;
      }

      onSuccess(response.data);

      onClose();
    } catch (err) {
      console.error("Update expense error:", err);

      setError(err.response?.data?.message || "Failed to update transaction");
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // FILTER CATEGORIES
  // =========================================================

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type,
  );

  if (!isOpen) {
    return null;
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Edit Transaction
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Update your transaction details
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-2xl text-gray-400 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loadingData ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : (
            <>
              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Transaction Type
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        type: "EXPENSE",
                        category: "",
                      }))
                    }
                    className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                      formData.type === "EXPENSE"
                        ? "border-red-500 bg-red-50 text-red-600"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Expense
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        type: "INCOME",
                        category: "",
                      }))
                    }
                    className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                      formData.type === "INCOME"
                        ? "border-green-500 bg-green-50 text-green-600"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Account */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Account
                </label>

                <select
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">Select account</option>

                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="">Select category</option>

                  {filteredCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.icon ? `${category.icon} ` : ""}
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Date
                </label>

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description
                </label>

                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter description"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
                >
                  <option value="UPI">UPI</option>
                  <option value="BANK">Bank</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Optional notes"
                  className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Updating..." : "Update Transaction"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default EditExpenseModal;
