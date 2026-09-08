const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const accountRoutes = require("./routes/accountRoutes");
const dns = require("node:dns");

dotenv.config();
// Use public DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = express();

//Middleware
app.use(express.json());

//Routes
app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);

//Start the server
const PORT = process.env.PORT || 8080;
const startServer = async () => {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
