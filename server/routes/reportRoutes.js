const express = require("express");

const {
  getDashboard,
  getSummary,
  getCategoryReport,
  getMonthlyReport,
  getAccountReport,
  getTrendsReport,
} = require("../controllers/reportController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboard);
router.get("/summary", authMiddleware, getSummary);
router.get("/category", authMiddleware, getCategoryReport);
router.get("/monthly", authMiddleware, getMonthlyReport);
router.get("/account", authMiddleware, getAccountReport);
router.get("/trends", authMiddleware, getTrendsReport);
module.exports = router;
