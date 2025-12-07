const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes.js");
const cookieParser = require("cookie-parser");
const userRouter = require("./routes/user.routes.js");

const app = express();
const PORT = process.env.PORT || 5000;

// -------------------------
// CONNECT DATABASE FIRST
// -------------------------
connectDB();

// -------------------------
// CORS (FULLY FIXED FOR RENDER)
// -------------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://virtual-assistant-gmxi.onrender.com", // YOUR FRONTEND URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// required for preflight requests
app.options("*", (req, res) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(200);
});

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
