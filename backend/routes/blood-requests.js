const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');
 
// ✅ Email transporter - NO HARDCODED SECRETS
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL || 'blood.connect.donate@gmail.com',
    pass: process.env.BREVO_API_KEY // ✅ Use environment variable ONLY
  }
});
 
console.log('[blood-requests.js] Routes being registered...');
 
// =============================================
// POST /api/blood-requests/create
// Hospital creates blood request
// =============================================
router.post('/create', (req, res) => {
  console.log('[POST /create] Received:', req.body);
 
  try {
    const { hospital_id, blood_type, quantity_needed, urgency } = req.body;
 
    // Validation
    if (!hospital_id || !blood_type || !quantity_needed) {
      console.log('[POST /create] Missing fields:', { hospital_id, blood_type, quantity_needed });
      return res.status(400).json({
        error: 'Missing required fields: hospital_id, blood_type, quantity_needed'
      });
    }
 
    // Insert into database
    const query = `
      INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed, urgency, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;
 
    db.query(query, [hospital_id, blood_type, quantity_needed, urgency || 'urgent'], async (err, result) => {
      if (err) {
        console.error('[POST /create] Database error:', err);
        return res.status(500).json({
          error: 'Failed to create request',
          details: err.message
        });
      }
 
      console.log('[POST /create] Request created with ID:', result.insertId);
 
      // Get hospital info (async, don't block response)
      const hospitalQuery = 'SELECT name, email FROM hospitals WHERE id = ?';
      db.query(hospitalQuery, [hospital_id], (err, hospitalResults) => {
        if (err || !hospitalResults || !hospitalResults.length) {
          console.warn('[POST /create] Hospital not found:', hospital_id);
          return;
        }
 
        const hospital = hospitalResults[0];
        console.log('[POST /create] Found hospital:', hospital.name);
 
        // Get matching donors
        const donorQuery = `
          SELECT id, email, full_name FROM donors
          WHERE blood_type = ? AND is_eligible = 1
          LIMIT 50
        `;
 
        db.query(donorQuery, [blood_type], (err, donors) => {
          if (!err && donors && donors.length > 0) {
            console.log(`[POST /create] Found ${donors.length} donors for ${blood_type}`);
            // Send emails (fire and forget)
            donors.forEach(donor => {
              try {
                transporter.sendMail({
                  from: process.env.ADMIN_EMAIL || 'blood.connect.donate@gmail.com',
                  to: donor.email,
                  subject: `🩸 URGENT: ${hospital.name} needs ${blood_type} blood`,
                  html: `
<h2>Emergency Blood Request</h2>
<p>Hi ${donor.full_name},</p>
<p><strong>${hospital.name}</strong> urgently needs <strong>${quantity_needed}</strong> units of <strong>${blood_type}</strong> blood.</p>
<p>Your blood type matches! Please respond as soon as possible.</p>
                  `
                }).catch(err => console.error('[Email Error]:', err.message));
              } catch (e) {
                console.error('[Email Error]:', e.message);
              }
            });
          }
        });
      });
 
      // Return success immediately
      res.json({
        success: true,
        message: 'Blood request created and donors notified',
        requestId: result.insertId
      });
    });
  } catch (error) {
    console.error('[POST /create] Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
 
// =============================================
// GET /api/blood-requests/hospital/:hospitalId
// Get hospital's blood requests
// =============================================
router.get('/hospital/:hospitalId', (req, res) => {
  console.log('[GET /hospital/:id] Requested for hospital:', req.params.hospitalId);
 
  try {
    const { hospitalId } = req.params;
 
    if (!hospitalId) {
      console.log('[GET /hospital/:id] Missing hospitalId');
      return res.status(400).json({ error: 'hospitalId is required' });
    }
 
    // First try to get from blood_requests table (regular requests)
    const query = `
      SELECT
        br.id,
        br.hospital_id,
        br.blood_type,
        br.quantity_needed,
        br.urgency,
        br.status,
        br.created_at,
        h.name as hospital_name
      FROM blood_requests br
      LEFT JOIN hospitals h ON br.hospital_id = h.id
      WHERE br.hospital_id = ?
      ORDER BY br.created_at DESC
      LIMIT 100
    `;
 
    db.query(query, [hospitalId], (err, results) => {
      if (err) {
        console.error('[GET /hospital/:id] Database error:', err);
        return res.status(500).json({
          error: 'Failed to fetch requests',
          details: err.message
        });
      }
 
      console.log('[GET /hospital/:id] Found', results ? results.length : 0, 'requests');
      res.json(results || []);
    });
  } catch (error) {
    console.error('[GET /hospital/:id] Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
 
// =============================================
// GET /api/blood-requests/center-donations
// Get center donations for admin
// =============================================
router.get('/center-donations', (req, res) => {
  console.log('[GET /center-donations] Requested');
 
  try {
    const query = `
      SELECT
        id,
        notification_id,
        donor_id,
        donor_name,
        blood_type,
        patient_email,
        status,
        created_at
      FROM emergency_notifications
      WHERE status IN ('awaiting_confirmation', 'confirmed')
      ORDER BY created_at DESC
      LIMIT 100
    `;
 
    db.query(query, (err, results) => {
      if (err) {
        console.error('[GET /center-donations] Database error:', err);
        return res.status(500).json({
          error: 'Failed to fetch center donations',
          details: err.message
        });
      }
 
      console.log('[GET /center-donations] Found', results ? results.length : 0, 'donations');
      res.json(results || []);
    });
  } catch (error) {
    console.error('[GET /center-donations] Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
 
// =============================================
// POST /api/blood-requests/hospital-confirm
// Hospital confirms donation
// =============================================
router.post('/hospital-confirm', (req, res) => {
  console.log('[POST /hospital-confirm] Received:', req.body);
 
  try {
    const { notificationId, hospitalId } = req.body;
 
    if (!notificationId) {
      console.log('[POST /hospital-confirm] Missing notificationId');
      return res.status(400).json({ error: 'notificationId is required' });
    }
 
    const query = `
      UPDATE emergency_notifications
      SET status = 'confirmed'
      WHERE id = ?
      ${hospitalId ? 'AND hospital_id = ?' : ''}
    `;
 
    const params = hospitalId ? [notificationId, hospitalId] : [notificationId];
 
    db.query(query, params, (err, result) => {
      if (err) {
        console.error('[POST /hospital-confirm] Database error:', err);
        return res.status(500).json({
          error: 'Failed to confirm donation',
          details: err.message
        });
      }
 
      if (result.affectedRows === 0) {
        console.log('[POST /hospital-confirm] Donation not found:', notificationId);
        return res.status(404).json({ error: 'Donation not found' });
      }
 
      console.log('[POST /hospital-confirm] Donation confirmed:', notificationId);
      res.json({
        success: true,
        message: 'Donation confirmed'
      });
    });
  } catch (error) {
    console.error('[POST /hospital-confirm] Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
 
// =============================================
// POST /api/blood-requests/admin-confirm
// Admin confirms center donation
// =============================================
router.post('/admin-confirm', (req, res) => {
  console.log('[POST /admin-confirm] Received:', req.body);
 
  try {
    const { notificationId } = req.body;
 
    if (!notificationId) {
      console.log('[POST /admin-confirm] Missing notificationId');
      return res.status(400).json({ error: 'notificationId is required' });
    }
 
    const query = `
      UPDATE emergency_notifications
      SET status = 'confirmed'
      WHERE id = ?
    `;
 
    db.query(query, [notificationId], (err, result) => {
      if (err) {
        console.error('[POST /admin-confirm] Database error:', err);
        return res.status(500).json({
          error: 'Failed to confirm donation',
          details: err.message
        });
      }
 
      console.log('[POST /admin-confirm] Donation confirmed:', notificationId);
      res.json({
        success: true,
        message: 'Donation confirmed'
      });
    });
  } catch (error) {
    console.error('[POST /admin-confirm] Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
 
// =============================================
// GET /api/blood-requests/donor/:donorId
// Get donor's emergency requests
// =============================================
router.get('/donor/:donorId', (req, res) => {
  console.log('[GET /donor/:id] Requested for donor:', req.params.donorId);
 
  try {
    const { donorId } = req.params;
 
    if (!donorId) {
      console.log('[GET /donor/:id] Missing donorId');
      return res.status(400).json({ error: 'donorId is required' });
    }
 
    const query = `
      SELECT
        id,
        notification_id,
        donor_id,
        donor_name,
        blood_type,
        patient_email,
        governorate,
        status,
        created_at
      FROM emergency_notifications
      WHERE donor_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `;
 
    db.query(query, [donorId], (err, results) => {
      if (err) {
        console.error('[GET /donor/:id] Database error:', err);
        return res.status(500).json({
          error: 'Failed to fetch emergency requests',
          details: err.message
        });
      }
 
      console.log('[GET /donor/:id] Found', results ? results.length : 0, 'requests');
      res.json(results || []);
    });
  } catch (error) {
    console.error('[GET /donor/:id] Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
 
// =============================================
// POST /api/blood-requests/donor-confirm-donation
// Donor confirms donation
// =============================================
router.post('/donor-confirm-donation', (req, res) => {
  console.log('[POST /donor-confirm-donation] Received:', req.body);
 
  try {
    const { notification_id, donation_location, hospital_id } = req.body;
 
    if (!notification_id || !donation_location) {
      console.log('[POST /donor-confirm-donation] Missing required fields');
      return res.status(400).json({
        error: 'notification_id and donation_location are required'
      });
    }
 
    const query = `
      UPDATE emergency_notifications
      SET status = 'awaiting_confirmation',
          donation_location = ?,
          hospital_id = ?
      WHERE notification_id = ?
    `;
 
    db.query(query, [donation_location, hospital_id || null, notification_id], (err, result) => {
      if (err) {
        console.error('[POST /donor-confirm-donation] Database error:', err);
        return res.status(500).json({
          error: 'Failed to confirm donation',
          details: err.message
        });
      }
 
      console.log('[POST /donor-confirm-donation] Donation confirmed:', notification_id);
      res.json({
        success: true,
        message: 'Donation confirmed'
      });
    });
  } catch (error) {
    console.error('[POST /donor-confirm-donation] Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
 
// =============================================
// DELETE /api/blood-requests/:requestId
// Delete blood request
// =============================================
router.delete('/:requestId', (req, res) => {
  console.log('[DELETE /:id] Deleting request:', req.params.requestId);
 
  try {
    const { requestId } = req.params;
 
    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' });
    }
 
    const query = 'DELETE FROM blood_requests WHERE id = ?';
 
    db.query(query, [requestId], (err, result) => {
      if (err) {
        console.error('[DELETE /:id] Database error:', err);
        return res.status(500).json({
          error: 'Failed to delete request',
          details: err.message
        });
      }
 
      if (result.affectedRows === 0) {
        console.log('[DELETE /:id] Request not found:', requestId);
        return res.status(404).json({ error: 'Request not found' });
      }
 
      console.log('[DELETE /:id] Request deleted:', requestId);
      res.json({
        success: true,
        message: 'Request deleted'
      });
    });
  } catch (error) {
    console.error('[DELETE /:id] Server error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});
 
console.log('[blood-requests.js] ✅ All routes registered');
 
module.exports = router;