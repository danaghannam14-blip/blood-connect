const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/create', (req, res) => {
  const { hospital_id, blood_type, quantity_needed } = req.body;

  const sql = `INSERT INTO donation_requests (hospital_id, blood_type, quantity_needed) VALUES (?, ?, ?)`;

  db.query(sql, [hospital_id, blood_type, quantity_needed], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to create request', error: err.message });
    }
    res.status(201).json({ message: 'Blood request created successfully', id: result.insertId });
  });
});

router.get('/all', (req, res) => {
  const sql = `
    SELECT dr.*, h.name as hospital_name, h.address as hospital_address 
    FROM donation_requests dr
    JOIN hospitals h ON dr.hospital_id = h.id
    ORDER BY dr.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to get requests', error: err.message });
    }
    res.json(results);
  });
});

router.put('/update/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE donation_requests SET status = ? WHERE id = ?`;

  db.query(sql, [status, id], (err) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to update request', error: err.message });
    }
    res.json({ message: 'Request updated successfully' });
  });
});

module.exports = router;