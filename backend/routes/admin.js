const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith('@bloodconnect.com')) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  db.query('SELECT * FROM admins WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const admin = results[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', admin: { id: admin.id, username: admin.username, email: admin.email } });
  });
});

router.post('/add-admin', async (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith('@bloodconnect.com')) {
    return res.status(400).json({ message: 'Admin email must end with @bloodconnect.com' });
  }

  const username = email.split('@')[0];
  const hashed = await bcrypt.hash(password, 10);

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

router.put('/change-password', async (req, res) => {
  const { email, old_password, new_password } = req.body;

  db.query('SELECT * FROM admins WHERE email = ?', [email], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Admin not found' });

    const admin = results[0];
    const match = await bcrypt.compare(old_password, admin.password);
    if (!match) return res.status(401).json({ message: 'Old password is incorrect' });

    const hashed = await bcrypt.hash(new_password, 10);
    db.query('UPDATE admins SET password = ? WHERE email = ?', [hashed, email], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Password changed successfully' });
    });
  });
});

router.get('/donors', (req, res) => {
  db.query('SELECT id, full_name, email, blood_type, is_eligible, created_at FROM donors ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

router.get('/hospitals', (req, res) => {
  db.query('SELECT id, name, email, address FROM hospitals ORDER BY id DESC', (err, results) => {
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

router.delete('/donors/:id', (req, res) => {
  db.query('DELETE FROM donors WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Donor deleted' });
  });
});

router.delete('/requests/:id', (req, res) => {
  db.query('DELETE FROM blood_requests WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Request deleted' });
  });
});
router.post('/add-hospital', async (req, res) => {
  const { name, email, password, address, latitude, longitude } = req.body;

  if (!email.endsWith('@hospital.com')) {
    return res.status(400).json({ message: 'Hospital email must end with @hospital.com' });
  }

  const hashed = await bcrypt.hash(password, 10);
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
  db.query('DELETE FROM hospitals WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Hospital deleted' });
  });
});

module.exports = router;