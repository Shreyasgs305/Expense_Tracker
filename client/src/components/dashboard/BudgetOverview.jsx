import { Link } from "react-router-dom";
import { ArrowRight, Target } from "lucide-react";

const BudgetOverview = ({ budgets = [], categories = [] }) => {
  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const getSpentAmount = (budget) => {
    const categoryId = budget.categoryId?._id;

    const category = categories.find((item) => item.categoryId === categoryId);

    return Number(category?.amount || 0);
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Budget Overview</h2>

          <p className="mt-1 text-sm text-gray-500">
            Track your monthly spending limits
          </p>
        </div>

        <Link
          to="/budgets"
          className="flex items-center gap-1 text-sm font-semibold text-purple-600 hover:text-purple-700"
        >
          View All
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Budget List */}

      {budgets.length > 0 ? (
        <div className="mt-5 space-y-6">
          {budgets.slice(0, 5).map((budget) => {
            const budgetAmount = Number(
              budget.amount?.$numberDecimal ?? budget.amount ?? 0,
            );

            const spentAmount = getSpentAmount(budget);

            const remainingAmount = Math.max(budgetAmount - spentAmount, 0);

            const percentage =
              budgetAmount > 0
                ? Math.min((spentAmount / budgetAmount) * 100, 100)
                : 0;

            const categoryColor = budget.categoryId?.color || "#7c3aed";

            const isOverBudget = spentAmount > budgetAmount;

            return (
              <div key={budget._id}>
                {/* Top Row */}

                <div className="mb-2 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${categoryColor}20`,
                        color: categoryColor,
                      }}
                    >
                      <Target size={18} />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {budget.categoryId?.name || "Unknown Category"}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {formatCurrency(spentAmount)} of{" "}
                        {formatCurrency(budgetAmount)}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 text-sm font-bold ${
                      isOverBudget ? "text-red-500" : "text-gray-900"
                    }`}
                  >
                    {percentage.toFixed(0)}%
                  </span>
                </div>

                {/* Progress Bar */}

                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: isOverBudget ? "#ef4444" : categoryColor,
                    }}
                  />
                </div>

                {/* Bottom Row */}

                <div className="mt-2 flex items-center justify-between">
                  <p
                    className={`text-xs ${
                      isOverBudget
                        ? "font-semibold text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {isOverBudget
                      ? `Over budget by ${formatCurrency(
                          spentAmount - budgetAmount,
                        )}`
                      : `${formatCurrency(remainingAmount)} remaining`}
                  </p>

                  <p className="text-xs text-gray-400">{budget.month}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */

        <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
          <Target size={40} className="mb-3 text-gray-300" />

          <p className="text-sm font-semibold text-gray-700">
            No budgets found
          </p>

          <p className="mt-1 text-xs text-gray-400">
            Create a budget to control your spending.
          </p>

          <Link
            to="/budgets"
            className="mt-4 text-sm font-semibold text-purple-600"
          >
            Create Budget
          </Link>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
