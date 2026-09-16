import { useState } from "react";
import { X } from "lucide-react";

import { createAccount } from "../../api/accountApi";

const AddAccountModal = ({ isOpen, onClose, onAccountCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "BANK",
    balance: "",
    creditLimit: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) {
    return null;
  }

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE ACCOUNT TYPE CHANGE
  // =====================================================

  const handleTypeChange = (e) => {
    const type = e.target.value;

    setFormData((prev) => ({
      ...prev,
      type,

      // Clear balance when switching to credit card
      balance: type === "CREDIT_CARD" ? "" : prev.balance,

      // Clear credit limit when switching away
      creditLimit: type !== "CREDIT_CARD" ? "" : prev.creditLimit,
    }));

    setError("");
  };

  // =====================================================
  // HANDLE SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      // -----------------------------------------------
      // Validate Account Name
      // -----------------------------------------------

      if (!formData.name.trim()) {
        setError("Account name is required");
        return;
      }

      // -----------------------------------------------
      // CREDIT CARD
      // -----------------------------------------------

      if (formData.type === "CREDIT_CARD") {
        if (formData.creditLimit === "") {
          setError("Credit limit is required");
          return;
        }

        if (Number(formData.creditLimit) <= 0) {
          setError("Credit limit must be greater than 0");
          return;
        }
      }

      // -----------------------------------------------
      // NORMAL ACCOUNT
      // -----------------------------------------------

      if (formData.type !== "CREDIT_CARD") {
        if (formData.balance === "") {
          setError("Balance is required");
          return;
        }

        if (Number(formData.balance) < 0) {
          setError("Balance cannot be negative");
          return;
        }
      }

      // -----------------------------------------------
      // DATA TO SEND
      // -----------------------------------------------

      const accountData = {
        name: formData.name.trim(),

        type: formData.type,

        // Credit card starts with 0 outstanding
        balance: formData.type === "CREDIT_CARD" ? 0 : Number(formData.balance),

        // Credit limit only for credit card
        creditLimit:
          formData.type === "CREDIT_CARD" ? Number(formData.creditLimit) : null,
      };

      console.log("Creating account:", accountData);

      // -----------------------------------------------
      // API CALL
      // -----------------------------------------------

      const response = await createAccount(accountData);

      console.log("Account created:", response);

      // -----------------------------------------------
      // RESET FORM
      // -----------------------------------------------

      setFormData({
        name: "",
        type: "BANK",
        balance: "",
        creditLimit: "",
      });

      // -----------------------------------------------
      // SEND ACCOUNT TO PARENT
      // -----------------------------------------------

      onAccountCreated(response);

      // -----------------------------------------------
      // CLOSE MODAL
      // -----------------------------------------------

      onClose();
    } catch (error) {
      console.error("Create account error:", error);

      setError(error.response?.data?.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          {/* =================================================
              ACCOUNT NAME
          ================================================= */}

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

          {/* =================================================
              ACCOUNT TYPE
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Account Type
            </label>

            <select
              name="type"
              value={formData.type}
              onChange={handleTypeChange}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            >
              <option value="BANK">Bank Account</option>

              <option value="CASH">Cash</option>

              <option value="WALLET">Wallet</option>

              <option value="CREDIT_CARD">Credit Card</option>
            </select>
          </div>

          {/* =================================================
              NORMAL ACCOUNT → INITIAL BALANCE
          ================================================= */}

          {formData.type !== "CREDIT_CARD" && (
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
          )}

          {/* =================================================
              CREDIT CARD → CREDIT LIMIT
          ================================================= */}

          {formData.type === "CREDIT_CARD" && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Credit Limit
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  ₹
                </span>

                <input
                  type="number"
                  name="creditLimit"
                  value={formData.creditLimit}
                  onChange={handleChange}
                  placeholder="50000.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-200 py-2.5 pl-8 pr-4 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
                />
              </div>

              <p className="mt-2 text-xs text-gray-500">
                Enter the maximum amount you can spend using this card.
              </p>
            </div>
          )}

          {/* =================================================
              BUTTONS
          ================================================= */}

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
