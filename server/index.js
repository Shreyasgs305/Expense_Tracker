const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const dns = require("node:dns");

dotenv.config();

// Use public DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectDb = require("./config/db");

const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const reportRoutes = require("./routes/reportRoutes");
const loanRoutes = require("./routes/loanRoutes");

const app = express();

// =========================
// MIDDLEWARE
// =========================

const allowedOrigins = [
  "http://localhost:5173",
  "https://expense-tracker-six-beta-48.vercel.app",
  "https://myexpensestracker.in",
  "https://www.myexpensestracker.in",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin header
      // (Postman, server-to-server requests, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());

// =========================
// ROUTES
// =========================

app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/loans", loanRoutes);

// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDb();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
