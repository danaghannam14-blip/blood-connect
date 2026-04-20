const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/verify', async (req, res) => {
  const { donor_id, date_of_birth } = req.body;

  const today = new Date();
  const dob = new Date(date_of_birth);
  const age = today.getFullYear() - dob.getFullYear();

  if (age < 18) {
    return res.status(400).json({ eligible: false, message: 'Donor is under 18 years old' });
  }

  const sql = `UPDATE donors SET is_verified = TRUE WHERE id = ?`;
  db.query(sql, [donor_id], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Verification failed', error: err.message });
    }
    res.json({ eligible: true, message: 'Donor age verified successfully', age });
  });
});

module.exports = router;