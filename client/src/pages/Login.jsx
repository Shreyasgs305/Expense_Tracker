import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
  Wallet,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const response = await login(email, password);

      console.log("Login successful:", response);

      navigate("/dashboard");
    } catch (error) {
      console.error("Login error:", error);

      setError(
        error.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      {/* =====================================================
          LEFT SIDE - BRAND / VISUAL
      ====================================================== */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 lg:flex lg:w-1/2">
        {/* Decorative circles */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-white/10" />

        <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
              <Wallet size={23} />
            </div>

            <span className="text-xl font-bold">ExpenseTracker</span>
          </Link>

          {/* Main content */}
          <div className="max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-violet-200">
              Smart Financial Management
            </p>

            <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              Your money.
              <br />
              Your control.
              <br />
              Your future.
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-violet-100">
              Track your expenses, manage your accounts, set budgets and
              understand where your money goes — all from one simple dashboard.
            </p>

            {/* Mini stats */}
            <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <TrendingUp size={20} className="text-white" />

                <p className="mt-4 text-xs text-violet-200">Track</p>

                <p className="mt-1 font-semibold text-white">Expenses</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <PieChart size={20} className="text-white" />

                <p className="mt-4 text-xs text-violet-200">Analyze</p>

                <p className="mt-1 font-semibold text-white">Reports</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                <Wallet size={20} className="text-white" />

                <p className="mt-4 text-xs text-violet-200">Manage</p>

                <p className="mt-1 font-semibold text-white">Accounts</p>
              </div>
            </div>
          </div>

          {/* Bottom text */}
          <p className="text-sm text-violet-200">
            Take control of your finances today.
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE - LOGIN
      ====================================================== */}
      <div className="flex min-h-screen w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-10 text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Wallet size={21} />
              </div>

              <span className="text-xl font-bold text-gray-900">
                ExpenseTracker
              </span>
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold text-violet-600">
              Welcome back
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Sign in to your account
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Enter your details to continue to your dashboard.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-12 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />

              <label htmlFor="remember" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign in
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Register */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              Create an account
            </Link>
          </p>

          {/* Back */}
          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-xs font-medium text-gray-400 transition hover:text-gray-600"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
