const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  createLoan,
  getLoans,
  getLoanById,
  recordRepayment,
  deleteLoan,
} = require("../controllers/loanController");

// Create loan
router.post("/", authMiddleware, createLoan);

// Get all loans
router.get("/", authMiddleware, getLoans);

// Get single loan
router.get("/:id", authMiddleware, getLoanById);

// Record repayment
router.post("/:id/repayment", authMiddleware, recordRepayment);

// Delete loan
router.delete("/:id", authMiddleware, deleteLoan);

module.exports = router;
