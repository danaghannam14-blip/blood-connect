const express = require('express')
const router = express.Router()
const db = require('../db')

const sendReminderEmail = async (donor, hospital, appointment) => {
  const appointmentTime = appointment.appointment_time
  const appointmentDate = new Date(appointment.appointment_date).toLocaleDateString('en-GB')

  await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': process.env.BREVO_API_KEY,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
      to: [{ email: donor.email, name: donor.full_name }],
      subject: '🩸 Did you donate? Confirm your donation on BloodConnect!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #dc2626; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">🩸 BloodConnect</h1>
          </div>
          <div style="padding: 30px; background: #fff;">
            <h2 style="color: #dc2626;">Did you donate today?</h2>
            <p>Dear ${donor.full_name},</p>
            <p>You had an appointment at <strong>${hospital.name}</strong> today at <strong>${appointmentTime}</strong>.</p>
            <p>If you donated, please confirm it on your dashboard so we can update the blood inventory and track your impact!</p>
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
              <p style="margin: 0;"><strong>Hospital:</strong> ${hospital.name}</p>
              <p style="margin: 8px 0 0;"><strong>Date:</strong> ${appointmentDate}</p>
              <p style="margin: 8px 0 0;"><strong>Time:</strong> ${appointmentTime}</p>
            </div>
            <a href="https://bloodconnect-lb.vercel.app/donor/dashboard"
               style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 10px;">
              Confirm My Donation
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

  // Check for overlap
  db.query(
    'SELECT id FROM appointments WHERE hospital_id = ? AND appointment_date = ? AND appointment_time = ? AND status = "scheduled"',
    [hospital_id, appointment_date, appointment_time],
    (err, existing) => {
      if (err) return res.status(500).json({ message: err.message })
      if (existing.length > 0) {
        return res.status(400).json({ message: 'This time slot is already booked. Please choose another time.' })
      }

      // Check donor doesn't already have appointment at same date/time
      db.query(
        'SELECT id FROM appointments WHERE donor_id = ? AND appointment_date = ? AND status = "scheduled"',
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

              // Schedule reminder email — send after 30 minutes
              const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`)
              const reminderTime = appointmentDateTime.getTime() + 30 * 60 * 1000
              const delay = reminderTime - Date.now()

              if (delay > 0) {
                setTimeout(async () => {
                  db.query(
                    `SELECT d.full_name, d.email, h.name, a.appointment_date, a.appointment_time
                     FROM appointments a
                     JOIN donors d ON a.donor_id = d.id
                     JOIN hospitals h ON a.hospital_id = h.id
                     WHERE a.id = ? AND a.status = 'scheduled' AND a.reminder_sent = 0`,
                    [result.insertId],
                    async (err4, rows) => {
                      if (err4 || rows.length === 0) return
                      const row = rows[0]
                      try {
                        await sendReminderEmail(
                          { full_name: row.full_name, email: row.email },
                          { name: row.name },
                          { appointment_date: row.appointment_date, appointment_time: row.appointment_time }
                        )
                        db.query('UPDATE appointments SET reminder_sent = 1 WHERE id = ?', [result.insertId])
                        console.log(`Reminder sent to ${row.email}`)
                      } catch (e) {
                        console.error('Reminder email error:', e.message)
                      }
                    }
                  )
                }, delay)
              }

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
    'SELECT appointment_time FROM appointments WHERE hospital_id = ? AND appointment_date = ? AND status = "scheduled"',
    [req.params.hospital_id, req.params.date],
    (err, results) => {
      if (err) return res.status(500).json({ message: err.message })
      res.json(results.map(r => r.appointment_time))
    }
  )
})

// Cancel appointment
router.put('/cancel/:id', (req, res) => {
  db.query('UPDATE appointments SET status = "cancelled" WHERE id = ?', [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: err.message })
    res.json({ message: 'Appointment cancelled' })
  })
})

module.exports = router