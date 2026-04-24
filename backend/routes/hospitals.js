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

module.exports = router;