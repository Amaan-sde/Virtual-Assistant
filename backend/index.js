const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes.js');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user.routes.js');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------
// Middleware
// ---------------------
app.use(express.json());
app.use(cookieParser());

// ---------------------
// CORS FIX (100% WORKING FOR RENDER)
// ---------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://virtual-assistant-frontend-s0yn.onrender.com"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ---------------------
// Routes
// ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

// ---------------------
// Test Route
// ---------------------
app.get("/", (req, res) => {
  res.send("Backend running successfully!");
});

// ---------------------
// Start Server + Connect DB
// ---------------------
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
