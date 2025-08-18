const Transaction = require("../models/Transaction");
const User = require("../models/user");

// Create
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, description } = req.body;

    if (!amount || !type) {
      return res.status(400).json({ message: "Amount and type are required" });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      description,
    });

    // Update balance
    const user = await User.findById(req.user._id);
    user.balance += type === "income" ? amount : -amount;
    await user.save();

    res.status(201).json(transaction);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server Error" });
  }
};

// Get all (with pagination & filters)
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, type, start, end } = req.query;

    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (start || end) {
      filter.createdAt = {};
      if (start) filter.createdAt.$gte = new Date(start);
      if (end) filter.createdAt.$lte = new Date(end);
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Transaction.countDocuments(filter);

    res.json({
      transactions,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server Error" });
  }
};

// ✅ Get single transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    res.json(tx);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server Error" });
  }
};

// Update
exports.updateTransaction = async (req, res) => {
  try {
    const { amount, type, description } = req.body;
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    const user = await User.findById(req.user._id);

    // Reverse old effect
    user.balance -= tx.type === "income" ? tx.amount : -tx.amount;

    // Apply new values
    tx.amount = amount ?? tx.amount;
    tx.type = type ?? tx.type;
    tx.description = description ?? tx.description;

    // Apply new effect
    user.balance += tx.type === "income" ? tx.amount : -tx.amount;

    await tx.save();
    await user.save();

    res.json(tx);
  } catch (e) {
    res.status(500).json({ message: e.message || "Server Error" });
  }
};

// Delete
exports.deleteTransaction = async (req, res) => {
  try {
    const tx = await Transaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });

    const user = await User.findById(req.user._id);

    // Reverse effect
    user.balance -= tx.type === "income" ? tx.amount : -tx.amount;

    await tx.deleteOne();
    await user.save();

    res.json({ message: "Transaction deleted" });
  } catch (e) {
    res.status(500).json({ message: e.message || "Server Error" });
  }
};
