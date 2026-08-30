const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");
const dns = require("node:dns");

dotenv.config();
// Use public DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const app = express();

app.use(express.json());

app.use("/api/expenses", expenseRoutes);

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
