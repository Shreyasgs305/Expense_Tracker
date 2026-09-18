import { Menu, Plus, User, LogOut, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/useAuth";

const Header = ({ onMenuClick, title, subtitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfile = () => {
    setProfileOpen(false);
    navigate("/profile");
  };

  const handleSignOut = async () => {
    setProfileOpen(false);

    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }

    navigate("/login");
  };

  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="flex min-h-[82px] items-center justify-between border-b border-gray-100 bg-white px-4 md:px-7">
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
          aria-label="Open menu"
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
        {/* Add Expense */}
        <Link
          to="/expenses/add"
          className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-3 text-sm font-semibold text-white shadow-sm transition hover:from-violet-700 hover:to-purple-700 md:px-4"
        >
          <Plus size={18} />

          <span className="hidden sm:inline">Add Expense</span>
        </Link>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl p-1.5 transition hover:bg-gray-100"
            aria-label="Open profile menu"
            aria-expanded={profileOpen}
          >
            {/* Avatar */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-200 text-sm font-bold text-gray-800">
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitial
              )}
            </div>
          </button>

          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
              {/* User info */}
              <div className="border-b border-gray-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-orange-200 text-sm font-bold text-gray-800">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {user?.name || "User"}
                    </p>

                    <p className="truncate text-xs text-gray-500">
                      {user?.email || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile */}
              <div className="p-2">
                <button
                  type="button"
                  onClick={handleProfile}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <User size={18} className="text-gray-500" />

                  <span>Profile</span>
                </button>

                {/* Sign Out */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  <LogOut size={18} />

                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
