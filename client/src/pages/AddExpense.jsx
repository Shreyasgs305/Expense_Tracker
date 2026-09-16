import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageLayout from "../components/layout/PageLayout";
import { createExpense } from "../api/expenseApi";
import { getAccounts } from "../api/accountApi";
import { getCategories } from "../api/categoryApi";

const AddExpense = () => {
  const navigate = useNavigate();

  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    type: "EXPENSE",
    amount: "",
    account: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    paymentMethod: "UPI",
    notes: "",
  });

  // =====================================================
  // LOAD ACCOUNTS AND CATEGORIES
  // =====================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [accountsResponse, categoriesResponse] = await Promise.all([
          getAccounts(),
          getCategories(),
        ]);

        setAccounts(accountsResponse.accounts || accountsResponse.data || []);

        setCategories(
          categoriesResponse.categories || categoriesResponse.data || [],
        );
      } catch (err) {
        console.error("Load add expense data error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load accounts and categories",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  // =====================================================
  // HANDLE TYPE CHANGE
  // =====================================================

  const handleTypeChange = (e) => {
    const type = e.target.value;

    setFormData((prev) => ({
      ...prev,
      type,
      category: "",
    }));

    setError("");
  };

  // =====================================================
  // FILTER CATEGORIES
  // =====================================================

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type,
  );

  // =====================================================
  // SELECTED ACCOUNT
  // =====================================================

  const selectedAccount = accounts.find(
    (account) => account._id === formData.account,
  );

  // =====================================================
  // CREDIT CARD CHECK
  // =====================================================

  const isCreditCard = selectedAccount?.type === "CREDIT_CARD";

  // =====================================================
  // GET CREDIT CARD VALUES
  // =====================================================

  const getNumberValue = (value) => {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === "object" && value.$numberDecimal) {
      return Number(value.$numberDecimal);
    }

    return Number(value);
  };

  const creditLimit = isCreditCard
    ? getNumberValue(selectedAccount?.creditLimit)
    : 0;

  const outstanding = isCreditCard
    ? Math.abs(getNumberValue(selectedAccount?.balance))
    : 0;

  const availableCredit = Math.max(creditLimit - outstanding, 0);

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -----------------------------------------------
    // Amount validation
    // -----------------------------------------------

    if (!formData.amount || Number(formData.amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    const amount = Number(formData.amount);

    // -----------------------------------------------
    // Account validation
    // -----------------------------------------------

    if (!formData.account) {
      setError("Please select an account.");
      return;
    }

    // -----------------------------------------------
    // Credit card validation
    // -----------------------------------------------

    if (
      formData.type === "EXPENSE" &&
      isCreditCard &&
      amount > availableCredit
    ) {
      setError(
        `Insufficient available credit. You can spend up to ₹${availableCredit.toLocaleString(
          "en-IN",
        )}.`,
      );
      return;
    }

    // -----------------------------------------------
    // Category validation
    // -----------------------------------------------

    if (!formData.category && formData.type !== "TRANSFER") {
      setError("Please select a category.");
      return;
    }

    // -----------------------------------------------
    // Description validation
    // -----------------------------------------------

    if (!formData.description.trim()) {
      setError("Please enter a description.");
      return;
    }

    // -----------------------------------------------
    // Date validation
    // -----------------------------------------------

    if (!formData.date) {
      setError("Please select a date.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        amount,

        account: formData.account,

        category: formData.type === "TRANSFER" ? undefined : formData.category,

        date: formData.date,

        description: formData.description.trim(),

        type: formData.type,

        paymentMethod: isCreditCard ? "CARD" : formData.paymentMethod,

        notes: formData.notes.trim(),
      };

      console.log("Creating transaction:", data);

      await createExpense(data);

      // Go back to expenses
      navigate("/expenses");
    } catch (err) {
      console.error("Create expense error:", err);

      setError(err.response?.data?.message || "Failed to create transaction.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <PageLayout title="Add Expense" subtitle="Add a new transaction">
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </PageLayout>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <PageLayout title="Add Expense" subtitle="Add a new income or expense">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          to="/expenses"
          className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          ← Back to Expenses
        </Link>

        {/* Form Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit}>
            {/* Error */}
            {error && (
              <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* =================================================
                TRANSACTION TYPE
            ================================================= */}

            <div className="mb-6">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Transaction Type
              </label>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() =>
                    handleTypeChange({
                      target: {
                        value: "EXPENSE",
                      },
                    })
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    formData.type === "EXPENSE"
                      ? "border-red-500 bg-red-50 text-red-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Expense
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleTypeChange({
                      target: {
                        value: "INCOME",
                      },
                    })
                  }
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    formData.type === "INCOME"
                      ? "border-green-500 bg-green-50 text-green-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  Income
                </button>
              </div>
            </div>

            {/* =================================================
                AMOUNT
            ================================================= */}

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Amount
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                  ₹
                </span>

                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full rounded-xl border border-gray-300 py-3 pl-9 pr-4 outline-none transition focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />
              </div>
            </div>

            {/* =================================================
                ACCOUNT + CATEGORY
            ================================================= */}

            <div className="grid gap-5 md:grid-cols-2">
              {/* Account */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Account
                </label>

                <select
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                >
                  <option value="">Select account</option>

                  {accounts.map((account) => (
                    <option key={account._id} value={account._id}>
                      {account.name}
                      {account.type === "CREDIT_CARD" ? " (Credit Card)" : ""}
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
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                >
                  <option value="">Select category</option>

                  {filteredCategories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* =================================================
                CREDIT CARD INFORMATION
            ================================================= */}

            {isCreditCard && formData.type === "EXPENSE" && (
              <div className="mt-5 rounded-xl border border-purple-100 bg-purple-50 p-4">
                <p className="text-sm font-semibold text-purple-900">
                  Credit Card
                </p>

                <div className="mt-3 grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Credit Limit</p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      ₹{creditLimit.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Outstanding</p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      ₹{outstanding.toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">Available</p>

                    <p className="mt-1 text-sm font-bold text-gray-900">
                      ₹{availableCredit.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                DATE + PAYMENT METHOD
            ================================================= */}

            <div className="mt-5 grid gap-5 md:grid-cols-2">
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
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Payment Method
                </label>

                <select
                  name="paymentMethod"
                  value={isCreditCard ? "CARD" : formData.paymentMethod}
                  onChange={handleChange}
                  disabled={isCreditCard}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100 disabled:bg-gray-100 disabled:text-gray-500"
                >
                  <option value="UPI">UPI</option>

                  <option value="BANK">Bank</option>

                  <option value="CASH">Cash</option>

                  <option value="CARD">Card</option>
                </select>
              </div>
            </div>

            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Description
              </label>

              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="e.g. Grocery shopping"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* =================================================
                NOTES
            ================================================= */}

            <div className="mt-5">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Notes
                <span className="ml-1 text-gray-400">(Optional)</span>
              </label>

              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                placeholder="Add any additional notes..."
                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-gray-500 focus:ring-2 focus:ring-gray-100"
              />
            </div>

            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/expenses"
                className="rounded-xl border border-gray-300 px-6 py-3 text-center text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : formData.type === "INCOME"
                    ? "Add Income"
                    : "Add Expense"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </PageLayout>
  );
};

export default AddExpense;
