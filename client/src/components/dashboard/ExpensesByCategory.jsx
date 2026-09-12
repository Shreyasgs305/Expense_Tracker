import { Link } from "react-router-dom";

import ExpenseDonutChart from "../charts/ExpenseDonutChart";

const ExpensesByCategory = ({ categories = [] }) => {
  const total = categories.reduce(
    (sum, category) => sum + Number(category.amount || 0),
    0,
  );

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm md:p-6">
      {/* Header */}

      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Expenses by Category
          </h2>

          <p className="mt-1 text-sm text-gray-500">This month's spending</p>
        </div>

        <Link
          to="/reports"
          className="text-sm font-semibold text-purple-600 hover:text-purple-700"
        >
          View Report
        </Link>
      </div>

      {/* Content */}

      {categories.length > 0 ? (
        <div className="mt-6 flex flex-col items-center gap-8 lg:flex-row lg:justify-center">
          {/* Donut */}

          <ExpenseDonutChart categories={categories} />

          {/* Category List */}

          <div className="w-full space-y-4 lg:max-w-[250px]">
            {categories.map((category) => {
              const amount = Number(category.amount || 0);

              const percentage = total > 0 ? (amount / total) * 100 : 0;

              return (
                <div
                  key={category.categoryId}
                  className="flex items-center justify-between gap-4"
                >
                  {/* Category */}

                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{
                        backgroundColor: category.color || "#7c3aed",
                      }}
                    />

                    <span className="truncate text-sm font-medium text-gray-700">
                      {category.name}
                    </span>
                  </div>

                  {/* Amount + Percentage */}

                  <div className="flex shrink-0 items-center gap-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(amount)}
                    </span>

                    <span className="w-12 text-right text-xs text-gray-500">
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex min-h-[250px] items-center justify-center">
          <p className="text-sm text-gray-500">
            No expenses found for this month.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExpensesByCategory;
