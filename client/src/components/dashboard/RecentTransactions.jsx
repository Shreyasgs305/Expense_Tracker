import { Receipt, Plus, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const RecentTransactions = ({ transactions = [] }) => {
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Recent Transactions
          </h2>

          <p className="mt-1 text-sm text-gray-500">Your latest transactions</p>
        </div>

        <Link
          to="/expenses"
          className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700"
        >
          View All
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Table */}

      {transactions.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[650px]">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500">
                  Date
                </th>

                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500">
                  Description
                </th>

                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500">
                  Category
                </th>

                <th className="px-2 py-3 text-left text-xs font-semibold text-gray-500">
                  Paid From
                </th>

                <th className="px-2 py-3 text-right text-xs font-semibold text-gray-500">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {transactions.slice(0, 5).map((transaction) => {
                const isIncome = transaction.type === "INCOME";

                const amount = Number(
                  transaction.amount?.$numberDecimal ?? transaction.amount ?? 0,
                );

                const categoryColor =
                  transaction.categoryId?.color || "#7c3aed";

                return (
                  <tr
                    key={transaction._id}
                    className="border-b border-gray-50 last:border-b-0"
                  >
                    {/* Date */}

                    <td className="px-2 py-4 text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </td>

                    {/* Description */}

                    <td className="px-2 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                          style={{
                            backgroundColor: `${categoryColor}20`,
                            color: categoryColor,
                          }}
                        >
                          {isIncome ? (
                            <Plus size={17} />
                          ) : (
                            <Receipt size={17} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {transaction.description || "Unnamed Transaction"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Category */}

                    <td className="px-2 py-4">
                      <span
                        className="rounded-md px-2.5 py-1 text-xs font-medium"
                        style={{
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                        }}
                      >
                        {transaction.categoryId?.name || "Uncategorized"}
                      </span>
                    </td>

                    {/* Account */}

                    <td className="px-2 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-700">
                          {transaction.accountId?.name || "Unknown Account"}
                        </span>
                      </div>
                    </td>

                    {/* Amount */}

                    <td
                      className={`px-2 py-4 text-right text-sm font-bold ${
                        isIncome ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {isIncome ? "+" : "-"}
                      {formatCurrency(amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <Receipt size={40} className="mb-3 text-gray-300" />

          <p className="text-sm font-semibold text-gray-700">
            No transactions yet
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Your recent transactions will appear here.
          </p>

          <Link
            to="/expenses/add"
            className="mt-4 text-sm font-semibold text-purple-600"
          >
            Add Expense
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
