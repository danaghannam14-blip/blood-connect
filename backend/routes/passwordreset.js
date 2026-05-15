const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const API = process.env.FRONTEND_URL || 'https://bloodconnect-lb.vercel.app';

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

          const resetLink = `${API}/reset-password/${token}`;
          const timestamp = new Date().toISOString();

          console.log(`📧 Sending password reset email to: ${email}`);
          console.log(`🔗 Reset link: ${resetLink}`);
          console.log(`⏰ Timestamp: ${timestamp}`);

          try {
            const result = await fetch('https://api.brevo.com/v3/smtp/email', {
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
                htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password – BloodConnect</title>
</head>
<body style="margin:0; padding:0; background:#f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5; padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 10px 40px rgba(211,47,47,0.15);">
          
          <!-- HEADER GRADIENT -->
          <tr>
            <td style="background:linear-gradient(135deg, #D32F2F 0%, #ff5252 100%); padding:40px 30px; text-align:center;">
              <div style="font-size:48px; margin-bottom:12px;">🩸</div>
              <h1 style="color:white; margin:0; font-size:28px; font-weight:900;">BloodConnect</h1>
              <p style="color:rgba(255,255,255,0.9); margin:8px 0 0; font-size:12px; font-weight:600; text-transform:uppercase; letter-spacing:2px;">Secure Account Recovery</p>
            </td>
          </tr>

          <!-- MAIN CONTENT -->
          <tr>
            <td style="padding:40px 35px;">
              <h2 style="color:#D32F2F; font-size:24px; margin:0 0 8px; font-weight:900;">Create New Password</h2>
              <p style="color:#888; font-size:12px; margin:0 0 24px; font-weight:600; text-transform:uppercase; letter-spacing:1px;">Reset your account security</p>

              <p style="color:#555; font-size:15px; line-height:1.8; margin:0 0 20px;">
                We received a request to reset your <strong>BloodConnect</strong> password. Click the button below to create a new, secure password for your account.
              </p>

              <!-- EXPIRY WARNING -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,235,238,0.6); border:1.5px solid rgba(211,47,47,0.2); border-radius:14px; margin:20px 0; padding:16px;">
                <tr>
                  <td style="color:#D32F2F; font-size:18px; padding-right:10px;">⏱️</td>
                  <td>
                    <div style="color:#D32F2F; font-weight:800; font-size:13px; margin-bottom:4px;">Link expires in 1 hour</div>
                    <div style="color:#888; font-size:12px; line-height:1.5;">Make sure to reset your password before the link expires.</div>
                  </td>
                </tr>
              </table>

              <!-- CTA BUTTON -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td align="center">
                    <a href="${resetLink}" style="display:inline-block; background:linear-gradient(135deg, #D32F2F, #ff5252); color:white; padding:16px 48px; font-size:15px; font-weight:900; text-decoration:none; border-radius:12px; box-shadow:0 8px 24px rgba(211,47,47,0.3); letter-spacing:0.5px;">
                      🔐 Reset Password
                    </a>
                  </td>
                </tr>
              </table>

              <!-- FALLBACK LINK -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9; border:1px solid #eee; border-radius:10px; padding:14px; margin:20px 0;">
                <tr>
                  <td>
                    <div style="font-size:11px; color:#999; font-weight:600; margin-bottom:8px; text-transform:uppercase; letter-spacing:1px;">Or copy this link:</div>
                    <div style="font-size:11px; color:#D32F2F; font-family:monospace; word-break:break-all; line-height:1.6; font-weight:600;">${resetLink}</div>
                  </td>
                </tr>
              </table>

              <!-- SECURITY NOTICE -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:rgba(255,235,238,0.4); border:1.5px solid rgba(211,47,47,0.15); border-radius:14px; padding:16px; margin:20px 0;">
                <tr>
                  <td style="color:#D32F2F; font-size:20px; padding-right:10px;">🔒</td>
                  <td>
                    <div style="color:#D32F2F; font-weight:800; font-size:13px; margin-bottom:4px;">Security Reminder</div>
                    <div style="color:#888; font-size:12px; line-height:1.6;">
                      If you didn't request this password reset, your account might be at risk. Ignore this email or contact support immediately.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:linear-gradient(160deg, #1a1a1a, #2d1111); padding:30px; text-align:center; border-top:1px solid #ddd;">
              <h3 style="color:white; margin:0 0 4px; font-size:16px; font-weight:900;">BloodConnect</h3>
              <p style="color:#888; margin:0 0 16px; font-size:11px; text-transform:uppercase; letter-spacing:2px; font-weight:600;">Smart Donor Matching System</p>
              
              <table cellpadding="0" cellspacing="0" style="margin:12px auto;">
                <tr>
                  <td style="padding:0 8px;"><a href="${API}" style="color:#ff5252; text-decoration:none; font-size:12px; font-weight:700;">Website</a></td>
                  <td style="color:#555; padding:0 8px;">|</td>
                  <td style="padding:0 8px;"><a href="${API}/contact" style="color:#ff5252; text-decoration:none; font-size:12px; font-weight:700;">Support</a></td>
                </tr>
              </table>

              <p style="color:#666; margin:16px 0 0; font-size:11px;">© 2024 BloodConnect. All rights reserved.</p>
              <p style="color:#888; margin:6px 0 0; font-size:10px; text-transform:uppercase; letter-spacing:2px; font-weight:700;">Secure · Trusted · Life-Saving</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`
              })
            });

            const data = await result.json();
            console.log('✅ Email sent successfully:', JSON.stringify(data));
            res.json({ message: 'Password reset link sent to your email.' });
          } catch (err) {
            console.error('❌ Email send error:', err.message);
            res.status(500).json({ message: 'Failed to send reset email', error: err.message });
          }
        });
    });
  });
});

router.post('/reset', async (req, res) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  db.query('SELECT * FROM password_resets WHERE token = ?', [token], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired reset link.' });

    const reset = results[0];
    if (new Date() > new Date(reset.expires_at)) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    try {
      const hashed = bcrypt.hashSync(new_password, 10);
      db.query('UPDATE donors SET password = ? WHERE email = ?', [hashed, reset.email], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        db.query('DELETE FROM password_resets WHERE token = ?', [token], () => {
          console.log(`✅ Password reset successfully for: ${reset.email}`);
          res.json({ message: 'Password reset successfully! You can now login.' });
        });
      });
    } catch (err) {
      console.error('Password hash error:', err.message);
      res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
  });
});

module.exports = router;