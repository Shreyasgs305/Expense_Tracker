import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  ArrowRight,
  Wallet,
  ShieldCheck,
  PieChart,
  Target,
} from "lucide-react";
import { useAuth } from "../context/useAuth";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must contain at least 2 characters");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      setSuccess(response.message || "Registration successful!");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Register error:", error);

      setError(
        error.response?.data?.message ||
          "Registration failed. Please try again.",
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
              Start Your Financial Journey
            </p>

            <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              Build better
              <br />
              money habits.
            </h2>

            <p className="mt-6 max-w-md text-base leading-7 text-violet-100">
              Create your account and get a clear picture of your spending,
              savings, accounts and financial goals.
            </p>

            {/* Benefits */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <ShieldCheck size={20} className="text-white" />
                </div>

                <div>
                  <p className="font-semibold text-white">Simple & Secure</p>

                  <p className="text-sm text-violet-200">
                    Keep your financial data organized.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <PieChart size={20} className="text-white" />
                </div>

                <div>
                  <p className="font-semibold text-white">
                    Understand Your Spending
                  </p>

                  <p className="text-sm text-violet-200">
                    See where your money goes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                  <Target size={20} className="text-white" />
                </div>

                <div>
                  <p className="font-semibold text-white">Stay on Budget</p>

                  <p className="text-sm text-violet-200">
                    Set goals and manage your spending.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom */}
          <p className="text-sm text-violet-200">
            Start managing your money smarter today.
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SIDE - REGISTER
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
              Get started
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Create your account
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Create an account to start tracking and managing your finances.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-600">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Full name
              </label>

              <div className="relative">
                <User
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 w-full rounded-xl border border-gray-200 bg-white pl-11 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

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
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-gray-700"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
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

              <p className="mt-2 text-xs text-gray-400">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />

              <label
                htmlFor="terms"
                className="text-xs leading-5 text-gray-500"
              >
                I agree to the{" "}
                <span className="font-medium text-violet-600">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="font-medium text-violet-600">
                  Privacy Policy
                </span>
                .
              </label>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:from-violet-700 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                "Creating account..."
              ) : (
                <>
                  Create account
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </>
              )}
            </button>
          </form>

          {/* Login */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-violet-600 hover:text-violet-700"
            >
              Sign in
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

export default Register;
