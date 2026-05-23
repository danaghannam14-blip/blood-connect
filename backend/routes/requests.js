const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

console.log('[requests.js] Setting up Brevo REST API...');
console.log('[requests.js] BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);

// ✅ Send email via Brevo REST API
const sendEmailViaBrevo = async (toEmail, toName, subject, htmlContent) => {
  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: toEmail, name: toName }],
      sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
      subject: subject,
      htmlContent: htmlContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending to ${toEmail}:`, error.message);
    return false;
  }
};

console.log('[requests.js] Routes registering...');

// POST /api/requests/create
router.post('/create', async (req, res) => {
  console.log('[POST /create] Received:', req.body);
  
  try {
    const { hospital_id, blood_type, quantity_needed, urgency } = req.body;

    if (!hospital_id || !blood_type || !quantity_needed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed, urgency, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(query, [hospital_id, blood_type, quantity_needed, urgency || 'urgent'], async (err, result) => {
      if (err) {
        console.error('[POST /create] Database error:', err.message);
        return res.status(500).json({ error: 'Failed to create request' });
      }

      console.log('[POST /create] Request created with ID:', result.insertId);

      // Get hospital info
      const hospitalQuery = 'SELECT name FROM hospitals WHERE id = ?';
      db.query(hospitalQuery, [hospital_id], async (err, hospitalResults) => {
        if (!err && hospitalResults && hospitalResults.length) {
          const hospital = hospitalResults[0];
          
          // Get donors
          const donorQuery = `
            SELECT email, full_name FROM donors 
            WHERE blood_type = ? AND is_eligible = 1 
            LIMIT 50
          `;
          
          db.query(donorQuery, [blood_type], async (err, donors) => {
            if (!err && donors && donors.length) {
              console.log(`[POST /create] Found ${donors.length} donors`);
              
              // Send emails via Brevo REST API
              for (let i = 0; i < donors.length; i++) {
                const donor = donors[i];
                
                const emailHtml = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc2626;">🩸 Emergency Blood Request</h2>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p>Hi <strong>${donor.full_name}</strong>,</p>
                      <p><strong>${hospital.name}</strong> urgently needs <strong>${quantity_needed} units</strong> of <strong>${blood_type}</strong> blood.</p>
                    </div>
                    
                    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                      <p style="margin: 0; font-weight: bold; color: #991b1b;">⚠️ Your blood type matches! Please respond ASAP.</p>
                    </div>
                    
                    <p>Every donation saves lives. Thank you!</p>
                  </div>
                `;

                await sendEmailViaBrevo(
                  donor.email,
                  donor.full_name,
                  `🩸 URGENT: ${hospital.name} needs ${blood_type} blood`,
                  emailHtml
                );
              }
            }
          });
        }
      });

      res.json({ 
        success: true,
        message: 'Blood request created',
        requestId: result.insertId
      });
    });
  } catch (error) {
    console.error('[POST /create] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requests
router.get('/', (req, res) => {
  const query = `
    SELECT br.*, h.name as hospital_name
    FROM blood_requests br
    LEFT JOIN hospitals h ON br.hospital_id = h.id
    ORDER BY br.created_at DESC
    LIMIT 200
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch' });
    }
    res.json(results || []);
  });
});

// GET /api/requests/hospital/:hospitalId
router.get('/hospital/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;

  const query = `
    SELECT * FROM blood_requests
    WHERE hospital_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `;

  db.query(query, [hospitalId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch' });
    }
    res.json(results || []);
  });
});

// DELETE /api/requests/:requestId
router.delete('/:requestId', (req, res) => {
  const { requestId } = req.params;
  const query = 'DELETE FROM blood_requests WHERE id = ?';

  db.query(query, [requestId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete' });
    }
    res.json({ success: true });
  });
});

// PUT /api/requests/:requestId
router.put('/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  const query = 'UPDATE blood_requests SET status = ? WHERE id = ?';

  db.query(query, [status, requestId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to update' });
    }
    res.json({ success: true });
  });
});

console.log('[requests.js] ✅ Routes registered');

module.exports = router;