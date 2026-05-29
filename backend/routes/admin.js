const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// ✅ FIXED: Use SHA2 instead of bcrypt to match database hashes
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith('@bloodconnect.com')) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  db.query('SELECT * FROM admins WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const admin = results[0];
    // ✅ Hash incoming password with SHA2-256 (same as database)
    const incomingHash = crypto.createHash('sha256').update(password).digest('hex');
    
    console.log('[Admin Login]', email, '- Hash match:', incomingHash === admin.password);
    
    if (incomingHash !== admin.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', admin: { id: admin.id, username: admin.username, email: admin.email } });
  });
});

router.post('/add-admin', (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith('@bloodconnect.com')) {
    return res.status(400).json({ message: 'Admin email must end with @bloodconnect.com' });
  }

  const username = email.split('@')[0];
  // ✅ Hash password with SHA2-256 (same as database)
  const hashed = crypto.createHash('sha256').update(password).digest('hex');

  db.query('INSERT INTO admins (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashed], (err) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'An admin with this email already exists. Please choose a different email.' });
        }
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: 'Admin added successfully' });
    });
});

router.get('/admins', (req, res) => {
  db.query('SELECT id, username, email, created_at FROM admins', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

router.delete('/admins/:id', (req, res) => {
  db.query('DELETE FROM admins WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Admin deleted' });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ CHANGE PASSWORD - For logged-in users (Admin, Hospital, Donors)
// ════════════════════════════════════════════════════════════════════════════
router.put('/change-password', (req, res) => {
  const { userId, userType, currentPassword, newPassword } = req.body;

  // ✅ VALIDATE ALL REQUIRED FIELDS
  if (!userId || !userType || !currentPassword || !newPassword) {
    console.log('[change-password] ❌ Missing required fields:', { userId, userType, currentPassword: !!currentPassword, newPassword: !!newPassword });
    return res.status(400).json({ message: 'User ID, type, current password, and new password are required' });
  }

  // ✅ VALIDATE PASSWORD LENGTH
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters long' });
  }

  try {
    // ✅ DETERMINE WHICH TABLE BASED ON USER TYPE
    let table = 'donors'; // default
    if (userType === 'admin') table = 'admins';
    if (userType === 'hospital') table = 'hospitals';

    console.log(`[change-password] Changing password for ${userType} ID: ${userId}`);

    // ✅ GET USER FROM DATABASE
    db.query(`SELECT password FROM ${table} WHERE id = ?`, [userId], (err, results) => {
      if (err) {
        console.error('[change-password] ❌ Database error:', err);
        return res.status(500).json({ message: err.message });
      }

      if (!results || results.length === 0) {
        console.log(`[change-password] ⚠️ ${userType} not found with ID: ${userId}`);
        return res.status(404).json({ message: `${userType} not found` });
      }

      const user = results[0];

      // ✅ VERIFY CURRENT PASSWORD
      try {
        // ✅ Hash incoming password with SHA2-256
        const currentPasswordHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
        
        if (currentPasswordHash !== user.password) {
          console.log(`[change-password] ❌ Incorrect current password for ${userType} ${userId}`);
          return res.status(401).json({ message: 'Current password is incorrect' });
        }
      } catch (compareErr) {
        console.error('[change-password] ❌ Password comparison error:', compareErr);
        return res.status(500).json({ message: 'Failed to verify password' });
      }

      // ✅ HASH NEW PASSWORD WITH SHA2-256
      try {
        const hashedPassword = crypto.createHash('sha256').update(newPassword).digest('hex');

        // ✅ UPDATE PASSWORD IN DATABASE
        db.query(`UPDATE ${table} SET password = ? WHERE id = ?`, [hashedPassword, userId], (updateErr) => {
          if (updateErr) {
            console.error('[change-password] ❌ Update error:', updateErr);
            return res.status(500).json({ message: updateErr.message });
          }

          console.log(`[change-password] ✅ Password changed successfully for ${userType} ${userId}`);
          res.json({ 
            success: true, 
            message: 'Password changed successfully!' 
          });
        });
      } catch (hashErr) {
        console.error('[change-password] ❌ Hash error:', hashErr);
        return res.status(500).json({ message: 'Failed to hash password' });
      }
    });
  } catch (error) {
    console.error('[change-password] ❌ Server error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/donors', (req, res) => {
  db.query('SELECT * FROM donors ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error('[admin.js] Donors query error:', err);
      return res.status(500).json({ message: err.message });
    }
    res.json(results);
  });
});

router.get('/hospitals', (req, res) => {
  db.query('SELECT id, name, email, address FROM hospitals ORDER BY name ASC', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

router.get('/requests', (req, res) => {
  const sql = `
    SELECT br.*, h.name as hospital_name 
    FROM blood_requests br
    JOIN hospitals h ON br.hospital_id = h.id
    ORDER BY br.created_at DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

router.delete('/requests/:id', (req, res) => {
  db.query('DELETE FROM blood_requests WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Request deleted' });
  });
});

router.post('/add-hospital', (req, res) => {
  const { name, email, password, address, latitude, longitude } = req.body;

  if (!email.endsWith('@hospital.com')) {
    return res.status(400).json({ message: 'Hospital email must end with @hospital.com' });
  }

  // ✅ Hash password with SHA2-256
  const hashed = crypto.createHash('sha256').update(password).digest('hex');
  
  db.query(
    'INSERT INTO hospitals (name, email, password, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?)',
    [name, email, hashed, address, latitude, longitude],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ message: 'A hospital with this email already exists.' });
        }
        return res.status(500).json({ message: err.message });
      }
      res.json({ message: 'Hospital added successfully', id: result.insertId });
    }
  );
});

router.delete('/hospitals/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM notifications WHERE hospital_id = ?', [id], () => {
    db.query('DELETE FROM blood_requests WHERE hospital_id = ?', [id], () => {
      db.query('DELETE FROM blood_inventory WHERE hospital_id = ?', [id], () => {
        db.query('DELETE FROM hospitals WHERE id = ?', [id], (err) => {
          if (err) return res.status(500).json({ message: err.message });
          res.json({ message: 'Hospital deleted' });
        });
      });
    });
  });
});

router.put('/hospitals/:id', (req, res) => {
  const { name, email, address } = req.body;
  db.query(
    'UPDATE hospitals SET name = ?, email = ?, address = ? WHERE id = ?',
    [name, email, address, req.params.id],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Hospital updated successfully' });
    }
  );
});

// Temp fix endpoint: Update donor governorate
router.put('/fix-donor-governorate/:donorId', (req, res) => {
  const { governorate, first_name, last_name } = req.body;
  db.query(
    'UPDATE donors SET governorate = ?, first_name = ?, last_name = ? WHERE id = ?',
    [governorate, first_name, last_name, req.params.donorId],
    (err, result) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Donor updated successfully', affectedRows: result.affectedRows });
    }
  );
});

module.exports = router;