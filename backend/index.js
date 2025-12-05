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

// Allowed origins for CORS
const allowedOrigins = [
    "http://localhost:5173",
    "https://virtual-assistant-frontend-n8z4.onrender.com"
];

// CORS middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from tools like Postman (no origin)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
}));

// Handle preflight OPTIONS request
app.options("*", cors());

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

// Home route (optional)
app.get("/", (req, res) => {
    res.send("Backend running successfully!");
});

// Start server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server running on port ${PORT}`);
});
