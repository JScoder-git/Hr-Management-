const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config();

// Initialize database connection
let dbConnected = false;
const initDB = async () => {
  dbConnected = await connectDB();
};
initDB();

const app = express();
app.use(express.json());
app.use(cors({
  origin: '*', // Allow all origins in production
  credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/candidates', require('./routes/candidateRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/leaves', require('./routes/leaveRoutes'));
app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    path: req.path
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});