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

// Connect DB FIRST
connectDB();

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://virtual-assistant-gmxi.onrender.com"   // your frontend URL here
    ],
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Default Route (IMPORTANT for Render!)
app.get("/", (req, res) => {
    res.send("Backend is running...");
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
