const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/:hospital_id', (req, res) => {
  const { hospital_id } = req.params;

  const sql = `SELECT * FROM blood_inventory WHERE hospital_id = ?`;

  db.query(sql, [hospital_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed to get inventory', error: err.message });
    }
    res.json(results);
  });
});

router.post('/update', (req, res) => {
  const { hospital_id, blood_type, quantity } = req.body;

  const checkSql = `SELECT * FROM blood_inventory WHERE hospital_id = ? AND blood_type = ?`;

  db.query(checkSql, [hospital_id, blood_type], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Failed', error: err.message });
    }

    if (results.length > 0) {
      const updateSql = `UPDATE blood_inventory SET quantity = ? WHERE hospital_id = ? AND blood_type = ?`;
      db.query(updateSql, [quantity, hospital_id, blood_type], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Update failed', error: err.message });
        }
        res.json({ message: 'Inventory updated successfully' });
      });
    } else {
      const insertSql = `INSERT INTO blood_inventory (hospital_id, blood_type, quantity) VALUES (?, ?, ?)`;
      db.query(insertSql, [hospital_id, blood_type, quantity], (err) => {
        if (err) {
          return res.status(500).json({ message: 'Insert failed', error: err.message });
        }
        res.json({ message: 'Inventory added successfully' });
      });
    }
  });
});

module.exports = router;