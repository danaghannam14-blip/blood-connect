const express = require('express');
const router = express.Router();
const db = require('../db');

const compatibleDonors = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+']
};

const urgencyOrder = { critical: 0, urgent: 1, medium: 2, low: 3 };

const sendDonorNotifications = async (blood_type, hospital_name, hospital_id, urgency) => {
  const canDonateFrom = Object.keys(compatibleDonors).filter(donor =>
    compatibleDonors[donor].includes(blood_type)
  );
  const placeholders = canDonateFrom.map(() => '?').join(',');
  db.query(
    `SELECT id, full_name, email FROM donors WHERE blood_type IN (${placeholders}) AND is_eligible = 1`,
    canDonateFrom,
    async (err, donors) => {
      if (err) { console.log('DB error:', err.message); return; }
      if (donors.length === 0) { console.log('No eligible donors found'); return; }
      for (const donor of donors) {
        try {
          const alreadyNotified = await new Promise((resolve) => {
            db.query(
              'SELECT id FROM notifications WHERE donor_id = ? AND hospital_id = ? AND blood_type = ?',
              [donor.id, hospital_id, blood_type],
              (err, existing) => resolve(existing && existing.length > 0)
            );
          });
          if (alreadyNotified) continue;
          await new Promise((resolve) => {
            db.query(
              'INSERT INTO notifications (donor_id, hospital_id, blood_type) VALUES (?, ?, ?)',
              [donor.id, hospital_id, blood_type],
              (err) => { if (err) console.log('Notification save error:', err.message); resolve(); }
            );
          });
          const urgencyLabel = urgency === 'critical' ? '🚨 CRITICAL' : urgency === 'urgent' ? '⚠️ Urgent' : urgency === 'medium' ? '📢 Medium Priority' : '📋 Low Priority';
          const urgencyColor = urgency === 'critical' ? '#dc2626' : urgency === 'urgent' ? '#ea580c' : urgency === 'medium' ? '#ca8a04' : '#6b7280';
          const result = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'accept': 'application/json', 'api-key': process.env.BREVO_API_KEY, 'content-type': 'application/json' },
            body: JSON.stringify({
              sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
              to: [{ email: donor.email, name: donor.full_name }],
              subject: `${urgencyLabel}: ${blood_type} Blood Needed at ${hospital_name}`,
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: ${urgencyColor}; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🩸 BloodConnect</h1>
                  </div>
                  <div style="padding: 30px; background: #fff;">
                    <h2 style="color: ${urgencyColor};">${urgencyLabel} Blood Request</h2>
                    <p>Dear ${donor.full_name},</p>
                    <p><strong>${hospital_name}</strong> needs <strong>${blood_type}</strong> blood — your type is compatible!</p>
                    <div style="background: #fef2f2; border-left: 4px solid ${urgencyColor}; padding: 15px; margin: 20px 0;">
                      <p style="margin: 0;"><strong>Hospital:</strong> ${hospital_name}</p>
                      <p style="margin: 8px 0 0;"><strong>Blood Type:</strong> ${blood_type}</p>
                      <p style="margin: 8px 0 0;"><strong>Priority:</strong> ${urgency.charAt(0).toUpperCase() + urgency.slice(1)}</p>
                    </div>
                    <a href="https://bloodconnect-lb.vercel.app/donor/dashboard" style="background: ${urgencyColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
                      Book Appointment
                    </a>
                  </div>
                  <div style="background: #111; padding: 15px; text-align: center;">
                    <p style="color: #666; margin: 0; font-size: 12px;">© 2026 BloodConnect. Smart Donor Matching System.</p>
                  </div>
                </div>
              `
            })
          });
          const responseData = await result.json();
          console.log('Brevo response:', JSON.stringify(responseData));
        } catch (e) {
          console.error('Email error:', e.message);
        }
      }
    }
  );
};

router.post('/create', (req, res) => {
  const { hospital_id, blood_type, quantity_needed, urgency = 'urgent' } = req.body;
  const sql = `INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed, urgency) VALUES (?, ?, ?, ?)`;
  db.query(sql, [hospital_id, blood_type, quantity_needed, urgency], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to create request', error: err.message });
    db.query('SELECT name FROM hospitals WHERE id = ?', [hospital_id], (err, results) => {
      if (!err && results.length > 0) {
        sendDonorNotifications(blood_type, results[0].name, hospital_id, urgency);
      }
    });
    res.status(201).json({ message: 'Blood request created successfully', id: result.insertId });
  });
});

router.get('/compatible/:blood_type', (req, res) => {
  const blood_type = req.params.blood_type;
  const compatible = compatibleDonors[blood_type] || [blood_type];
  const placeholders = compatible.map(() => '?').join(',');
  const sql = `
    SELECT br.*, h.name as hospital_name, h.address as hospital_address 
    FROM blood_requests br
    JOIN hospitals h ON br.hospital_id = h.id
    WHERE br.blood_type IN (${placeholders}) AND br.status = 'pending'
    ORDER BY FIELD(br.urgency, 'critical', 'urgent', 'medium', 'low'), br.created_at DESC
  `;
  db.query(sql, compatible, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to get requests', error: err.message });
    res.json(results);
  });
});

router.get('/all', (req, res) => {
  const sql = `
    SELECT br.*, h.name as hospital_name, h.address as hospital_address 
    FROM blood_requests br
    JOIN hospitals h ON br.hospital_id = h.id
    WHERE br.status = 'pending'
    ORDER BY FIELD(br.urgency, 'critical', 'urgent', 'medium', 'low'), br.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to get requests', error: err.message });
    res.json(results);
  });
});

router.get('/hospital/:id', (req, res) => {
  const sql = `SELECT * FROM blood_requests WHERE hospital_id = ? ORDER BY created_at DESC`;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to get requests', error: err.message });
    res.json(results);
  });
});

router.put('/fulfill/:id', (req, res) => {
  const sql = `UPDATE blood_requests SET status = 'fulfilled' WHERE id = ?`;
  db.query(sql, [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to update request', error: err.message });
    res.json({ message: 'Request fulfilled successfully' });
  });
});

router.put('/update/:id', (req, res) => {
  const { status } = req.body;
  const sql = `UPDATE blood_requests SET status = ? WHERE id = ?`;
  db.query(sql, [status, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: 'Failed to update request', error: err.message });
    res.json({ message: 'Request updated successfully' });
  });
});

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM blood_requests WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Request deleted' });
  });
});

router.get('/inventory/status', (req, res) => {
  const sql = `
    SELECT blood_type, COUNT(*) as pending_requests, SUM(quantity_needed) as units_needed
    FROM blood_requests WHERE status = 'pending' GROUP BY blood_type
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    const inventory = bloodTypes.map(bt => {
      const found = results.find(r => r.blood_type === bt);
      const unitsNeeded = found ? found.units_needed : 0;
      const status = unitsNeeded === 0 ? 'available' : unitsNeeded <= 2 ? 'low' : 'critical';
      return { blood_type: bt, units_needed: unitsNeeded, status };
    });
    res.json(inventory);
  });
});

module.exports = router;