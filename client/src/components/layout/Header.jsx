import { Menu, CalendarDays, ChevronDown, Plus, Bell } from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const Header = ({ onMenuClick, title, subtitle }) => {
  const { user } = useAuth();

  return (
    <header className="flex min-h-[82px] items-center justify-between border-b border-gray-100 bg-white px-4 md:px-7">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
        >
          <Menu size={24} />
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold text-gray-900 md:text-2xl">
            {title}
          </h1>

          {subtitle && (
            <p className="hidden text-sm text-gray-500 md:block">{subtitle}</p>
          )}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Month */}
        <button className="hidden h-10 items-center gap-2 rounded-lg border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 md:flex">
          <CalendarDays size={17} />

          <span>September 2026</span>

          <ChevronDown size={16} />
        </button>

        {/* Add Expense */}
        <Link
          to="/expenses/add"
          className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3 text-sm font-semibold text-white shadow-sm hover:from-violet-700 hover:to-purple-700 md:px-4"
        >
          <Plus size={18} />

          <span className="hidden sm:inline">Add Expense</span>
        </Link>

        {/* Notification */}
        <button className="relative hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100 sm:block">
          <Bell size={22} />

          <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-200 text-sm font-bold text-gray-800">
          {user?.name?.charAt(0)?.toUpperCase() || "U"}
        </div>
      </div>
    </header>
  );
};

export default Header;
