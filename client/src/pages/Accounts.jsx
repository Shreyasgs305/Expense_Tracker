import { useEffect, useState } from "react";
import {
  Building2,
  Wallet,
  CreditCard,
  Plus,
  MoreVertical,
} from "lucide-react";

import PageLayout from "../components/layout/PageLayout";
import AddAccountModal from "../components/accounts/AddAccountModal";

import { getAccounts } from "../api/accountApi";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAccounts();

      console.log("Accounts API:", response);

      setAccounts(response.data || response.accounts || []);
    } catch (error) {
      console.error("Accounts error:", error);

      setError(error.response?.data?.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getIcon = (type) => {
    switch (type) {
      case "BANK":
        return Building2;

      case "CREDIT":
      case "CREDIT_CARD":
        return CreditCard;

      case "CASH":
      case "WALLET":
        return Wallet;

      default:
        return Wallet;
    }
  };

  const getIconStyle = (type) => {
    switch (type) {
      case "BANK":
        return "bg-blue-100 text-blue-600";

      case "CREDIT":
      case "CREDIT_CARD":
        return "bg-orange-100 text-orange-600";

      case "CASH":
        return "bg-green-100 text-green-600";

      case "WALLET":
        return "bg-purple-100 text-purple-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getAccountTypeName = (type) => {
    switch (type) {
      case "BANK":
        return "Bank Account";

      case "CASH":
        return "Cash";

      case "WALLET":
        return "Wallet";

      case "CREDIT":
      case "CREDIT_CARD":
        return "Credit Card";

      default:
        return "Account";
    }
  };

  const handleAccountCreated = async () => {
    await loadAccounts();
  };

  return (
    <PageLayout
      title="Accounts"
      subtitle="Manage your bank accounts, wallets and cards"
    >
      <div className="space-y-6">
        {/* =========================
            PAGE HEADER
        ========================== */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Accounts</h2>

            <p className="mt-1 text-sm text-gray-500">
              Keep track of all your money in one place.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-purple-700"
          >
            <Plus size={18} />
            Add Account
          </button>
        </div>

        {/* =========================
            LOADING
        ========================== */}
        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-purple-600" />

              <p className="mt-3 text-sm text-gray-500">Loading accounts...</p>
            </div>
          </div>
        )}

        {/* =========================
            ERROR
        ========================== */}
        {!loading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-center">
            <p className="font-medium text-red-600">{error}</p>

            <button
              onClick={loadAccounts}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* =========================
            ACCOUNTS
        ========================== */}
        {!loading && !error && (
          <>
            {accounts.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {accounts.map((account) => {
                  const Icon = getIcon(account.type);

                  const balance = Number(
                    account.balance?.$numberDecimal ??
                      account.balance ??
                      account.currentBalance?.$numberDecimal ??
                      account.currentBalance ??
                      0,
                  );

                  const isCredit =
                    account.type === "CREDIT" || account.type === "CREDIT_CARD";

                  return (
                    <div
                      key={account._id}
                      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      {/* Card top */}
                      <div className="flex items-start justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${getIconStyle(
                              account.type,
                            )}`}
                          >
                            <Icon size={23} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate font-bold text-gray-900">
                              {account.name}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500">
                              {getAccountTypeName(account.type)}
                            </p>
                          </div>
                        </div>

                        <button className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">
                          <MoreVertical size={19} />
                        </button>
                      </div>

                      {/* Balance */}
                      <div className="mt-8">
                        <p className="text-xs font-medium text-gray-500">
                          {isCredit ? "Outstanding" : "Current Balance"}
                        </p>

                        <p
                          className={`mt-1 text-2xl font-bold ${
                            isCredit ? "text-red-500" : "text-gray-900"
                          }`}
                        >
                          {isCredit ? "-" : ""}
                          {formatCurrency(Math.abs(balance))}
                        </p>
                      </div>

                      {/* Bottom */}
                      <div className="mt-5 border-t border-gray-100 pt-4">
                        <p className="text-xs text-gray-400">Account ID</p>

                        <p className="mt-1 truncate text-xs font-medium text-gray-600">
                          {account._id}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* =========================
                 EMPTY STATE
              ========================== */
              <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-gray-100 bg-white px-5 text-center shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <Wallet size={30} />
                </div>

                <h3 className="mt-4 text-lg font-bold text-gray-900">
                  No accounts yet
                </h3>

                <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500">
                  Add your first bank account, wallet or credit card to start
                  tracking your finances.
                </p>

                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
                >
                  <Plus size={18} />
                  Add Account
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* =========================
          ADD ACCOUNT MODAL
      ========================== */}
      <AddAccountModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAccountCreated={handleAccountCreated}
      />
    </PageLayout>
  );
};

export default Accounts;
