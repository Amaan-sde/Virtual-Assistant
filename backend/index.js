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

// Middleware
app.use(cors({
    origin: 'https://virtual-assistant-gmxi.onrender.com',
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

// SINGLE home route


// Server start
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});
