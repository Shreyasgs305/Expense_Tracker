const ExpenseDonutChart = ({ categories = [] }) => {
  const total = categories.reduce(
    (sum, category) => sum + Number(category.amount || 0),
    0,
  );

  let currentAngle = 0;

  const segments = categories.map((category) => {
    const amount = Number(category.amount || 0);

    const percentage = total > 0 ? (amount / total) * 100 : 0;

    const startAngle = currentAngle;

    currentAngle += percentage * 3.6;

    return {
      ...category,
      percentage,
      startAngle,
      endAngle: currentAngle,
    };
  });

  const gradient = segments.length
    ? `conic-gradient(${segments
        .map(
          (segment) =>
            `${segment.color || "#7c3aed"} ${segment.startAngle}deg ${segment.endAngle}deg`,
        )
        .join(", ")})`
    : "#e5e7eb";

  return (
    <div className="relative flex h-52 w-52 shrink-0 items-center justify-center">
      {/* Donut */}

      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: gradient,
        }}
      />

      {/* Inner Circle */}

      <div className="absolute flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white">
        <p className="text-xs text-gray-500">Total Expenses</p>

        <p className="mt-1 text-lg font-bold text-gray-900">
          ₹
          {total.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
      </div>
    </div>
  );
};

export default ExpenseDonutChart;
