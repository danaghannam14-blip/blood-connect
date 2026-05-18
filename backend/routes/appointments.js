router.put('/confirm/:id', (req, res) => {
  db.query(
    `SELECT a.*, d.id as donor_id, d.full_name as donor_name, d.email as donor_email, d.blood_type,
            h.name as hospital_name
     FROM appointments a
     JOIN donors d ON a.donor_id = d.id
     JOIN hospitals h ON a.hospital_id = h.id
     WHERE a.id = ?`,
    [req.params.id],
    (err, rows) => {
      if (err || rows.length === 0) return res.status(500).json({ message: err?.message || 'Not found' })
      const appointment = rows[0]
      const bt = appointment.blood_type
      const hid = appointment.hospital_id

      db.query('UPDATE appointments SET status = \'completed\' WHERE id = ?', [req.params.id], () => {})
      db.query('UPDATE donors SET last_donation_date = CURDATE() WHERE id = ?', [appointment.donor_id], () => {})
      db.query('INSERT INTO donation_history (donor_id, hospital_id, blood_type) VALUES (?, ?, ?)', [appointment.donor_id, hid, bt], () => {})
      db.query('INSERT INTO blood_stock (hospital_id, blood_type, units_available) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE units_available = units_available + 1', [hid, bt], () => {})

      // ✅ THIS SHOULD WORK
      console.log(`🔄 Decreasing request: hospital_id=${hid}, blood_type=${bt}`)
      db.query(
        `UPDATE blood_requests SET quantity_needed = quantity_needed - 1 
         WHERE hospital_id = ? AND blood_type = ? AND status = 'pending'`,
        [hid, bt],
        (err, result) => {
          console.log(`📊 Result: affectedRows=${result?.affectedRows}, err=${err?.message}`)
        }
      )

      db.query('UPDATE notifications SET donated = 1 WHERE donor_id = ? AND hospital_id = ?', [appointment.donor_id, hid], () => {})
      sendThankYouEmail(appointment.donor_name, appointment.donor_email, appointment.hospital_name).catch(e => console.error('Email error:', e.message))

      res.json({ message: 'Donation confirmed successfully' })
    }
  )
})