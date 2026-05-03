const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

router.post('/forgot', (req, res) => {
  const { email } = req.body;

  db.query('SELECT * FROM donors WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'No account found with this email.' });

    const token = uuidv4();
    const expires_at = new Date(Date.now() + 3600000); // 1 hour

    db.query('DELETE FROM password_resets WHERE email = ?', [email], () => {
      db.query('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expires_at], async (err) => {
          if (err) return res.status(500).json({ message: err.message });

          const resetLink = `https://bloodconnect-lb.vercel.app/reset-password/${token}`;

          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
              'accept': 'application/json',
              'api-key': process.env.BREVO_API_KEY,
              'content-type': 'application/json'
            },
            body: JSON.stringify({
              sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
              to: [{ email }],
              subject: '🔑 Reset Your BloodConnect Password',
              htmlContent: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <div style="background-color: #dc2626; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">🩸 BloodConnect</h1>
                  </div>
                  <div style="padding: 30px; background: #fff;">
                    <h2 style="color: #dc2626;">Password Reset Request</h2>
                    <p>You requested to reset your password. Click the button below to set a new password.</p>
                    <p>This link expires in 1 hour.</p>
                    <a href="${resetLink}" 
                       style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
                      Reset Password
                    </a>
                    <p style="color: #666; margin-top: 20px; font-size: 14px;">
                      If you didn't request this, ignore this email.
                    </p>
                  </div>
                  <div style="background: #111; padding: 15px; text-align: center;">
                    <p style="color: #666; margin: 0; font-size: 12px;">© 2024 BloodConnect. Smart Donor Matching System.</p>
                  </div>
                </div>
              `
            })
          });

          res.json({ message: 'Password reset link sent to your email.' });
        });
    });
  });
});

router.post('/reset', async (req, res) => {
  const { token, new_password } = req.body;

  db.query('SELECT * FROM password_resets WHERE token = ?', [token], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired reset link.' });

    const reset = results[0];
    if (new Date() > new Date(reset.expires_at)) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    const hashed = bcrypt.hashSync(new_password, 10);
    db.query('UPDATE donors SET password = ? WHERE email = ?', [hashed, reset.email], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      db.query('DELETE FROM password_resets WHERE token = ?', [token], () => {
        res.json({ message: 'Password reset successfully! You can now login.' });
      });
    });
  });
});

module.exports = router;