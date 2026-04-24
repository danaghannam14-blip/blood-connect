const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcrypt');

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM admins WHERE username = ?', [username], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

    const admin = results[0];
    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({ message: 'Login successful', admin: { id: admin.id, username: admin.username } });
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

module.exports = router;