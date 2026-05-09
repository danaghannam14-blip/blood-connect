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
router.post('/donate', (req, res) => {
  const { donor_id, hospital_id, blood_type, units } = req.body;
  
  db.query(
    'INSERT INTO donation_history (donor_id, hospital_id, blood_type) VALUES (?, ?, ?)',
    [donor_id, hospital_id, blood_type],
    (err) => {
      if (err) return res.status(500).json({ message: err.message });

      // Find matching pending request and decrease units
      db.query(
        'SELECT id, quantity_needed FROM blood_requests WHERE hospital_id = ? AND blood_type = ? AND status = ? ORDER BY created_at ASC',
        [hospital_id, blood_type, 'pending'],
        (err, requests) => {
          if (err || requests.length === 0) return res.json({ message: 'Donation recorded successfully' });

          const request = requests[0];
          const newQuantity = request.quantity_needed - (units || 1);

          if (newQuantity <= 0) {
            db.query('UPDATE blood_requests SET status = ?, quantity_needed = 0 WHERE id = ?',
              ['fulfilled', request.id], () => {});
          } else {
            db.query('UPDATE blood_requests SET quantity_needed = ? WHERE id = ?',
              [newQuantity, request.id], () => {});
          }

          res.json({ message: 'Donation recorded successfully' });
        }
      );
    }
  );
});

router.get('/history/:donor_id', (req, res) => {
  const sql = `
    SELECT dh.*, h.name as hospital_name, h.address as hospital_address
    FROM donation_history dh
    JOIN hospitals h ON dh.hospital_id = h.id
    WHERE dh.donor_id = ?
    ORDER BY dh.donated_at DESC
  `;
  db.query(sql, [req.params.donor_id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});
router.get('/notifications/:donor_id', (req, res) => {
  const sql = `
    SELECT n.*, h.name as hospital_name, h.address as hospital_address
    FROM notifications n
    JOIN hospitals h ON n.hospital_id = h.id
    WHERE n.donor_id = ?
    ORDER BY n.created_at DESC
  `;
  db.query(sql, [req.params.donor_id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json(results);
  });
});

router.put('/notifications/:id/donated', (req, res) => {
  db.query('UPDATE notifications SET donated = 1 WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message });
    res.json({ message: 'Marked as donated' });
  });
});
module.exports = router;