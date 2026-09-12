const SummaryCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = "bg-purple-100",
  iconColor = "text-purple-600",
  subtitleColor = "text-gray-500",
}) => {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>

          <h2 className="mt-2 text-2xl font-bold text-gray-900">{value}</h2>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${iconBg} ${iconColor}`}
        >
          <Icon size={22} />
        </div>
      </div>

      {subtitle && (
        <p className={`mt-3 text-xs font-medium ${subtitleColor}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SummaryCard;
