const express = require("express");

const app = express();
const { protect } = require("./middleware/authMiddleware");

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.get("/api/protected", protect, (req, res) => {
  res.json({ message: `Welcome ${req.user.name}, your balance is ${req.user.balance}` });
});

// Test route
app.get("/", (req, res) => {
  res.send("Finance Tracker API is running...");
});

module.exports = app;
