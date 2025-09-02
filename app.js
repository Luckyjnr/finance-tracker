const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");  // 👈 add this

const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: "https://finance-tracker-kappa-tan.vercel.app", // allow only your frontend
  methods: ["GET", "POST", "PUT", "DELETE"],               // allowed methods
  credentials: true                                        // if you use cookies/auth
}));

// Core middleware
app.use(express.json());

// Security middlewares
app.use(helmet());
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
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
