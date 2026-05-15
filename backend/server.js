const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./db');
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://bloodconnect-lb.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
const donorRoutes = require('./routes/donors');
const hospitalRoutes = require('./routes/hospitals');
const inventoryRoutes = require('./routes/inventory');
const requestRoutes = require('./routes/requests');
const chatbotRoutes = require('./routes/chatbot');
const idcheckRoutes = require('./routes/idcheck');
const adminRoutes = require('./routes/admin');
const passwordResetRoutes = require('./routes/passwordreset');
const appointmentRoutes = require('./routes/appointments');

// API Routes
app.use('/api/appointments', appointmentRoutes);
app.use('/api/password', passwordResetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/idcheck', idcheckRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Blood Bank API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found', path: req.path });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  });
}

// For Vercel serverless deployment
module.exports = app;