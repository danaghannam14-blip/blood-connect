const express = require('express');
const router = express.Router();
const db = require('../db');

// In-memory counters
let analyticsData = {
  donors: 0,
  emergencies: 0
};

// GET /api/analytics/dashboard
router.get('/dashboard', (req, res) => {
  // Try to get donor count from database
  db.query('SELECT COUNT(*) as count FROM donors', (err, results) => {
    if (err) {
      console.error('Database query error:', err);
      // Return in-memory count if DB fails
      return res.json({
        donors: analyticsData.donors,
        emergencies: analyticsData.emergencies
      });
    }
    
    const donorCount = results[0]?.count || 0;
    
    res.json({
      donors: donorCount,
      emergencies: analyticsData.emergencies
    });
  });
});

// POST /api/analytics/event
router.post('/event', (req, res) => {
  // Support both eventType and event_type for compatibility
  const eventType = req.body.eventType || req.body.event_type;
  
  if (!eventType) {
    return res.status(400).json({ message: 'Missing eventType or event_type' });
  }
  
  console.log('Event received:', eventType);
  
  if (eventType === 'donor_login') {
    analyticsData.donors++;
    console.log('Donor login tracked. New count:', analyticsData.donors);
  } else if (eventType === 'emergency') {
    analyticsData.emergencies++;
    console.log('Emergency click tracked. New count:', analyticsData.emergencies);
  } else {
    // Still track unknown events, just log them
    console.log('Unknown event tracked:', eventType);
  }
  
  res.json({ 
    success: true,
    message: `${eventType} tracked successfully`,
    data: analyticsData
  });
});

// POST /api/analytics/reset (for testing)
router.post('/reset', (req, res) => {
  analyticsData = {
    donors: 0,
    emergencies: 0
  };
  
  res.json({ 
    success: true,
    message: 'Analytics reset',
    data: analyticsData
  });
});

module.exports = router;