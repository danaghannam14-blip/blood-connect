const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

router.post('/register', (req, res) => {
  const { name, email, password, phone, address } = req.body;

  if (!email.endsWith('@hospital.com')) {
    return res.status(400).json({ message: 'Hospital email must end with @hospital.com' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const sql = `INSERT INTO hospitals (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)`;

  db.query(sql, [name, email, hashedPassword, phone, address], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Registration failed', error: err.message });
    }
    res.status(201).json({ message: 'Hospital registered successfully', id: result.insertId });
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email.endsWith('@hospital.com')) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const sql = `SELECT * FROM hospitals WHERE email = ?`;

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Login failed', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Hospital not found' });
    }

    const hospital = results[0];
    const isMatch = bcrypt.compareSync(password, hospital.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: hospital.id, email: hospital.email },
      process.env.JWT_SECRET || 'bloodbank_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      hospital: {
        id: hospital.id,
        name: hospital.name,
        email: hospital.email
      }
    });
  });
});

router.get('/all', (req, res) => {
  const sql = `SELECT id, name, address, latitude, longitude FROM hospitals`;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to get hospitals', error: err.message });
    }
    res.json(results);
  });
});
router.put('/change-password', async (req, res) => {
  const { hospital_id, old_password, new_password } = req.body;
  const bcrypt = require('bcryptjs');

  db.query('SELECT * FROM hospitals WHERE id = ?', [hospital_id], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Hospital not found' });

    const match = bcrypt.compareSync(old_password, results[0].password);
    if (!match) return res.status(401).json({ message: 'Old password is incorrect' });

    const hashed = bcrypt.hashSync(new_password, 10);
    db.query('UPDATE hospitals SET password = ? WHERE id = ?', [hashed, hospital_id], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Password changed successfully' });
    });
  });
});
// Get blood stock for a hospital
router.get('/stock/:hospital_id', (req, res) => {
  db.query(
    'SELECT blood_type, units_available FROM blood_stock WHERE hospital_id = ? ORDER BY blood_type',
    [req.params.hospital_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
})

// Update blood stock
router.put('/stock/:hospital_id', (req, res) => {
  const { blood_type, units_available } = req.body
  db.query(
    'INSERT INTO blood_stock (hospital_id, blood_type, units_available) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE units_available = ?',
    [req.params.hospital_id, blood_type, units_available, units_available],
    (err) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json({ message: 'Stock updated' })
    }
  )
})

// Get all hospitals with their blood stock
router.get('/with-stock', (req, res) => {
  const sql = `
    SELECT h.id, h.name, h.address, h.latitude, h.longitude,
           bs.blood_type, bs.units_available
    FROM hospitals h
    LEFT JOIN blood_stock bs ON h.id = bs.hospital_id
    WHERE h.latitude IS NOT NULL AND h.longitude IS NOT NULL
    ORDER BY h.name, bs.blood_type
  `
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: err.message })

    // Group by hospital
    const hospitalMap = {}
   router.get('/with-stock', (req, res) => {
  const sql = `
    SELECT h.id, h.name, h.address, h.latitude, h.longitude,
           bs.blood_type, bs.units_available
    FROM hospitals h
    LEFT JOIN blood_stock bs ON h.id = bs.hospital_id
    WHERE h.latitude IS NOT NULL AND h.longitude IS NOT NULL
    ORDER BY h.name, bs.blood_type
  `
  db.query(sql, (err, results) => {
    if (err) {
      console.error('with-stock error:', err.message)
      return res.status(500).json({ message: err.message })
    }
    if (!results || results.length === 0) {
      return res.json([])
    }
    const hospitalMap = {}
    results.forEach(row => {
      if (!hospitalMap[row.id]) {
        hospitalMap[row.id] = {
          id: row.id,
          name: row.name,
          address: row.address,
          latitude: row.latitude,
          longitude: row.longitude,
          blood_stock: {}
        }
      }
      if (row.blood_type) {
        hospitalMap[row.id].blood_stock[row.blood_type] = row.units_available || 0
      }
    })
    res.json(Object.values(hospitalMap))
  })
})
module.exports = router;