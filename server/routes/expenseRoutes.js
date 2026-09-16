const express = require("express");
const router = express.Router();
const {
  getExpenses,
  getExpenseById,
  createExpense,
  createCreditCardPayment,
  updateExpense,
  deleteExpense,
} = require("../controllers/expenseController");
const authMiddleware = require("../middlewares/authMiddleware");
router.get("/", authMiddleware, getExpenses);
router.post("/credit-card-payment", authMiddleware, createCreditCardPayment);
router.get("/:id", authMiddleware, getExpenseById);
router.post("/", authMiddleware, createExpense);
router.put("/:id", authMiddleware, updateExpense);
router.delete("/:id", authMiddleware, deleteExpense);

module.exports = router;
