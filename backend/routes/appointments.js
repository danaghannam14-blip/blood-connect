const express = require('express')
const router = express.Router()
const db = require('../db')

const sendThankYouEmail = async (donorName, donorEmail, hospitalName) => {
  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
      to: [{ email: donorEmail, name: donorName }],
      subject: '🩸 Thank You for Your Donation!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🩸 BloodConnect</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #dc2626;">Thank You for Donating! 🦸</h2>
            <p>Dear ${donorName},</p>
            <p><strong>${hospitalName}</strong> has confirmed your blood donation. You are a hero!</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 8px; text-align: center;">
              <p style="margin: 0; font-size: 20px;">❤️ Your donation may save up to <strong>3 lives</strong></p>
            </div>
            <p>Here's how to recover well:</p>
            <ul>
              <li>💧 Drink extra water today</li>
              <li>🥩 Eat iron-rich foods (spinach, red meat, lentils)</li>
              <li>😴 Get a full night's sleep</li>
              <li>🚫 Skip intense workouts for 24 hours</li>
            </ul>
            <p>You can donate again in <strong>56 days</strong>. We'll be counting on you!</p>
            <a href="https://bloodconnect-lb.vercel.app/donor/dashboard"
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
              View Your Dashboard
            </a>
            <p style="color: #666; margin-top: 20px; font-size: 14px;">
              Every drop counts. Thank you for being a BloodConnect donor.
            </p>
          </div>
          <div style="background: #111; padding: 15px; text-align: center;">
            <p style="color: #666; margin: 0; font-size: 12px;">© 2026 BloodConnect. Smart Donor Matching System.</p>
          </div>
        </div>
      `
    })
  })
}

// Book appointment
router.post('/book', (req, res) => {
  const { donor_id, hospital_id, appointment_date, appointment_time } = req.body

  db.query(
    'SELECT id FROM appointments WHERE hospital_id = ? AND appointment_date = ? AND appointment_time = ? AND status = \'scheduled\'',
    [hospital_id, appointment_date, appointment_time],
    (err, existing) => {
      if (err) return res.status(500).json({ message: err.message })
      if (existing.length > 0) {
        return res.status(400).json({ message: 'This time slot is already booked. Please choose another time.' })
      }

      db.query(
        'SELECT id FROM appointments WHERE donor_id = ? AND appointment_date = ? AND status = \'scheduled\'',
        [donor_id, appointment_date],
        (err2, donorExisting) => {
          if (err2) return res.status(500).json({ message: err2.message })
          if (donorExisting.length > 0) {
            return res.status(400).json({ message: 'You already have an appointment on this date.' })
          }

          db.query(
            'INSERT INTO appointments (donor_id, hospital_id, appointment_date, appointment_time) VALUES (?, ?, ?, ?)',
            [donor_id, hospital_id, appointment_date, appointment_time],
            (err3, result) => {
              if (err3) return res.status(500).json({ message: err3.message })
              res.json({ message: 'Appointment booked successfully!', id: result.insertId })
            }
          )
        }
      )
    }
  )
})

// Get donor appointments
router.get('/donor/:donor_id', (req, res) => {
  const sql = `
    SELECT a.*, h.name as hospital_name, h.address as hospital_address
    FROM appointments a
    JOIN hospitals h ON a.hospital_id = h.id
    WHERE a.donor_id = ?
    ORDER BY a.appointment_date DESC, a.appointment_time DESC
  `
  db.query(sql, [req.params.donor_id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(results)
  })
})

// Get booked slots for a hospital on a date
router.get('/slots/:hospital_id/:date', (req, res) => {
  db.query(
    'SELECT appointment_time FROM appointments WHERE hospital_id = ? AND appointment_date = ? AND status = \'scheduled\'',
    [req.params.hospital_id, req.params.date],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results.map(r => r.appointment_time))
    }
  )
})

// Cancel appointment
router.put('/cancel/:id', (req, res) => {
  db.query('UPDATE appointments SET status = \'cancelled\' WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json({ message: 'Appointment cancelled' })
  })
})

// Hospital confirms donation
router.put('/confirm/:id', (req, res) => {
  db.query(
    `SELECT a.*, d.id as donor_id, d.full_name as donor_name, d.email as donor_email,
            h.name as hospital_name
     FROM appointments a
     JOIN donors d ON a.donor_id = d.id
     JOIN hospitals h ON a.hospital_id = h.id
     WHERE a.id = ?`,
    [req.params.id],
    (err, rows) => {
      if (err || rows.length === 0) return res.status(500).json({ message: err?.message || 'Not found' })
      const appointment = rows[0]

      db.query('UPDATE appointments SET status = \'completed\' WHERE id = ?', [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: err.message })

        db.query('UPDATE donors SET last_donation_date = CURDATE() WHERE id = ?', [appointment.donor_id], () => {})

        db.query(
          'INSERT INTO donation_history (donor_id, hospital_id, blood_type) VALUES (?, ?, ?)',
          [appointment.donor_id, appointment.hospital_id, appointment.blood_type || 'Unknown'],
          () => {}
        )

        // Increment blood stock
        db.query(
          'INSERT INTO blood_stock (hospital_id, blood_type, units_available) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE units_available = units_available + 1',
          [appointment.hospital_id, appointment.blood_type || 'O+'],
          () => {}
        )
// Mark notification as donated
db.query(
  'UPDATE notifications SET donated = 1 WHERE donor_id = ? AND hospital_id = ?',
  [appointment.donor_id, appointment.hospital_id],
  () => {}
)
        // Send thank you email
        sendThankYouEmail(appointment.donor_name, appointment.donor_email, appointment.hospital_name)
          .then(() => console.log(`Thank you email sent to ${appointment.donor_email}`))
          .catch(e => console.error('Thank you email error:', e.message))

        res.json({ message: 'Donation confirmed successfully' })
      })
    }
  )
})

// Mark appointment as missed
router.put('/missed/:id', (req, res) => {
  db.query('UPDATE appointments SET status = \'missed\' WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json({ message: 'Appointment marked as missed' })
  })
})

// Get appointments for a hospital
router.get('/hospital/:hospital_id', (req, res) => {
  const sql = `
    SELECT a.*, d.full_name as donor_name, d.blood_type as donor_blood_type, d.phone as donor_phone
    FROM appointments a
    JOIN donors d ON a.donor_id = d.id
    WHERE a.hospital_id = ? AND a.status = 'scheduled'
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
  `
  db.query(sql, [req.params.hospital_id], (err, results) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json(results)
  })
})

module.exports = router