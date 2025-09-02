const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");   // 👈 add this

const app = express();

// Core middleware
app.use(express.json());

// Enable CORS
app.use(cors());   // 👈 allow frontend to talk to backend

// Security middlewares
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/transactions", require("./routes/transactionRoutes"));

// Health check
app.get("/", (req, res) => {
  res.send("Finance Tracker API is running...");
});

module.exports = app;
