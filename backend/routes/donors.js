const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');

router.post('/register', (req, res) => {
  const { full_name, email, password, phone, blood_type, date_of_birth, gender, address } = req.body;

  const today = new Date();
  const dob = new Date(date_of_birth);
  let age = today.getFullYear() - dob.getFullYear();
  if (age < 18) {
    return res.status(400).json({ message: 'You must be at least 18 years old to donate' });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = `INSERT INTO donors (full_name, email, password, phone, blood_type, date_of_birth, gender, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [full_name, email, hashedPassword, phone, blood_type, date_of_birth, gender, address], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Registration failed', error: err.message });
    }
    res.status(201).json({ message: 'Donor registered successfully', id: result.insertId });
  });
});

const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = `SELECT * FROM donors WHERE email = ?`;

  db.query(sql, [email], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Login failed', error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const donor = results[0];
    const isMatch = bcrypt.compareSync(password, donor.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }

    const token = jwt.sign(
      { id: donor.id, email: donor.email },
      process.env.JWT_SECRET || 'bloodbank_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      donor: {
        id: donor.id,
        full_name: donor.full_name,
        email: donor.email,
        blood_type: donor.blood_type
      }
    });
  });
});
router.get('/all', (req, res) => {
  db.query('SELECT id, full_name, email, blood_type, is_eligible FROM donors', (err, results) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(results)
  })
})

router.delete('/:id', (req, res) => {
  db.query('DELETE FROM donors WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json({ message: 'Donor deleted' })
  })
})
router.put('/change-password', async (req, res) => {
  const { donor_id, old_password, new_password } = req.body;
  const bcrypt = require('bcryptjs');

  db.query('SELECT * FROM donors WHERE id = ?', [donor_id], async (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    if (results.length === 0) return res.status(404).json({ message: 'Donor not found' });

    const match = bcrypt.compareSync(old_password, results[0].password);
    if (!match) return res.status(401).json({ message: 'Old password is incorrect' });

    const hashed = bcrypt.hashSync(new_password, 10);
    db.query('UPDATE donors SET password = ? WHERE id = ?', [hashed, donor_id], (err) => {
      if (err) return res.status(500).json({ message: err.message });
      res.json({ message: 'Password changed successfully' });
    });
  });
});
module.exports = router;