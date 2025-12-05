const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes.js');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user.routes.js');
const { geminiResponse } = require('./gemini.js');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS FIX (FINAL)
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://virtual-assistant-frontend-n8z4.onrender.com"
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Preflight fix
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

// Test route
app.get("/", (req, res) => {
    res.send("Backend running successfully!");
});

// Start server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});
