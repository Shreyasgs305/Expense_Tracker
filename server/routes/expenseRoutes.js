const express = require("express");
const router = express.Router();
const {
  getExpenses,
  addExpenses,
} = require("../controllers/expenseController");

router.get("/", getExpenses);
router.post("/", addExpenses);
module.exports = router;
