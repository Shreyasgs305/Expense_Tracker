import {
  Wallet,
  ArrowDown,
  ArrowUp,
  CreditCard,
  ClipboardList,
} from "lucide-react";

import SummaryCard from "../cards/SummaryCard";

const SummaryCards = ({ data }) => {
  const balance = data?.balance || 0;
  const income = data?.income || 0;
  const expense = data?.expense || 0;

  const formatCurrency = (amount) => {
    return `₹${Number(amount).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard
        title="Total Balance"
        value={formatCurrency(balance)}
        subtitle="Across all accounts"
        icon={Wallet}
        iconBg="bg-purple-100"
        iconColor="text-purple-600"
      />

      <SummaryCard
        title="Monthly Expenses"
        value={formatCurrency(expense)}
        subtitle="↓ 8.5% vs Apr 2025"
        icon={ArrowDown}
        iconBg="bg-red-100"
        iconColor="text-red-500"
        subtitleColor="text-red-500"
      />

      <SummaryCard
        title="Monthly Income"
        value={formatCurrency(income)}
        subtitle="↑ 12.3% vs Apr 2025"
        icon={ArrowUp}
        iconBg="bg-green-100"
        iconColor="text-green-600"
        subtitleColor="text-green-600"
      />

      <SummaryCard
        title="Credit Used"
        value="₹14,500.00"
        subtitle="28.0% of total limit"
        icon={CreditCard}
        iconBg="bg-orange-100"
        iconColor="text-orange-500"
      />

      <SummaryCard
        title="Transactions"
        value={data?.recentTransactions?.length || 0}
        subtitle="This Month"
        icon={ClipboardList}
        iconBg="bg-blue-100"
        iconColor="text-blue-500"
      />
    </div>
  );
};

export default SummaryCards;
