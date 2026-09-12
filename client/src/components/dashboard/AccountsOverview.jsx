import { Building2, Wallet, CreditCard, ChevronRight } from "lucide-react";

import { Link } from "react-router-dom";

const AccountsOverview = ({ accounts = [] }) => {
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case "BANK":
        return Building2;

      case "CREDIT_CARD":
      case "CREDIT":
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

      case "CREDIT_CARD":
      case "CREDIT":
        return "bg-orange-100 text-orange-500";

      case "CASH":
        return "bg-green-100 text-green-600";

      case "WALLET":
        return "bg-purple-100 text-purple-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const getAccountType = (type) => {
    switch (type) {
      case "BANK":
        return "Bank Account";

      case "CREDIT_CARD":
      case "CREDIT":
        return "Credit Card";

      case "CASH":
        return "Cash Account";

      case "WALLET":
        return "Wallet Account";

      default:
        return "Account";
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <h2 className="text-lg font-bold text-gray-900">Accounts Overview</h2>

        <Link
          to="/accounts"
          className="text-sm font-semibold text-purple-600 hover:text-purple-700"
        >
          View All
        </Link>
      </div>

      {/* Accounts */}

      <div>
        {accounts.length > 0 ? (
          accounts.slice(0, 4).map((account) => {
            const Icon = getAccountIcon(account.type);

            const balance = Number(
              account.balance?.$numberDecimal ??
                account.balance ??
                account.currentBalance?.$numberDecimal ??
                account.currentBalance ??
                0,
            );

            const isCredit =
              account.type === "CREDIT_CARD" || account.type === "CREDIT";

            return (
              <div
                key={account._id}
                className="flex items-center justify-between border-b border-gray-100 py-4 last:border-b-0"
              >
                {/* Left */}

                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getIconStyle(
                      account.type,
                    )}`}
                  >
                    <Icon size={20} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {account.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {getAccountType(account.type)}
                    </p>
                  </div>
                </div>

                {/* Right */}

                <div className="ml-3 flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        isCredit ? "text-red-500" : "text-gray-900"
                      }`}
                    >
                      {isCredit ? "-" : ""}
                      {formatCurrency(Math.abs(balance))}
                    </p>

                    <p
                      className={`mt-1 text-xs ${
                        isCredit ? "text-gray-500" : "text-green-600"
                      }`}
                    >
                      {isCredit ? "Used / Outstanding" : "Available Balance"}
                    </p>
                  </div>

                  <Link
                    to="/accounts"
                    className="text-gray-400 transition hover:text-purple-600"
                  >
                    <ChevronRight size={18} />
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
            <Wallet size={38} className="mb-3 text-gray-300" />

            <p className="text-sm font-semibold text-gray-700">
              No accounts found
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Add an account to start tracking your balance.
            </p>

            <Link
              to="/accounts"
              className="mt-4 text-sm font-semibold text-purple-600"
            >
              Add Account
            </Link>
          </div>
        )}
      </div>

      {/* Information */}

      {accounts.length > 0 && (
        <div className="mt-3 rounded-lg border border-purple-100 bg-purple-50 p-3">
          <p className="text-xs leading-5 text-gray-600">
            Account balance shows the available amount for spending. Credit Card
            shows used amount (negative balance).
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountsOverview;
