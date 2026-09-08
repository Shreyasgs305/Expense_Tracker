const express = require("express");
const router = express.Router();
const {
  getAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount,
  updateAccountBalance,
} = require("../controllers/accountController");

const authMiddleware = require("../middlewares/authMiddleware");
// Get all accounts
router.get("/", authMiddleware, getAccounts);
// Get one account
router.get("/:id", authMiddleware, getAccountById);
// Create account
router.post("/", authMiddleware, createAccount);
// Update account
router.put("/:id", authMiddleware, updateAccount);
// Delete account
router.delete("/:id", authMiddleware, deleteAccount);
// Update balence
router.patch("/:id/balance", authMiddleware, updateAccountBalance);
module.exports = router;
