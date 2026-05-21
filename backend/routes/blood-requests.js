const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

// Get compatible donors for a blood type
const getCompatibleDonors = (bloodType) => {
  const compatibility = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']
  };
  return compatibility[bloodType] || [];
};

// Send email notification to donors
const sendDonorNotification = async (donor, bloodType, patientEmail, governorate) => {
  try {
    const emailContent = `
      <h2>🩸 Emergency Blood Request</h2>
      <p>An emergency blood donation is needed!</p>
      <p><strong>Blood Type Needed:</strong> ${bloodType}</p>
      <p><strong>Location:</strong> ${governorate}</p>
      <p><strong>Patient Contact:</strong> ${patientEmail}</p>
      <p>Please respond as soon as possible if you can donate.</p>
      <p>Login to your account to confirm your donation location.</p>
    `;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: donor.email, name: donor.full_name }],
      sender: { email: 'noreply@bloodconnect.com', name: 'BloodConnect' },
      subject: `🩸 URGENT: ${bloodType} Blood Type Needed in ${governorate}`,
      htmlContent: emailContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Notification sent to ${donor.email}`);
  } catch (error) {
    console.error('❌ Error sending notification:', error);
  }
};

// CREATE EMERGENCY BLOOD REQUEST
router.post('/create', async (req, res) => {
  try {
    const { bloodType, governorate, patientEmail } = req.body;

    if (!bloodType || !governorate || !patientEmail) {
      return res.status(400).json({ message: 'Blood type, governorate, and patient email are required' });
    }

    // Insert into emergency_blood_requests table
    const sql = `
      INSERT INTO emergency_blood_requests (blood_type, governorate, patient_email, status, created_at)
      VALUES (?, ?, ?, 'pending', NOW())
    `;

    db.query(sql, [bloodType, governorate, patientEmail], async (err, result) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ message: 'Error creating blood request', error: err.message });
      }

      const requestId = result.insertId;
      console.log(`📝 Emergency blood request created: ID ${requestId}`);

      // Get compatible donors from the same governorate
      const compatibleBloodTypes = getCompatibleDonors(bloodType);
      const donorSql = `
        SELECT id, full_name, email, blood_type FROM donors 
        WHERE blood_type IN (?) AND governorate = ?
        LIMIT 20
      `;

      db.query(donorSql, [compatibleBloodTypes, governorate], async (err, donors) => {
        if (err) {
          console.error('Error fetching donors:', err);
          return res.json({ 
            message: 'Blood request created but donors not notified',
            requestId,
            donorsNotified: 0 
          });
        }

        console.log(`👥 Found ${donors.length} compatible donors in ${governorate}`);

        // Send notifications to all compatible donors
        let notificationCount = 0;
        for (const donor of donors) {
          await sendDonorNotification(donor, bloodType, patientEmail, governorate);
          notificationCount++;
        }

        res.json({
          message: `✅ Blood request created! ${notificationCount} donors notified`,
          requestId,
          donorsNotified: notificationCount
        });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET ALL EMERGENCY BLOOD REQUESTS
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM emergency_blood_requests ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching blood requests:', err);
      return res.status(500).json({ message: 'Error fetching blood requests' });
    }
    res.json(results);
  });
});

// GET EMERGENCY BLOOD REQUEST BY ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM emergency_blood_requests WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error fetching blood request:', err);
      return res.status(500).json({ message: 'Error fetching blood request' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Blood request not found' });
    }
    res.json(results[0]);
  });
});

// UPDATE EMERGENCY BLOOD REQUEST STATUS
router.put('/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required' });
  }

  const sql = 'UPDATE emergency_blood_requests SET status = ? WHERE id = ?';
  db.query(sql, [status, id], (err) => {
    if (err) {
      console.error('Error updating blood request:', err);
      return res.status(500).json({ message: 'Error updating blood request' });
    }
    res.json({ message: 'Blood request status updated successfully' });
  });
});

module.exports = router;