const express = require("express");

const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");

const {
  getDashboard,
  getSummary,
  getCategory,
  getMonthly,
  getAccount,
  getTrends,
} = require("../controllers/reportController");

// ==========================================
// DASHBOARD
// ==========================================

router.get("/dashboard", authMiddleware, getDashboard);

// ==========================================
// SUMMARY
// ==========================================

router.get("/summary", authMiddleware, getSummary);

// ==========================================
// CATEGORY
// ==========================================

router.get("/category", authMiddleware, getCategory);

// ==========================================
// MONTHLY
// ==========================================

router.get("/monthly", authMiddleware, getMonthly);

// ==========================================
// ACCOUNT
// ==========================================

router.get("/account", authMiddleware, getAccount);

// ==========================================
// TRENDS
// ==========================================

router.get("/trends", authMiddleware, getTrends);

module.exports = router;
