const express = require('express');
const router = express.Router();
const db = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD
  }
});

const sendDonorNotifications = (blood_type, hospital_name) => {
  db.query(
    'SELECT full_name, email FROM donors WHERE blood_type = ? AND is_eligible = 1',
    [blood_type],
    async (err, donors) => {
      if (err || donors.length === 0) return;

      for (const donor of donors) {
        try {
          await transporter.sendMail({
            from: `"BloodConnect" <${process.env.GMAIL_USER}>`,
            to: donor.email,
            subject: `🩸 Urgent: ${blood_type} Blood Needed at ${hospital_name}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🩸 BloodConnect</h1>
                </div>
                <div style="padding: 30px; background: #fff;">
                  <h2 style="color: #dc2626;">Urgent Blood Request</h2>
                  <p>Dear ${donor.full_name},</p>
                  <p><strong>${hospital_name}</strong> urgently needs <strong>${blood_type}</strong> blood donors.</p>
                  <p>Your blood type matches this request. Please consider visiting the hospital to donate.</p>
                  <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Hospital:</strong> ${hospital_name}</p>
                    <p style="margin: 8px 0 0;"><strong>Blood Type Needed:</strong> ${blood_type}</p>
                  </div>
                  <a href="https://bloodconnect-lb.vercel.app/login" 
                     style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
                    View Dashboard
                  </a>
                  <p style="color: #666; margin-top: 20px; font-size: 14px;">
                    Every drop counts. Thank you for being a BloodConnect donor.
                  </p>
                </div>
                <div style="background: #111; padding: 15px; text-align: center;">
                  <p style="color: #666; margin: 0; font-size: 12px;">© 2024 BloodConnect. Smart Donor Matching System.</p>
                </div>
              </div>
            `
          });
        } catch (e) {
          console.error('Email error:', e.message);
        }
      }
    }
  );
};

router.post('/create', (req, res) => {
  const { hospital_id, blood_type, quantity_needed } = req.body;
  const sql = `INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed) VALUES (?, ?, ?)`;
  db.query(sql, [hospital_id, blood_type, quantity_needed], (err, result) => {
    if (err) return res.status(500).json({ message: 'Failed to create request', error: err.message });
    
    db.query('SELECT name FROM hospitals WHERE id = ?', [hospital_id], (err, results) => {
      if (!err && results.length > 0) {
        sendDonorNotifications(blood_type, results[0].name);
      }
    });

    res.status(201).json({ message: 'Blood request created successfully', id: result.insertId });
  });
});

router.get('/all', (req, res) => {
  const sql = `
    SELECT br.*, h.name as hospital_name, h.address as hospital_address 
    FROM blood_requests br
    JOIN hospitals h ON br.hospital_id = h.id
    ORDER BY br.created_at DESC
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

module.exports = router;