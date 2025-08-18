const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  createTransaction,
  getTransactions,
  getTransactionById,   // ✅ add this
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

const router = express.Router();

// All routes are protected
router.use(protect);

// Create
router.post("/", createTransaction);

// Read (all transactions with pagination & filters)
router.get("/", getTransactions);

// ✅ Read (single transaction by ID)
router.get("/:id", getTransactionById);

// Update
router.put("/:id", updateTransaction);

// Delete
router.delete("/:id", deleteTransaction);

module.exports = router;
