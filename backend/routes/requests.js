const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

// ✅ Brevo SMTP Configuration
console.log('[requests.js] Setting up email transporter...');
console.log('[requests.js] BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'blood.bank.notif@gmail.com',
    pass: process.env.BREVO_API_KEY
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('[Brevo] Email transporter ERROR:', error.message);
  } else {
    console.log('[Brevo] Email transporter ready ✅');
  }
});

console.log('[requests.js] Routes registering...');

// =============================================
// POST /api/requests/create
// Hospital creates blood request + sends emails to DONORS ONLY
// ✅ Saves to database (shows in Admin Dashboard)
// ✅ Sends emails to matching donors
// ❌ NO email to admin
// =============================================
router.post('/create', async (req, res) => {
  console.log('[POST /create] Received:', req.body);
  
  try {
    const { hospital_id, blood_type, quantity_needed, urgency } = req.body;

    if (!hospital_id || !blood_type || !quantity_needed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Insert blood request into database
    const query = `
      INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed, urgency, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(query, [hospital_id, blood_type, quantity_needed, urgency || 'urgent'], async (err, result) => {
      if (err) {
        console.error('[POST /create] Database error:', err.message);
        return res.status(500).json({ error: 'Failed to create request', details: err.message });
      }

      console.log('[POST /create] Request created with ID:', result.insertId);
      console.log('[POST /create] Request will appear in Admin Dashboard ✅');

      // ✅ GET HOSPITAL INFO
      const hospitalQuery = 'SELECT name, email FROM hospitals WHERE id = ?';
      db.query(hospitalQuery, [hospital_id], (err, hospitalResults) => {
        if (!err && hospitalResults && hospitalResults.length) {
          const hospital = hospitalResults[0];
          console.log('[POST /create] Hospital found:', hospital.name);
          
          // ✅ GET ELIGIBLE DONORS WITH MATCHING BLOOD TYPE
          const donorQuery = `
            SELECT id, email, full_name FROM donors 
            WHERE blood_type = ? AND is_eligible = 1 
            LIMIT 50
          `;
          
          db.query(donorQuery, [blood_type], (err, donors) => {
            if (!err && donors && donors.length) {
              console.log(`[POST /create] Found ${donors.length} donors for ${blood_type}`);
              
              // ✅ SEND EMAIL TO EACH DONOR
              donors.forEach((donor, index) => {
                setTimeout(() => {
                  const mailOptions = {
                    from: process.env.ADMIN_EMAIL || 'blood.connect.donate@gmail.com',
                    to: donor.email,
                    subject: `🩸 URGENT: ${hospital.name} needs ${blood_type} blood`,
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #dc2626; margin: 0 0 20px 0;">🩸 Emergency Blood Request</h2>
                        
                        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                          <p style="margin: 0 0 10px 0;">Hi <strong>${donor.full_name}</strong>,</p>
                          <p style="margin: 0 0 10px 0;">
                            <strong style="font-size: 16px; color: #1f2937;">${hospital.name}</strong> 
                            urgently needs <strong style="font-size: 16px; color: #dc2626;">${quantity_needed} units</strong> 
                            of <strong style="font-size: 16px; color: #dc2626;">${blood_type}</strong> blood.
                          </p>
                        </div>
                        
                        <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
                          <p style="margin: 0; font-weight: bold; color: #991b1b;">
                            ⚠️ Your blood type matches! Please respond as soon as possible.
                          </p>
                        </div>
                        
                        <p style="margin: 20px 0; color: #4b5563;">
                          Every blood donation saves lives. Your generosity can make a real difference in someone's life.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="font-size: 12px; color: #6b7280; margin: 0;">
                          This is an automated message from BloodConnect Lebanon<br>
                          For more information, visit <a href="https://bloodconnect.lb" style="color: #dc2626;">bloodconnect.lb</a>
                        </p>
                      </div>
                    `
                  };

                  console.log(`[Email] Sending to donor ${donor.email}...`);
                  
                  transporter.sendMail(mailOptions, (err, info) => {
                    if (err) {
                      console.error(`[Email Error] To donor ${donor.email}:`, err.message);
                    } else {
                      console.log(`[Email Sent] To donor ${donor.email} ✅`);
                    }
                  });
                }, index * 500);
              });
            } else {
              console.log(`[POST /create] No eligible donors found for ${blood_type}`);
            }
          });
        } else {
          console.warn('[POST /create] Hospital not found:', hospital_id);
        }
      });

      // ✅ RETURN SUCCESS IMMEDIATELY
      res.json({ 
        success: true,
        message: 'Blood request created and donors notified',
        requestId: result.insertId
      });
    });
  } catch (error) {
    console.error('[POST /create] Server error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// =============================================
// GET /api/requests - ADMIN DASHBOARD
// Get ALL blood requests with hospital names
// ✅ Shows ALL hospital blood requests in Admin Dashboard
// =============================================
router.get('/', (req, res) => {
  console.log('[GET /] Admin getting all requests');
  
  try {
    const query = `
      SELECT 
        br.id,
        br.hospital_id,
        br.blood_type,
        br.quantity_needed,
        br.urgency,
        br.status,
        br.created_at,
        h.name as hospital_name,
        h.email as hospital_email
      FROM blood_requests br
      LEFT JOIN hospitals h ON br.hospital_id = h.id
      ORDER BY br.created_at DESC
      LIMIT 200
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('[GET /] Database error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
      }

      console.log('[GET /] Found:', results ? results.length : 0, 'requests');
      res.json(results || []);
    });
  } catch (error) {
    console.error('[GET /] Error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// =============================================
// GET /api/requests/hospital/:hospitalId
// Hospital Dashboard - Get hospital's requests
// =============================================
router.get('/hospital/:hospitalId', (req, res) => {
  console.log('[GET /hospital/:id]', req.params.hospitalId);
  
  try {
    const { hospitalId } = req.params;

    if (!hospitalId) {
      return res.status(400).json({ error: 'hospitalId is required' });
    }

    const query = `
      SELECT 
        id,
        hospital_id,
        blood_type,
        quantity_needed,
        urgency,
        status,
        created_at
      FROM blood_requests
      WHERE hospital_id = ?
      ORDER BY created_at DESC
      LIMIT 100
    `;

    db.query(query, [hospitalId], (err, results) => {
      if (err) {
        console.error('[GET /hospital/:id] Database error:', err.message);
        return res.status(500).json({ error: 'Failed to fetch requests', details: err.message });
      }

      console.log('[GET /hospital/:id] Found:', results ? results.length : 0, 'requests');
      res.json(results || []);
    });
  } catch (error) {
    console.error('[GET /hospital/:id] Error:', error.message);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// =============================================
// DELETE /api/requests/:requestId
// Delete a blood request
// =============================================
router.delete('/:requestId', (req, res) => {
  console.log('[DELETE /:id]', req.params.requestId);
  
  try {
    const { requestId } = req.params;

    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' });
    }

    const query = 'DELETE FROM blood_requests WHERE id = ?';

    db.query(query, [requestId], (err, result) => {
      if (err) {
        console.error('[DELETE /:id] Database error:', err.message);
        return res.status(500).json({ error: 'Failed to delete request' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }

      console.log('[DELETE /:id] Request deleted:', requestId);
      res.json({ success: true, message: 'Request deleted successfully' });
    });
  } catch (error) {
    console.error('[DELETE /:id] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
// PUT /api/requests/:requestId
// Update blood request status
// =============================================
router.put('/:requestId', (req, res) => {
  console.log('[PUT /:id]', req.params.requestId, req.body);
  
  try {
    const { requestId } = req.params;
    const { status, urgency } = req.body;

    if (!requestId) {
      return res.status(400).json({ error: 'requestId is required' });
    }

    let updateQuery = 'UPDATE blood_requests SET ';
    let params = [];

    if (status) {
      updateQuery += 'status = ? ';
      params.push(status);
    }

    if (urgency) {
      if (status) updateQuery += ', ';
      updateQuery += 'urgency = ? ';
      params.push(urgency);
    }

    updateQuery += 'WHERE id = ?';
    params.push(requestId);

    db.query(updateQuery, params, (err, result) => {
      if (err) {
        console.error('[PUT /:id] Database error:', err.message);
        return res.status(500).json({ error: 'Failed to update request' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Request not found' });
      }

      console.log('[PUT /:id] Request updated:', requestId);
      res.json({ success: true, message: 'Request updated successfully' });
    });
  } catch (error) {
    console.error('[PUT /:id] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

console.log('[requests.js] ✅ All routes registered');
console.log('[requests.js] ✅ Hospital requests show in Admin Dashboard');
console.log('[requests.js] ✅ Emails sent to donors only (NO admin email)');

module.exports = router;