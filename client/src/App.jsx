import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
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
import Landing from "./pages/Landing";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== */}
        {/* PUBLIC ROUTES         */}
        {/* ==================== */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

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
        </Route>

        {/* ==================== */}
        {/* DEFAULT ROUTE         */}
        {/* ==================== */}

        {/* ==================== */}
        {/* UNKNOWN ROUTES        */}
        {/* ==================== */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
