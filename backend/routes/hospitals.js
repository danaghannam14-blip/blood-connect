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
  db.query(
    'INSERT INTO hospitals (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)',
    [name, email, hashedPassword, phone, address],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Registration failed', error: err.message });
      res.status(201).json({ message: 'Hospital registered successfully', id: result.insertId });
    }
  );
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email.endsWith('@hospital.com')) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  db.query('SELECT * FROM hospitals WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Login failed', error: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Hospital not found' });
    const hospital = results[0];
    if (!bcrypt.compareSync(password, hospital.password)) {
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
      hospital: { id: hospital.id, name: hospital.name, email: hospital.email }
    });
  });
});

router.get('/all', (req, res) => {
  db.query('SELECT id, name, address, governorate, latitude, longitude FROM hospitals', (err, results) => {
    if (err) return res.status(500).json({ message: 'Failed to get hospitals', error: err.message });
    res.json(results);
  });
});

router.put('/change-password', (req, res) => {
  const { hospital_id, old_password, new_password } = req.body;
  db.query('SELECT * FROM hospitals WHERE id = ?', [hospital_id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Hospital not found' });
    if (!bcrypt.compareSync(old_password, results[0].password)) {
      return res.status(401).json({ message: 'Old password is incorrect' });
    }
    const hashed = bcrypt.hashSync(new_password, 10);
    db.query('UPDATE hospitals SET password = ? WHERE id = ?', [hashed, hospital_id], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Password changed successfully' });
    });
  });
});

router.get('/stock/:hospital_id', (req, res) => {
  db.query(
    'SELECT blood_type, units_available FROM blood_stock WHERE hospital_id = ? ORDER BY blood_type',
    [req.params.hospital_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json(results);
    }
  );
});

router.put('/stock/:hospital_id', (req, res) => {
  const { blood_type, units_available } = req.body;
  db.query(
    'INSERT INTO blood_stock (hospital_id, blood_type, units_available) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE units_available = ?',
    [req.params.hospital_id, blood_type, units_available, units_available],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Stock updated' });
    }
  );
});

router.get('/with-stock', (req, res) => {
  const sql = `
    SELECT h.id, h.name, h.address, h.latitude, h.longitude,
           bs.blood_type, bs.units_available
    FROM hospitals h
    LEFT JOIN blood_stock bs ON h.id = bs.hospital_id
    WHERE h.latitude IS NOT NULL AND h.longitude IS NOT NULL
    ORDER BY h.name, bs.blood_type
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error('with-stock error:', err.message);
      return res.status(500).json({ message: err.message });
    }
    if (!results || results.length === 0) return res.json([]);
    const hospitalMap = {};
    results.forEach(row => {
      if (!hospitalMap[row.id]) {
        hospitalMap[row.id] = {
          id: row.id,
          name: row.name,
          address: row.address,
          latitude: row.latitude,
          longitude: row.longitude,
          blood_stock: {}
        };
      }
      if (row.blood_type) {
        hospitalMap[row.id].blood_stock[row.blood_type] = row.units_available || 0;
      }
    });
    res.json(Object.values(hospitalMap));
  });
});
// Record blood transfusion (decrease stock)
router.post('/transfusion/:hospital_id', (req, res) => {
  const { blood_type, units, notes } = req.body
  const hospital_id = req.params.hospital_id

  // Check current stock
  db.query(
    'SELECT units_available FROM blood_stock WHERE hospital_id = ? AND blood_type = ?',
    [hospital_id, blood_type],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      if (results.length === 0) return res.status(404).json({ message: 'Blood type not found' })

      const current = results[0].units_available
      if (current < units) {
        return res.status(400).json({ message: `Not enough stock. Only ${current} units available.` })
      }

      // Decrease stock
      db.query(
        'UPDATE blood_stock SET units_available = units_available - ? WHERE hospital_id = ? AND blood_type = ?',
        [units, hospital_id, blood_type],
        (err2) => {
          if (err2) return res.status(500).json({ message: err2.message })

          // Record transfusion
          db.query(
            'INSERT INTO transfusions (hospital_id, blood_type, units, notes) VALUES (?, ?, ?, ?)',
            [hospital_id, blood_type, units, notes || ''],
            (err3) => {
              if (err3) return res.status(500).json({ message: err3.message })
              res.json({ message: 'Transfusion recorded and stock updated', remaining: current - units })
            }
          )
        }
      )
    }
  )
})

// Get transfusion history for a hospital
router.get('/transfusions/:hospital_id', (req, res) => {
  db.query(
    'SELECT * FROM transfusions WHERE hospital_id = ? ORDER BY created_at DESC LIMIT 20',
    [req.params.hospital_id],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results)
    }
  )
})
module.exports = router;