import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { updateAccount } from "../../api/accountApi";

const EditAccountModal = ({ isOpen, account, onClose, onAccountUpdated }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "BANK",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || "",
        type: account.type || "BANK",
      });

      setError("");
    }
  }, [account]);

  if (!isOpen || !account) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      if (!formData.name.trim()) {
        setError("Account name is required");
        setLoading(false);
        return;
      }

      await updateAccount(account._id, {
        name: formData.name.trim(),
        type: formData.type,
      });

      await onAccountUpdated();

      onClose();
    } catch (error) {
      console.error("Update account error:", error);

      setError(error.response?.data?.message || "Failed to update account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Edit Account</h2>

            <p className="mt-1 text-xs text-gray-500">
              Update your account information.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* Error */}
          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* Account Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Account Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. SBI Account"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Account Type */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Account Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              <option value="BANK">Bank Account</option>

              <option value="CASH">Cash</option>

              <option value="WALLET">Wallet</option>

              <option value="CREDIT_CARD">Credit Card</option>
            </select>
          </div>

          {/* Current Balance - Read Only */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Current Balance
            </label>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600">
              ₹
              {Number(
                account.balance?.$numberDecimal ?? account.balance ?? 0,
              ).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>

            <p className="mt-1 text-xs text-gray-400">
              Balance is managed separately through transactions.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAccountModal;
