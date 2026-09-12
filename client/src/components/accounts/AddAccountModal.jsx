import { useState } from "react";
import { X } from "lucide-react";

import { createAccount } from "../../api/accountApi";

const AddAccountModal = ({ isOpen, onClose, onAccountCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "BANK",
    balance: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) {
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
        return;
      }

      if (formData.balance === "") {
        setError("Balance is required");
        return;
      }

      const response = await createAccount({
        name: formData.name.trim(),
        type: formData.type,
        balance: Number(formData.balance),
      });

      console.log("Account created:", response);

      setFormData({
        name: "",
        type: "BANK",
        balance: "",
      });

      onAccountCreated(response);

      onClose();
    } catch (error) {
      console.error("Create account error:", error);

      setError(error.response?.data?.message || "Failed to create account");
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
            <h2 className="text-lg font-bold text-gray-900">Add Account</h2>

            <p className="mt-1 text-xs text-gray-500">
              Add a bank account, wallet or card.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
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

          {/* Balance */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Initial Balance
            </label>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                ₹
              </span>

              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-8 pr-4 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;
