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
    const expires_at = new Date(Date.now() + 3600000);

    db.query('DELETE FROM password_resets WHERE email = ?', [email], () => {
      db.query('INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
        [email, token, expires_at], async (err) => {
          if (err) return res.status(500).json({ message: err.message });

          const resetLink = `${API}/reset-password/${token}`;

          console.log(`Email sending to: ${email}`);
          console.log(`Reset link: ${resetLink}`);

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
                subject: 'Verify Your Password Reset — BloodConnect',
                htmlContent: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Password – BloodConnect</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Plus Jakarta Sans', sans-serif; background: linear-gradient(-45deg, #FFEBEE, #F8F9FA, #FFEBEE, rgba(14,165,233,.35)); background-size: 400% 400%; animation: gradientShift 14s ease infinite; }
    
    @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(24px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes slideInLeft { 0% { opacity: 0; transform: translateX(-32px); } 100% { opacity: 1; transform: translateX(0); } }
    @keyframes slideInRight { 0% { opacity: 0; transform: translateX(32px); } 100% { opacity: 1; transform: translateX(0); } }
    @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(211,47,47,0.3), inset 0 0 10px rgba(211,47,47,0.1); } 50% { box-shadow: 0 0 40px rgba(211,47,47,0.6), inset 0 0 20px rgba(211,47,47,0.2); } }
    
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .wrapper { background: rgba(255,255,255,0.95); backdrop-filter: blur(40px); border-radius: 28px; overflow: hidden; border: 1px solid rgba(211,47,47,0.1); box-shadow: 0 24px 56px -12px rgba(211,47,47,0.08), inset 0 0 36px rgba(255,255,255,0.6); animation: fadeInUp 0.8s ease-out; }
    
    .header { background: linear-gradient(-45deg, #D32F2F, #ff6b6b, #ff8a80); background-size: 300% 300%; animation: gradientShift 8s ease infinite; padding: 48px 40px; text-align: center; position: relative; overflow: hidden; }
    .header::before { content: ''; position: absolute; top: -50%; right: -50%; width: 200%; height: 200%; background: rgba(255,255,255,0.1); border-radius: 50%; animation: float 6s ease-in-out infinite; }
    .header::after { content: ''; position: absolute; bottom: -40%; left: -40%; width: 180%; height: 180%; background: rgba(255,255,255,0.08); border-radius: 50%; animation: float 8s ease-in-out infinite reverse; }
    
    .logo { font-size: 36px; margin-bottom: 16px; position: relative; z-index: 1; display: block; }
    .header h1 { color: white; font-size: 28px; font-weight: 900; margin: 0; font-family: 'Fraunces', serif; position: relative; z-index: 1; letter-spacing: -0.04em; text-shadow: 0 4px 20px rgba(0,0,0,0.2); }
    .header p { color: rgba(255,255,255,0.85); font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; margin: 8px 0 0; position: relative; z-index: 1; }
    
    .content { padding: 48px 40px; position: relative; }
    .content::before { content: ''; position: absolute; top: -50%; right: -20%; width: 300px; height: 300px; background: rgba(211,47,47,0.12); border-radius: 50%; filter: blur(100px); pointer-events: none; }
    .content::after { content: ''; position: absolute; bottom: -30%; left: -10%; width: 250px; height: 250px; background: rgba(64,88,120,0.08); border-radius: 50%; filter: blur(80px); pointer-events: none; }
    
    .section { position: relative; z-index: 1; margin-bottom: 28px; animation: fadeInUp 0.8s ease-out; animation-fill-mode: both; }
    .section:nth-child(1) { animation-delay: 0.1s; }
    .section:nth-child(2) { animation-delay: 0.2s; }
    .section:nth-child(3) { animation-delay: 0.3s; }
    .section:nth-child(4) { animation-delay: 0.4s; }
    .section:nth-child(5) { animation-delay: 0.5s; }
    
    h2 { color: #D32F2F; font-size: 22px; font-weight: 900; margin: 0 0 8px; font-family: 'Fraunces', serif; letter-spacing: -0.02em; }
    .subtitle { color: #888; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin: 0; }
    
    .text { color: #555; font-size: 14px; line-height: 1.8; margin: 20px 0 0; font-weight: 500; }
    
    .alert { background: rgba(255,235,238,0.6); border: 1.5px solid rgba(211,47,47,0.2); border-radius: 16px; padding: 18px 20px; margin: 24px 0; display: flex; gap: 14px; align-items: flex-start; }
    .alert-icon { font-size: 20px; flex-shrink: 0; animation: pulse 2s ease-in-out infinite; }
    .alert-text h3 { color: #D32F2F; font-size: 12px; font-weight: 800; margin: 0 0 4px; }
    .alert-text p { color: #888; font-size: 12px; line-height: 1.6; margin: 0; }
    
    .cta-button { display: block; background: linear-gradient(135deg, #D32F2F, #ff6b6b); color: white; text-decoration: none; padding: 16px 48px; border-radius: 16px; text-align: center; font-weight: 900; font-size: 15px; margin: 32px auto; width: fit-content; box-shadow: 0 12px 32px rgba(211,47,47,0.32); position: relative; overflow: hidden; transition: all 0.3s ease; animation: fadeInUp 0.8s ease-out 0.4s both; }
    .cta-button::before { content: ''; position: absolute; top: 50%; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 2s infinite; }
    .cta-button:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 18px 48px rgba(211,47,47,0.44); }
    
    .link-box { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 16px; margin: 20px 0; }
    .link-label { font-size: 10px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 8px; display: block; }
    .link-text { font-size: 11px; color: #D32F2F; font-family: monospace; word-break: break-all; line-height: 1.6; font-weight: 600; }
    
    .footer { background: linear-gradient(160deg, #1a1a1a, #2d1111); padding: 36px 40px; text-align: center; border-top: 1px solid rgba(211,47,47,0.1); position: relative; }
    .footer h3 { color: white; font-size: 16px; font-weight: 900; margin: 0 0 8px; font-family: 'Fraunces', serif; }
    .footer p { color: #888; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin: 0; }
    .footer-text { color: #666; font-size: 10px; margin: 16px 0 0; }
    
    .divider { height: 2px; background: linear-gradient(90deg, transparent, #D32F2F, transparent); margin: 24px 0; }
    
    .badge { display: inline-block; background: rgba(211,47,47,0.12); color: #D32F2F; padding: 6px 14px; border-radius: 20px; font-size: 10px; font-weight: 800; letter-spacing: 0.15em; text-transform: uppercase; margin: 0 0 16px; border: 1px solid rgba(211,47,47,0.2); }
    
    .particles { position: absolute; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
    .particle { position: absolute; border-radius: 50%; background: rgba(211,47,47,0.15); animation: particleFloat 6s ease-in-out infinite; }
    
    @keyframes particleFloat { 0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.3; } 50% { transform: translateY(-20px) translateX(15px) scale(1.2); opacity: 0.8; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="wrapper">
      <!-- HEADER -->
      <div class="header">
        <div class="particles">
          <div class="particle" style="width: 8px; height: 8px; top: 20%; left: 15%; animation-delay: 0s;"></div>
          <div class="particle" style="width: 6px; height: 6px; top: 40%; right: 20%; animation-delay: 1s;"></div>
          <div class="particle" style="width: 10px; height: 10px; bottom: 25%; left: 25%; animation-delay: 2s;"></div>
          <div class="particle" style="width: 7px; height: 7px; top: 60%; right: 15%; animation-delay: 1.5s;"></div>
        </div>
        <span class="logo">🩸</span>
        <h1>BloodConnect</h1>
        <p>Account Security Reset</p>
      </div>

      <!-- CONTENT -->
      <div class="content">
        <div class="section">
          <div class="badge">Password Reset Request</div>
          <h2>Secure Your Account</h2>
          <p class="subtitle">Create a new password for enhanced security</p>
        </div>

        <div class="section">
          <p class="text">We received a request to reset your BloodConnect password. Click the button below to create a new, secure password for your account.</p>
        </div>

        <!-- EXPIRY ALERT -->
        <div class="section">
          <div class="alert">
            <span class="alert-icon">⏱</span>
            <div class="alert-text">
              <h3>Link Expires in 1 Hour</h3>
              <p>Make sure to reset your password before the link expires. After expiration, you'll need to request a new one.</p>
            </div>
          </div>
        </div>

        <!-- CTA BUTTON -->
        <div class="section">
          <a href="${resetLink}" class="cta-button">Reset Your Password</a>
        </div>

        <!-- FALLBACK LINK -->
        <div class="section">
          <div class="link-box">
            <span class="link-label">Or copy this link:</span>
            <div class="link-text">${resetLink}</div>
          </div>
        </div>

        <!-- SECURITY NOTICE -->
        <div class="section">
          <div class="alert">
            <span class="alert-icon">🔒</span>
            <div class="alert-text">
              <h3>Didn't Request This?</h3>
              <p>If you didn't request a password reset, ignore this email or contact our support team immediately. Your account security is our priority.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <h3>BloodConnect</h3>
        <p>Smart Donor Matching System</p>
        <div class="footer-text">
          <p style="margin: 12px 0;">
            <a href="${API}" style="color: #ff6b6b; text-decoration: none; font-weight: 700;">Visit Website</a> | 
            <a href="${API}/support" style="color: #ff6b6b; text-decoration: none; font-weight: 700;">Support Center</a>
          </p>
          <p style="margin: 12px 0 0; color: #555; font-size: 9px;">© 2026 BloodConnect. All rights reserved. Secure • Trusted • Life-Saving</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
              })
            });

            const data = await result.json();
            console.log('Email sent successfully');
            res.json({ message: 'Password reset link sent to your email.' });
          } catch (err) {
            console.error('Email send error:', err.message);
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
          console.log(`Password reset successfully for: ${reset.email}`);
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