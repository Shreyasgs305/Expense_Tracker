import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";

// Temporary pages

const Accounts = () => <h1>Accounts</h1>;
const Expenses = () => <h1>Expenses</h1>;
const AddExpense = () => <h1>Add Expense</h1>;
const Categories = () => <h1>Categories</h1>;
const Budgets = () => <h1>Budgets</h1>;
const Reports = () => <h1>Reports</h1>;
const Settings = () => <h1>Settings</h1>;

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ==================== */}
        {/* PUBLIC ROUTES         */}
        {/* ==================== */}

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

          <Route path="/budgets" element={<Budgets />} />

          <Route path="/reports" element={<Reports />} />

          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* ==================== */}
        {/* DEFAULT ROUTE         */}
        {/* ==================== */}

        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ==================== */}
        {/* UNKNOWN ROUTES        */}
        {/* ==================== */}

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
