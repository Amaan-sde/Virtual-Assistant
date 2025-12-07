const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes.js");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user.routes.js");
const { geminiResponse } = require("./gemini.js");

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------------
// CONNECT DATABASE FIRST
// -------------------------
connectDB();

// -------------------------
// CORS FIXED FOR FRONTEND + LOCALHOST
// -------------------------
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://virtual-assistant-gmxi.onrender.com", // YOUR FRONTEND URL
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// -------------------------
// MIDDLEWARE
// -------------------------
app.use(express.json());
app.use(cookieParser());

// -------------------------
// HOME ROUTE (REQUIRED BY RENDER)
// -------------------------
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// -------------------------
// ROUTES
// -------------------------
app.use("/api/auth", authRoutes);
app.use("/api/user", userRouter);

// -------------------------
// SERVER START
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
