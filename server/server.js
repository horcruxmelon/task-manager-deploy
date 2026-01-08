const express = require('express');
const crypto = require("crypto");
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/activity', require('./routes/activityRoutes'));

const authMiddleware = require('./middleware/authMiddleware');
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  // Basic dashboard message, detailed stats will be fetched via specific endpoints
  res.json({ message: `Welcome to the dashboard!` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
console.log("EMAIL USER:", process.env.EMAIL_USER);
console.log("JWT SECRET:", process.env.JWT_SECRET);

