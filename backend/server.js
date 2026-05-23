const express = require('express');
const multer = require('multer');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./db');
const app = express();

// Simple CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Add these BEFORE multer
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Trust proxy for Render
app.set('trust proxy', 1);

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ========================================
// ✅ ROUTE IMPORTS - ONLY EXISTING ONES
// ========================================

// Load routes only if they exist
let requestsRoute, bloodRequestsRoute, donorRoutes, hospitalsRoutes;
let inventoryRoutes, chatbotRoutes, idcheckRoutes, adminRoutes;
let passwordResetRoutes, analyticsRoutes;

try {
  requestsRoute = require('./routes/requests');
  console.log('✅ Loaded: requests');
} catch (e) {
  console.warn('⚠️  Missing: routes/requests.js');
}

try {
  bloodRequestsRoute = require('./routes/blood-requests');
  console.log('✅ Loaded: blood-requests');
} catch (e) {
  console.warn('⚠️  Missing: routes/blood-requests.js');
}

try {
  donorRoutes = require('./routes/donors');
  console.log('✅ Loaded: donors');
} catch (e) {
  console.warn('⚠️  Missing: routes/donors.js');
}

try {
  hospitalsRoutes = require('./routes/hospitals');
  console.log('✅ Loaded: hospitals');
} catch (e) {
  console.warn('⚠️  Missing: routes/hospitals.js');
}

try {
  inventoryRoutes = require('./routes/inventory');
  console.log('✅ Loaded: inventory');
} catch (e) {
  console.warn('⚠️  Missing: routes/inventory.js');
}

try {
  chatbotRoutes = require('./routes/chatbot');
  console.log('✅ Loaded: chatbot');
} catch (e) {
  console.warn('⚠️  Missing: routes/chatbot.js');
}

try {
  idcheckRoutes = require('./routes/idcheck');
  console.log('✅ Loaded: idcheck');
} catch (e) {
  console.warn('⚠️  Missing: routes/idcheck.js');
}

try {
  adminRoutes = require('./routes/admin');
  console.log('✅ Loaded: admin');
} catch (e) {
  console.warn('⚠️  Missing: routes/admin.js');
}

try {
  passwordResetRoutes = require('./routes/passwordreset');
  console.log('✅ Loaded: passwordreset');
} catch (e) {
  console.warn('⚠️  Missing: routes/passwordreset.js');
}

try {
  analyticsRoutes = require('./routes/analytics');
  console.log('✅ Loaded: analytics');
} catch (e) {
  console.warn('⚠️  Missing: routes/analytics.js');
}

// ========================================
// ✅ ROUTE REGISTRATION - ONLY IF LOADED
// ========================================

if (requestsRoute) app.use('/api/requests', requestsRoute);
if (bloodRequestsRoute) app.use('/api/blood-requests', bloodRequestsRoute);
if (analyticsRoutes) app.use('/api/analytics', analyticsRoutes);
if (passwordResetRoutes) app.use('/api/password', passwordResetRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);
if (idcheckRoutes) app.use('/api/idcheck', idcheckRoutes);
if (donorRoutes) app.use('/api/donors', donorRoutes);
if (hospitalsRoutes) app.use('/api/hospitals', hospitalsRoutes);
if (inventoryRoutes) app.use('/api/inventory', inventoryRoutes);
if (chatbotRoutes) app.use('/api/chatbot', chatbotRoutes);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ 
    message: 'Blood Bank API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    message: 'Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log(`[404] ${req.method} ${req.path}`);
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.path,
    method: req.method,
    availableRoutes: [
      'POST /api/blood-requests/create',
      'GET /api/blood-requests/hospital/:hospitalId',
      'GET /api/blood-requests/center-donations',
      'POST /api/blood-requests/hospital-confirm',
      'POST /api/blood-requests/admin-confirm',
      'GET /api/blood-requests/donor/:donorId',
      'POST /api/blood-requests/donor-confirm-donation',
      'GET /api/requests/hospital/:hospitalId',
      'DELETE /api/requests/:requestId',
      'GET /api/health',
      'GET /'
    ]
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  res.status(err.status || 500).json({ 
    message: 'Internal server error', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'An error occurred'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n✅ Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;