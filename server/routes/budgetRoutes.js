const express = require("express");

const {
  getBudgets,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
  getBudgetStatus,
} = require("../controllers/budgetController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getBudgets);
router.get("/:id", authMiddleware, getBudgetById);
router.post("/", authMiddleware, createBudget);
router.put("/:id", authMiddleware, updateBudget);
router.delete("/:id", authMiddleware, deleteBudget);
router.get("/:id/status", authMiddleware, getBudgetStatus);
module.exports = router;
