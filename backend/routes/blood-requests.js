const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

console.log('[blood-requests.js] Setting up Brevo REST API...');

// ✅ Send email via Brevo REST API
const sendEmailViaBrevo = async (toEmail, toName, subject, htmlContent) => {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
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

// Blood type compatibility
const getCompatibleDonors = (bloodType) => {
  const compatibility = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  };
  return compatibility[bloodType] || [];
};

// POST /api/blood-requests/create-emergency
router.post('/create-emergency', async (req, res) => {
  try {
    const { patient_email, blood_type, governorate } = req.body;

    if (!patient_email || !blood_type || !governorate) {
      return res.status(400).json({ error: 'patient_email, blood_type, and governorate required' });
    }

    const compatibleBloodTypes = getCompatibleDonors(blood_type);

    const donorSql = `
      SELECT id, full_name, email FROM donors 
      WHERE blood_type IN (?) 
      AND governorate = ? 
      AND is_eligible = 1
      LIMIT 100
    `;

    db.query(donorSql, [compatibleBloodTypes, governorate], async (err, donors) => {
      if (err || !donors || donors.length === 0) {
        return res.json({ message: 'No donors found', donorsNotified: 0 });
      }

      console.log(`📝 Emergency: ${blood_type} in ${governorate}, ${donors.length} donors`);

      let successCount = 0;
      for (let i = 0; i < donors.length; i++) {
        const donor = donors[i];
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626; margin: 0 0 20px 0;">🩸 Emergency Blood Request</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;">Hi <strong>${donor.full_name}</strong>,</p>
              <p style="margin: 0 0 10px 0;">
                A patient urgently needs <strong style="font-size: 16px; color: #dc2626;">${blood_type}</strong> blood 
                in <strong style="font-size: 16px; color: #1f2937;">${governorate}</strong>.
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
        `;

        const sent = await sendEmailViaBrevo(donor.email, donor.full_name, `🩸 URGENT: ${blood_type} blood needed in ${governorate}`, emailHtml);

        if (sent) {
          successCount++;
          const insertSql = `INSERT INTO emergency_donations (donor_id, blood_type, patient_email, governorate, status) VALUES (?, ?, ?, ?, 'pending')`;
          db.query(insertSql, [donor.id, blood_type, patient_email, governorate], () => {});
        }
      }

      res.json({ message: `${successCount}/${donors.length} donors notified`, donorsNotified: successCount });
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blood-requests/create
router.post('/create', async (req, res) => {
  const { hospital_id, blood_type, quantity_needed, urgency } = req.body;

  if (!hospital_id || !blood_type || !quantity_needed) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const query = `INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed, urgency, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())`;

  db.query(query, [hospital_id, blood_type, quantity_needed, urgency || 'urgent'], async (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });

    const hospitalQuery = 'SELECT name FROM hospitals WHERE id = ?';
    db.query(hospitalQuery, [hospital_id], async (err, hospitalResults) => {
      if (!err && hospitalResults && hospitalResults.length) {
        const hospital = hospitalResults[0];
        const donorQuery = `SELECT email, full_name FROM donors WHERE blood_type = ? AND is_eligible = 1 LIMIT 50`;
        
        db.query(donorQuery, [blood_type], async (err, donors) => {
          if (!err && donors && donors.length) {
            console.log(`📧 Found ${donors.length} donors`);
            
            for (let i = 0; i < donors.length; i++) {
              const donor = donors[i];
              const emailHtml = `<h2>🩸 Emergency: ${hospital.name} needs ${blood_type}</h2><p>Quantity: ${quantity_needed} units</p><p>Your blood type matches!</p>`;
              await sendEmailViaBrevo(donor.email, donor.full_name, `🩸 URGENT: ${hospital.name} needs ${blood_type}`, emailHtml);
            }
          }
        });
      }
    });

    res.json({ success: true, requestId: result.insertId });
  });
});

// GET /api/blood-requests/hospital/:hospitalId
router.get('/hospital/:hospitalId', (req, res) => {
  const query = `SELECT * FROM blood_requests WHERE hospital_id = ? ORDER BY created_at DESC`;
  db.query(query, [req.params.hospitalId], (err, results) => {
    res.json(results || []);
  });
});

// Other routes (stub implementations)
router.get('/center-donations', (req, res) => res.json([]));
router.post('/hospital-confirm', (req, res) => res.json({ success: true }));
router.post('/admin-confirm', (req, res) => res.json({ success: true }));
router.get('/donor/:donorId', (req, res) => res.json([]));
router.post('/donor-confirm-donation', (req, res) => res.json({ success: true }));
router.delete('/:requestId', (req, res) => res.json({ success: true }));

console.log('[blood-requests.js] ✅ Routes registered');

module.exports = router;