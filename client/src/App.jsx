import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/useAuth";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Protected route
import ProtectedRoute from "./components/ProtectedRoute";

// Protected pages
import Dashboard from "./pages/Dashboard";
import Accounts from "./pages/Accounts";
import Categories from "./pages/Categories";
import Expenses from "./pages/Expenses";
import AddExpense from "./pages/AddExpense";
import CreditCardPayment from "./pages/CreditCardPayment";
import Reports from "./pages/Reports";
import Budgets from "./pages/Budgets";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import Loans from "./pages/Loans";

// ===============================
// PUBLIC ROUTE
// ===============================
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    );
  }

  // Already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ===============================
// APP
// ===============================
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== */}
        {/* PUBLIC ROUTES         */}
        {/* ==================== */}

        <Route
          path="/"
          element={
            <PublicRoute>
              <Landing />
            </PublicRoute>
          }
        />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />

        {/* ==================== */}
        {/* PROTECTED ROUTES      */}
        {/* ==================== */}

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/accounts" element={<Accounts />} />

          <Route path="/expenses" element={<Expenses />} />

          <Route path="/expenses/add" element={<AddExpense />} />

          <Route path="/categories" element={<Categories />} />

          <Route path="/credit-card-payment" element={<CreditCardPayment />} />

          <Route path="/budgets" element={<Budgets />} />

          <Route path="/reports" element={<Reports />} />

          <Route path="/profile" element={<Profile />} />

          <Route path="/change-password" element={<ChangePassword />} />

          <Route path="/loans" element={<Loans />} />
        </Route>

        {/* ==================== */}
        {/* UNKNOWN ROUTES        */}
        {/* ==================== */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
