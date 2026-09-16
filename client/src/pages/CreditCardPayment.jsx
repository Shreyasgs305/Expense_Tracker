import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout";
import { getAccounts } from "../api/accountApi";

import { createCreditCardPayment } from "../api/expenseApi";

const CreditCardPayment = () => {
  const [accounts, setAccounts] = useState([]);

  const [formData, setFormData] = useState({
    fromAccount: "",
    creditCardAccount: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "Credit card payment",
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingAccounts, setFetchingAccounts] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ============================================================
  // LOAD ACCOUNTS
  // ============================================================

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        setFetchingAccounts(true);

        const response = await getAccounts();

        const accountList = response?.data || response?.accounts || [];

        setAccounts(accountList);
      } catch (err) {
        console.error("Failed to load accounts:", err);

        setError(err?.response?.data?.message || "Failed to load accounts");
      } finally {
        setFetchingAccounts(false);
      }
    };

    loadAccounts();
  }, []);

  // ============================================================
  // ACCOUNT TYPES
  // ============================================================

  const paymentAccounts = accounts.filter(
    (account) =>
      ["BANK", "CASH", "WALLET"].includes(account.type) &&
      account.isActive !== false,
  );

  const creditCards = accounts.filter(
    (account) => account.type === "CREDIT_CARD" && account.isActive !== false,
  );

  // ============================================================
  // SELECTED CREDIT CARD
  // ============================================================

  const selectedCard = creditCards.find(
    (account) => account._id === formData.creditCardAccount,
  );

  const getBalance = (account) => {
    if (!account) return 0;

    return Number(account.balance?.$numberDecimal ?? account.balance ?? 0);
  };

  const getCreditLimit = (account) => {
    if (!account) return 0;

    return Number(
      account.creditLimit?.$numberDecimal ?? account.creditLimit ?? 0,
    );
  };

  const outstanding = selectedCard ? Math.abs(getBalance(selectedCard)) : 0;

  const creditLimit = selectedCard ? getCreditLimit(selectedCard) : 0;

  const availableCredit = Math.max(creditLimit - outstanding, 0);

  // ============================================================
  // INPUT HANDLER
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setMessage("");
  };

  // ============================================================
  // SUBMIT PAYMENT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const amount = Number(formData.amount);

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!formData.fromAccount) {
      setError("Please select the account you are paying from.");
      return;
    }

    if (!formData.creditCardAccount) {
      setError("Please select a credit card.");
      return;
    }

    if (!amount || amount <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (!formData.date) {
      setError("Please select a payment date.");
      return;
    }

    if (selectedCard && amount > outstanding) {
      setError(
        `Payment cannot exceed outstanding amount of ₹${outstanding.toFixed(
          2,
        )}`,
      );
      return;
    }

    // ----------------------------------------------------------
    // CHECK PAYMENT ACCOUNT
    // ----------------------------------------------------------

    const selectedPaymentAccount = paymentAccounts.find(
      (account) => account._id === formData.fromAccount,
    );

    const paymentBalance = getBalance(selectedPaymentAccount);

    if (amount > paymentBalance) {
      setError(
        `Insufficient balance. Available balance is ₹${paymentBalance.toFixed(
          2,
        )}`,
      );
      return;
    }

    try {
      setLoading(true);

      await createCreditCardPayment({
        fromAccount: formData.fromAccount,
        creditCardAccount: formData.creditCardAccount,
        amount,
        date: formData.date,
        description: formData.description.trim() || "Credit card payment",
        notes: formData.notes.trim() || null,
      });

      setMessage(`Payment of ₹${amount.toFixed(2)} completed successfully.`);

      // Clear amount after successful payment
      setFormData((prev) => ({
        ...prev,
        amount: "",
        notes: "",
      }));

      // Reload accounts so balances update
      const response = await getAccounts();

      const accountList = response?.data || response?.accounts || [];

      setAccounts(accountList);
    } catch (err) {
      console.error("Credit card payment error:", err);

      setError(
        err?.response?.data?.message || "Failed to make credit card payment.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mx-auto max-w-3xl">
          {/* HEADER */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Credit Card Payment
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Pay your credit card outstanding balance.
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {message && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* FORM CARD */}
          <div className="rounded-xl bg-white p-6 shadow-sm">
            {fetchingAccounts ? (
              <div className="py-10 text-center text-gray-500">
                Loading accounts...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* PAYMENT ACCOUNT */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Pay From
                  </label>

                  <select
                    name="fromAccount"
                    value={formData.fromAccount}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">Select bank / cash / wallet</option>

                    {paymentAccounts.map((account) => (
                      <option key={account._id} value={account._id}>
                        {account.name} — ₹{getBalance(account).toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CREDIT CARD */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Credit Card
                  </label>

                  <select
                    name="creditCardAccount"
                    value={formData.creditCardAccount}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  >
                    <option value="">Select credit card</option>

                    {creditCards.map((card) => {
                      const cardOutstanding = Math.abs(getBalance(card));

                      const cardLimit = getCreditLimit(card);

                      const cardAvailable = Math.max(
                        cardLimit - cardOutstanding,
                        0,
                      );

                      return (
                        <option key={card._id} value={card._id}>
                          {card.name} — Outstanding ₹
                          {cardOutstanding.toFixed(2)} | Available ₹
                          {cardAvailable.toFixed(2)}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* CREDIT CARD INFO */}
                {selectedCard && (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-xs text-gray-500">Credit Limit</p>

                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        ₹{creditLimit.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-red-50 p-4">
                      <p className="text-xs text-gray-500">Outstanding</p>

                      <p className="mt-1 text-lg font-semibold text-red-600">
                        ₹{outstanding.toFixed(2)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4">
                      <p className="text-xs text-gray-500">Available Credit</p>

                      <p className="mt-1 text-lg font-semibold text-green-600">
                        ₹{availableCredit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                {/* AMOUNT */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Payment Amount
                  </label>

                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    placeholder="Enter payment amount"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                  {selectedCard && (
                    <p className="mt-2 text-xs text-gray-500">
                      Maximum payment: ₹{outstanding.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* DATE */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Payment Date
                  </label>

                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Description
                  </label>

                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Credit card payment"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                {/* NOTES */}
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

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Processing Payment..." : "Pay Credit Card"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreditCardPayment;
