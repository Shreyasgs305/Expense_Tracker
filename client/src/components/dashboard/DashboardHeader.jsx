import { Menu, CalendarDays, ChevronDown, Plus, Bell } from "lucide-react";

import { useAuth } from "../../context/useAuth";

const DashboardHeader = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="flex min-h-[82px] items-center justify-between border-b border-gray-100 bg-white px-5 md:px-7">
      {/* Left */}

      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <p className="hidden text-sm text-gray-500 md:block">
            Track your money and manage your expenses
          </p>
        </div>
      </div>

      {/* Right */}

      <div className="flex items-center gap-3">
        {/* Month */}

        <button className="hidden h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium md:flex">
          <CalendarDays size={17} />

          <span>May 2025</span>

          <ChevronDown size={16} />
        </button>

        {/* Add Expense */}

        <a
          href="/expenses/add"
          className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 text-sm font-semibold text-white shadow-sm"
        >
          <Plus size={18} />

          <span className="hidden sm:inline">Add Expense</span>
        </a>

        {/* Notification */}

        <button className="relative hidden rounded-lg p-2 hover:bg-gray-100 sm:block">
          <Bell size={23} />

          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Avatar */}

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200 text-sm font-bold text-gray-800">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
