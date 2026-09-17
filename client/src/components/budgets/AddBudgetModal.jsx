import { useEffect, useState } from "react";
import { X } from "lucide-react";

const AddBudgetModal = ({
  isOpen,
  onClose,
  onSubmit,
  categories = [],
  editingBudget = null,
}) => {
  const [categoryId, setCategoryId] = useState("");

  const [amount, setAmount] = useState("");

  const [month, setMonth] = useState("");

  const [alertPercentage, setAlertPercentage] = useState("80");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // SET FORM DATA
  // ==========================================

  useEffect(() => {
    if (!isOpen) return;

    if (editingBudget) {
      setCategoryId(
        editingBudget.categoryId?._id || editingBudget.categoryId || "",
      );

      setAmount(
        editingBudget.amount?.$numberDecimal || editingBudget.amount || "",
      );

      setMonth(editingBudget.month || "");

      setAlertPercentage(editingBudget.alertPercentage ?? 80);
    } else {
      const date = new Date();

      const currentMonth = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, "0")}`;

      setCategoryId("");
      setAmount("");
      setMonth(currentMonth);
      setAlertPercentage("80");
    }
  }, [isOpen, editingBudget]);

  // ==========================================
  // SUBMIT
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!categoryId) {
      alert("Please select a category");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    if (!month) {
      alert("Please select a month");
      return;
    }

    if (Number(alertPercentage) < 1 || Number(alertPercentage) > 100) {
      alert("Alert percentage must be between 1 and 100");
      return;
    }

    try {
      setIsSubmitting(true);

      await onSubmit({
        // IMPORTANT:
        // Backend expects "category"
        category: categoryId,

        amount: Number(amount),

        month,

        alertPercentage: Number(alertPercentage),
      });
    } catch (error) {
      console.error("Budget submit error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // CLOSE
  // ==========================================

  const handleClose = () => {
    if (isSubmitting) return;

    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {editingBudget ? "Edit Budget" : "Add Budget"}
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Set a spending limit for a category
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORM */}

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {/* CATEGORY */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Category
            </label>

            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.icon ? `${category.icon} ` : ""}
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* MONTH */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Month
            </label>

            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* AMOUNT */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Budget Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₹
              </span>

              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter budget amount"
                className="w-full rounded-lg border border-gray-300 py-2.5 pl-8 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* ALERT */}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Alert Percentage
            </label>

            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={alertPercentage}
                onChange={(e) => setAlertPercentage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                %
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-400">
              You will see a warning when spending reaches this percentage.
            </p>
          </div>

          {/* BUTTONS */}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Saving..."
                : editingBudget
                  ? "Update Budget"
                  : "Add Budget"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBudgetModal;
