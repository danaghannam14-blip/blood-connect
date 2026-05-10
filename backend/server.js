const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const donorRoutes = require('./routes/donors');
const hospitalRoutes = require('./routes/hospitals');
const inventoryRoutes = require('./routes/inventory');
const requestRoutes = require('./routes/requests');
const chatbotRoutes = require('./routes/chatbot');
const idcheckRoutes = require('./routes/idcheck');
const adminRoutes = require('./routes/admin');
const passwordResetRoutes = require('./routes/passwordreset');
const appointmentRoutes = require('./routes/appointments')
app.use('/api/appointments', appointmentRoutes)
app.use('/api/password', passwordResetRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/idcheck', idcheckRoutes);
app.use('/api/donors', donorRoutes);
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Blood Bank API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
const cron = require('node-cron')

// Run every 5 minutes — check for appointments that ended 30+ min ago and need reminder
cron.schedule('*/5 * * * *', async () => {
  console.log('Cron running at:', new Date().toISOString())
  const sql = `
    SELECT a.id, a.appointment_date, a.appointment_time,
           d.full_name, d.email,
           h.name as hospital_name
    FROM appointments a
    JOIN donors d ON a.donor_id = d.id
    JOIN hospitals h ON a.hospital_id = h.id
    WHERE a.status = 'scheduled'
      AND a.reminder_sent = 0
     AND TIMESTAMP(a.appointment_date, a.appointment_time) <= DATE_ADD(NOW(), INTERVAL 3 HOUR) - INTERVAL 3 MINUTE  `
  const db = require('./db')
  db.query(sql, async (err, rows) => {
    if (err || rows.length === 0) return
    for (const row of rows) {
      try {
        await fetch('https://api.brevo.com/v3/smtp/email',
           {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'api-key': process.env.BREVO_API_KEY,
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
            to: [{ email: row.email, name: row.full_name }],
            subject: '🩸 Did you donate? Confirm on BloodConnect!',
            htmlContent: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #dc2626; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🩸 BloodConnect</h1>
                </div>
                <div style="padding: 30px; background: #fff;">
                  <h2 style="color: #dc2626;">Did you donate today?</h2>
                  <p>Dear ${row.full_name},</p>
                  <p>You had an appointment at <strong>${row.hospital_name}</strong> today.</p>
                  <p>If you donated, please confirm it on your dashboard so we can update the blood inventory and track your impact!</p>
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
        db.query('UPDATE appointments SET reminder_sent = 1 WHERE id = ?', [row.id])
        console.log(`Reminder sent to ${row.email}`)
      } catch (e) {
        console.error('Reminder error:', e.message)
      }
    }
  })
})