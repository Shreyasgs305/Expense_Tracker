import { useEffect, useState } from "react";

import PageLayout from "../components/layout/PageLayout";

import SummaryCards from "../components/dashboard/SummaryCards";
import AccountsOverview from "../components/dashboard/AccountsOverview";
import ExpensesByCategory from "../components/dashboard/ExpensesByCategory";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import BudgetOverview from "../components/dashboard/BudgetOverview";

import { getDashboard } from "../api/dashboardApi";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getDashboard();

        console.log("Dashboard API:", response);

        setDashboardData(response.data);
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(error.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <PageLayout
        title="Dashboard"
        subtitle="Track your money and manage your expenses"
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <p className="text-gray-500">Loading dashboard...</p>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title="Dashboard"
        subtitle="Track your money and manage your expenses"
      >
        <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-center">
          <p className="font-medium text-red-600">{error}</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Track your money and manage your expenses"
    >
      <div className="space-y-6">
        {/* Summary */}
        <SummaryCards data={dashboardData} />

        {/* Accounts + Categories */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <AccountsOverview accounts={dashboardData?.accounts || []} />

          <ExpensesByCategory categories={dashboardData?.topCategories || []} />
        </div>

        {/* Transactions */}
        <RecentTransactions
          transactions={dashboardData?.recentTransactions || []}
        />

        {/* Budgets */}
        <BudgetOverview
          budgets={dashboardData?.budgets || []}
          categories={dashboardData?.topCategories || []}
        />
      </div>
    </PageLayout>
  );
};

export default Dashboard;
