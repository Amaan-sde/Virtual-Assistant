const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes.js');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user.routes.js');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
    "http://localhost:5173",                       // local frontend
    "https://virtual-assistant-frontend-s0yn.onrender.com" // deployed frontend
];

app.use(cors({
    origin: function(origin, callback){
        if(!origin) return callback(null, true); // allow Postman, curl, etc.
        if(allowedOrigins.indexOf(origin) === -1){
            const msg = 'CORS policy does not allow access from this origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true, // required for cookies
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Preflight requests
app.options("*", cors({
    origin: allowedOrigins,
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

// Test route
app.get("/", (req, res) => {
    res.send("Backend running successfully!");
});

// Start server and connect DB
app.listen(PORT, async () => {
    await connectDB();
    console.log(`Server is running on port ${PORT}`);
});
