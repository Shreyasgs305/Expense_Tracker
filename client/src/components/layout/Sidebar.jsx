import {
  LayoutDashboard,
  WalletCards,
  Receipt,
  PlusCircle,
  Tags,
  Target,
  BarChart3,
  Settings,
  Wallet,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Accounts",
      path: "/accounts",
      icon: WalletCards,
    },
    {
      name: "Expenses",
      path: "/expenses",
      icon: Receipt,
    },
    {
      name: "Add Expense",
      path: "/expenses/add",
      icon: PlusCircle,
    },
    {
      name: "Categories",
      path: "/categories",
      icon: Tags,
    },
    {
      name: "Budgets",
      path: "/budgets",
      icon: Target,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: BarChart3,
    },
    {
      name: "Settings",
      path: "/settings",
      icon: Settings,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-[240px]
          flex-col bg-[#17152f] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-700">
              <Wallet size={21} />
            </div>

            <div>
              <h1 className="text-base font-bold">Expense Tracker</h1>

              <p className="text-[10px] text-gray-400">Manage your money</p>
            </div>
          </div>

          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `
                  flex items-center gap-3 rounded-lg px-4 py-3
                  text-sm font-medium transition
                  ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }
                  `
                }
              >
                <Icon size={19} />

                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 rounded-lg p-2">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-200 text-sm font-bold text-gray-800">
              {user?.name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
