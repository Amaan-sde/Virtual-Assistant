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
// FIXED CORS (WORKS WITH COOKIE + RENDER)
// ---------------------
app.use(cors({
  origin: function (origin, callback) {
    callback(null, true);  // allow all origins dynamically
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ---------------------
// Routes
// ---------------------
app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

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
