const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const API = process.env.FRONTEND_URL || 'https://blood-connect-lb.vercel.app';

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
    html, body { width: 100%; height: 100%; }
    body { 
      font-family: 'Plus Jakarta Sans', sans-serif; 
      background: linear-gradient(-45deg, #f8f8f8 0%, #efefef 25%, #f8f8f8 50%, rgba(14,165,233,.35) 75%, #f2f2f2 100%);
      background-size: 400% 400%;
      animation: bgGradient 15s ease infinite;
      min-height: 100vh;
      margin: 0;
      padding: 0;
    }
    
    @keyframes bgGradient { 
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes fadeInUp { 0% { opacity: 0; transform: translateY(32px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes slideInDown { 0% { opacity: 0; transform: translateY(-32px); } 100% { opacity: 1; transform: translateY(0); } }
    @keyframes shimmer { 0% { left: -100%; } 100% { left: 100%; } }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-16px); } }
    @keyframes orbFloat { 0%, 100% { transform: translateY(0) translateX(0); } 33% { transform: translateY(-30px) translateX(20px); } 66% { transform: translateY(8px) translateX(-10px); } }
    @keyframes glow { 0%, 100% { box-shadow: 0 0 20px rgba(211,47,47,0.3); } 50% { box-shadow: 0 0 40px rgba(211,47,47,0.6); } }
    
    .container { max-width: 720px; margin: 0 auto; padding: 20px; }
    .wrapper { 
      background: rgba(255,255,255,0.95); 
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border-radius: 32px; 
      overflow: hidden; 
      border: 1px solid rgba(255,255,255,0.8);
      box-shadow: 0 24px 56px -12px rgba(211,47,47,0.08), inset 0 0 36px rgba(255,255,255,0.6);
      animation: fadeInUp 0.8s ease-out;
    }
    
    .header { 
      background: linear-gradient(135deg, #6e2016 0%, #ff6b6b 50%, #ff8a80 100%);
      background-size: 300% 300%;
      animation: bgGradient 8s ease infinite;
      padding: 56px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -60%;
      right: -20%;
      width: 400px;
      height: 400px;
      background: rgba(255,255,255,0.15);
      border-radius: 50%;
      filter: blur(60px);
      animation: orbFloat 9s ease-in-out infinite;
    }
    
    .header::after {
      content: '';
      position: absolute;
      bottom: -40%;
      left: -10%;
      width: 300px;
      height: 300px;
      background: rgba(255,255,255,0.12);
      border-radius: 50%;
      filter: blur(50px);
      animation: orbFloat 11s ease-in-out infinite reverse;
    }
    
    .particles { position: absolute; width: 100%; height: 100%; pointer-events: none; overflow: hidden; }
    .particle { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.25); animation: particleFloat 6s ease-in-out infinite; }
    
    @keyframes particleFloat {
      0%, 100% { transform: translateY(0) translateX(0) scale(1); opacity: 0.4; }
      50% { transform: translateY(-30px) translateX(25px) scale(1.3); opacity: 0.9; }
    }
    
    .logo { font-size: 44px; margin-bottom: 16px; position: relative; z-index: 2; animation: slideInDown 0.8s ease-out; }
    .header h1 { color: #faf7f7; font-size: 32px; font-weight: 900; margin: 0; font-family: 'Fraunces', serif; position: relative; z-index: 2; letter-spacing: -0.04em; text-shadow: 0 4px 20px rgba(0,0,0,0.2); animation: slideInDown 0.8s ease-out 0.1s both; }
    .header p { color: rgba(255,255,255,0.9); font-size: 12px; font-weight: 700; letter-spacing: 0.24em; text-transform: uppercase; margin: 12px 0 0; position: relative; z-index: 2; animation: slideInDown 0.8s ease-out 0.2s both; }
    
    .content { padding: 52px 44px; position: relative; background: rgba(255,255,255,0.5); }
    .content::before { content: ''; position: absolute; top: -80px; right: -40px; width: 300px; height: 300px; background: rgba(211,47,47,0.12); border-radius: 50%; filter: blur(100px); pointer-events: none; }
    .content::after { content: ''; position: absolute; bottom: -60px; left: -30px; width: 250px; height: 250px; background: rgba(64,88,120,0.1); border-radius: 50%; filter: blur(80px); pointer-events: none; }
    
    .section { position: relative; z-index: 1; margin-bottom: 32px; animation: fadeInUp 0.8s ease-out; animation-fill-mode: both; }
    .section:nth-child(1) { animation-delay: 0.2s; }
    .section:nth-child(2) { animation-delay: 0.3s; }
    .section:nth-child(3) { animation-delay: 0.4s; }
    .section:nth-child(4) { animation-delay: 0.5s; }
    .section:nth-child(5) { animation-delay: 0.6s; }
    .section:nth-child(6) { animation-delay: 0.7s; }
    
    .badge { display: inline-block; background: rgba(211,47,47,0.15); color: #6e2016; padding: 7px 16px; border-radius: 24px; font-size: 11px; font-weight: 900; letter-spacing: 0.18em; text-transform: uppercase; margin: 0 0 20px; border: 1.5px solid rgba(211,47,47,0.25); backdrop-filter: blur(10px); }
    h2 { color: #6e2016; font-size: 26px; font-weight: 900; margin: 0 0 10px; font-family: 'Fraunces', serif; letter-spacing: -0.02em; }
    .subtitle { color: #888; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; margin: 0; }
    .text { color: #555; font-size: 15px; line-height: 1.8; margin: 22px 0 0; font-weight: 500; }
    
    .alert { background: rgba(255,235,238,0.5); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1.5px solid rgba(211,47,47,0.2); border-radius: 18px; padding: 20px 22px; margin: 28px 0; display: flex; gap: 16px; align-items: flex-start; position: relative; overflow: hidden; }
    .alert::before { content: ''; position: absolute; top: -50%; right: -20%; width: 150px; height: 150px; background: rgba(211,47,47,0.1); border-radius: 50%; filter: blur(40px); pointer-events: none; }
    .alert-icon { font-size: 22px; flex-shrink: 0; animation: pulse 2.5s ease-in-out infinite; position: relative; z-index: 1; }
    .alert-text { position: relative; z-index: 1; }
    .alert-text h3 { color: #6e2016; font-size: 13px; font-weight: 900; margin: 0 0 6px; letter-spacing: -0.01em; }
    .alert-text p { color: #888; font-size: 13px; line-height: 1.6; margin: 0; font-weight: 500; }
    
    .cta-button { display: inline-block; background: linear-gradient(135deg, #6e2016 0%, #ff6b6b 100%); color: #faf7f7; text-decoration: none; padding: 16px 52px; border-radius: 18px; font-weight: 900; font-size: 15px; text-align: center; box-shadow: 0 12px 32px rgba(211,47,47,0.32); position: relative; overflow: hidden; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); animation: fadeInUp 0.8s ease-out 0.5s both; display: block; width: fit-content; margin: 36px auto; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; }
    .cta-button::before { content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); animation: shimmer 2s infinite; }
    .cta-button:hover { transform: translateY(-4px) scale(1.05); box-shadow: 0 18px 48px rgba(211,47,47,0.44); }
    
    .link-box { background: rgba(255,255,255,0.6); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1.5px solid rgba(211,47,47,0.12); border-radius: 14px; padding: 18px 20px; margin: 24px 0; }
    .link-label { font-size: 11px; color: #999; font-weight: 700; text-transform: uppercase; letter-spacing: 0.16em; margin-bottom: 10px; display: block; }
    .link-text { font-size: 12px; color: #6e2016; font-family: 'Courier New', monospace; word-break: break-all; line-height: 1.6; font-weight: 600; }
    
    .footer { background: linear-gradient(160deg, #1a1a1a 0%, #2d1111 100%); padding: 40px 44px; text-align: center; border-top: 1px solid rgba(211,47,47,0.1); position: relative; }
    .footer::before { content: ''; position: absolute; top: -40px; left: 50%; transform: translateX(-50%); width: 300px; height: 200px; background: linear-gradient(180deg, transparent, rgba(211,47,47,0.1)); filter: blur(60px); pointer-events: none; }
    .footer h3 { color: #faf7f7; font-size: 18px; font-weight: 900; margin: 0 0 8px; font-family: 'Fraunces', serif; letter-spacing: -0.04em; }
    .footer p { color: #888; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.2em; margin: 0; }
    .footer-links { margin: 16px 0; }
    .footer-links a { color: #ff6b6b; text-decoration: none; font-weight: 700; font-size: 12px; margin: 0 8px; transition: color 0.3s ease; }
    .footer-links a:hover { color: #ff8a80; }
    .footer-text { color: #666; font-size: 9px; margin: 16px 0 0; line-height: 1.6; }
    .divider { height: 1.5px; background: linear-gradient(90deg, transparent, rgba(211,47,47,0.2), transparent); margin: 24px 0; }
    
    @media (max-width: 600px) {
      .container { padding: 12px; }
      .wrapper { border-radius: 24px; }
      .header { padding: 40px 24px; }
      .content { padding: 32px 24px; }
      .footer { padding: 28px 24px; }
      .header h1 { font-size: 26px; }
      h2 { font-size: 22px; }
      .text { font-size: 14px; }
      .cta-button { padding: 14px 36px; font-size: 14px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="wrapper">
      <div class="header">
        <div class="particles">
          <div class="particle" style="width: 10px; height: 10px; top: 15%; left: 12%; animation-delay: 0s;"></div>
          <div class="particle" style="width: 8px; height: 8px; top: 45%; right: 18%; animation-delay: 1.2s;"></div>
          <div class="particle" style="width: 12px; height: 12px; bottom: 20%; left: 22%; animation-delay: 2.4s;"></div>
          <div class="particle" style="width: 7px; height: 7px; top: 65%; right: 12%; animation-delay: 1.8s;"></div>
          <div class="particle" style="width: 9px; height: 9px; bottom: 35%; right: 25%; animation-delay: 0.6s;"></div>
        </div>
        <span class="logo">🩸</span>
        <h1>BloodConnect</h1>
        <p>Account Security Protocol</p>
      </div>

      <div class="content">
        <div class="section">
          <span class="badge">Password Reset Request</span>
          <h2>Secure Your Account</h2>
          <p class="subtitle">Create a new password for enhanced protection</p>
        </div>

        <div class="section">
          <p class="text">We received a request to reset your BloodConnect password. This ensures your account remains protected. Click the button below to create a new, secure password.</p>
        </div>

        <div class="section">
          <div class="alert">
            <span class="alert-icon">⏱</span>
            <div class="alert-text">
              <h3>Link Expires in 1 Hour</h3>
              <p>Your reset link is valid for the next 60 minutes. After expiration, request a new password reset link.</p>
            </div>
          </div>
        </div>

        <div class="section">
          <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #6e2016 0%, #991b1b 100%); color: #ffffff; padding: 16px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 24px auto; border: none; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;">Reset Your Password</a>
        </div>

        <div class="section">
          <div class="link-box">
            <span class="link-label">Or copy this link directly:</span>
            <div class="link-text">${resetLink}</div>
          </div>
        </div>

        <div class="section">
          <h3>Didn't Request This?</h3>
          <p>If you did not initiate this password reset, ignore this email or contact our support team immediately. Your security is our top priority.</p>
        </div>
      </div>

      <div class="footer">
        <h1 style="color: #faf7f7; font-size: 20px; margin: 0 0 8px; font-family: 'Fraunces', serif;">BloodConnect</h1>
        <p>Smart Donor Matching System</p>
        <div class="footer-links">
          <a href="${API}">Website</a>
          <span style="color: #666;">•</span>
          <a href="${API}/support">Support</a>
          <span style="color: #666;">•</span>
          <a href="${API}/security">Security</a>
        </div>
        <div class="footer-text">
          <p style="margin: 0;">© 2026 BloodConnect. All rights reserved.</p>
          <p style="margin: 4px 0 0;">Secure • Trusted • Life-Saving</p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
              })
            });

            const data = await result.json();
            console.log('✅ Email sent successfully');
            res.json({ message: 'Password reset link sent to your email.' });
          } catch (err) {
            console.error('❌ Email send error:', err.message);
            res.status(500).json({ message: 'Failed to send reset email', error: err.message });
          }
        });
    });
  });
});

router.post('/reset', (req, res) => {
  const { token, new_password } = req.body;

  if (!token || !new_password) {
    return res.status(400).json({ message: 'Token and password are required' });
  }

  db.query('SELECT * FROM password_resets WHERE token = ?', [token], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(400).json({ message: 'Invalid or expired reset link.' });

    const reset = results[0];
    if (new Date() > new Date(reset.expires_at)) {
      return res.status(400).json({ message: 'Reset link has expired. Please request a new one.' });
    }

    try {
      // ✅ SHA2 hashing instead of bcrypt
      const hashed = crypto.createHash('sha256').update(new_password).digest('hex');
      db.query('UPDATE donors SET password = ? WHERE email = ?', [hashed, reset.email], (err) => {
        if (err) return res.status(500).json({ message: err.message });
        db.query('DELETE FROM password_resets WHERE token = ?', [token], () => {
          console.log(`✅ Password reset successfully for: ${reset.email}`);
          res.json({ message: 'Password reset successfully! You can now login.' });
        });
      });
    } catch (err) {
      console.error('❌ Password hash error:', err.message);
      res.status(500).json({ message: 'Failed to reset password', error: err.message });
    }
  });
});

router.post('/change-password', (req, res) => {
  const { userId, userType, currentPassword, newPassword } = req.body;

  if (!userId || !userType || !currentPassword || !newPassword) {
    return res.status(400).json({ message: 'User ID, type, current password, and new password are required' });
  }

  try {
    let table = 'donors';
    if (userType === 'admin') table = 'admins';
    if (userType === 'hospital') table = 'hospitals';

    console.log(`[change-password] Changing password for ${userType} ID: ${userId}`);

    db.query(`SELECT password FROM ${table} WHERE id = ?`, [userId], (err, results) => {
      if (err) {
        console.error('[change-password] ❌ Database error:', err);
        return res.status(500).json({ message: err.message });
      }

      if (results.length === 0) {
        console.log(`[change-password] ⚠️ User not found: ${userId}`);
        return res.status(404).json({ message: `${userType} not found` });
      }

      const user = results[0];
      // ✅ SHA2 hashing instead of bcrypt
      const currentPasswordHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
      
      console.log('[change-password] Current hash:', currentPasswordHash);
      console.log('[change-password] Stored hash:', user.password);
      
      if (currentPasswordHash !== user.password) {
        console.log(`[change-password] ❌ Incorrect current password for ${userType} ${userId}`);
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      try {
        const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

        db.query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedPassword, userId], (err) => {
          if (err) {
            console.error('[change-password] ❌ Update error:', err);
            return res.status(500).json({ message: err.message });
          }

          console.log(`[change-password] ✅ Password changed successfully for ${userType} ${userId}`);
          res.json({ 
            success: true, 
            message: 'Password changed successfully!' 
          });
        });
      } catch (hashErr) {
        console.error('[change-password] ❌ Hash error:', hashErr.message);
        res.status(500).json({ message: 'Failed to hash password', error: hashErr.message });
      }
    });
  } catch (error) {
    console.error('[change-password] ❌ Server error:', error.message);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;