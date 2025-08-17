const dotenv = require("dotenv");
const connectDB = require("./config/db");
const app = require("./app");

// Load environment variables
dotenv.config();

// Connect DB
connectDB();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
