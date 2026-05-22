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

// Send email to donor
const sendDonorEmail = async (donor, bloodType, governorate, requestId) => {
  try {
    const emailContent = `
      <h2 style="color: #dc2626;">🩸 URGENT BLOOD DONATION NEEDED</h2>
      <p><strong>Blood Type:</strong> ${bloodType}</p>
      <p><strong>Location:</strong> ${governorate}</p>
      <p>A patient needs blood immediately. If you can donate, please:</p>
      <ol>
        <li>Log in to BloodConnect</li>
        <li>Go to your notifications</li>
        <li>Confirm where you can donate</li>
      </ol>
      <p style="color: #991b1b; font-weight: bold;">Every donation saves lives! 🙏</p>
    `;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: donor.email, name: donor.full_name }],
      sender: { email: 'noreply@bloodconnect.com', name: 'BloodConnect' },
      subject: `🩸 URGENT: ${bloodType} Blood Needed in ${governorate}`,
      htmlContent: emailContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Donor email sent to ${donor.email}`);
  } catch (error) {
    console.error('❌ Error sending donor email:', error.message);
  }
};

// Send email to patient when donation confirmed
const sendPatientConfirmationEmail = async (patientEmail, bloodType, donorName, donationLocation, hospitalName) => {
  try {
    const locationText = donationLocation === 'hospital' 
      ? `<p><strong>🏥 Hospital:</strong> ${hospitalName}</p>` 
      : `<p><strong>🩸 Our Center:</strong> BloodConnect Center, Beirut</p>`;

    const emailContent = `
      <h2 style="color: #22c55e;">✅ Blood Donation Confirmed!</h2>
      <p>Good news! A compatible donor has confirmed their donation for you.</p>
      <p><strong>Blood Type:</strong> ${bloodType}</p>
      <p><strong>Donor:</strong> ${donorName}</p>
      ${locationText}
      <p style="color: #666; font-size: 12px; margin-top: 16px;">
        Please contact the hospital or center to arrange pickup or delivery. Thank you!
      </p>
    `;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: patientEmail }],
      sender: { email: 'noreply@bloodconnect.com', name: 'BloodConnect' },
      subject: `✅ Blood Donation Confirmed - ${bloodType}`,
      htmlContent: emailContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Patient confirmation email sent to ${patientEmail}`);
  } catch (error) {
    console.error('❌ Error sending patient email:', error.message);
  }
};

// CREATE EMERGENCY BLOOD REQUEST
router.post('/create', async (req, res) => {
  try {
    const { bloodType, governorate, patientEmail } = req.body;

    if (!bloodType || !governorate || !patientEmail) {
      return res.status(400).json({ message: 'Blood type, governorate, and patient email are required' });
    }

    // Insert into emergency_blood_requests
    const sql = `
      INSERT INTO emergency_blood_requests (blood_type, governorate, patient_email, status)
      VALUES (?, ?, ?, 'pending')
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
        SELECT id, full_name, email, blood_type, governorate FROM donors 
        WHERE blood_type IN (?) AND governorate = ? AND is_eligible = 1
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

        console.log(`👥 Found ${donors.length} compatible eligible donors in ${governorate}`);

        // Send notifications to all compatible donors
        let notificationCount = 0;
        for (const donor of donors) {
          // Create notification record
          db.query(
            'INSERT INTO emergency_notifications (request_id, donor_id, status) VALUES (?, ?, ?)',
            [requestId, donor.id, 'pending'],
            async () => {
              // Send email
              await sendDonorEmail(donor, bloodType, governorate, requestId);
              notificationCount++;
            }
          );
        }

        res.json({
          message: `✅ Emergency request created! ${donors.length} donors notified`,
          requestId,
          donorsNotified: donors.length
        });
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET DONOR'S EMERGENCY NOTIFICATIONS
router.get('/donor/:donorId', (req, res) => {
  const sql = `
    SELECT 
      ebr.id as request_id,
      ebr.blood_type,
      ebr.governorate,
      ebr.patient_email,
      ebr.status as request_status,
      ebr.created_at,
      en.id as notification_id,
      en.status as notification_status,
      en.donor_donation_location,
      en.hospital_id,
      h.name as hospital_name,
      h.address as hospital_address
    FROM emergency_notifications en
    JOIN emergency_blood_requests ebr ON en.request_id = ebr.id
    LEFT JOIN hospitals h ON en.hospital_id = h.id
    WHERE en.donor_id = ?
    ORDER BY ebr.created_at DESC
  `;
  
  db.query(sql, [req.params.donorId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err);
      return res.status(500).json({ message: 'Error fetching notifications' });
    }
    res.json(results);
  });
});

// DONOR CONFIRMS DONATION LOCATION (hospital or center)
router.post('/donor-confirm-donation', async (req, res) => {
  try {
    const { notificationId, donorId, donationLocation, hospitalId } = req.body;

    if (!notificationId || !donorId || !donationLocation) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Update notification with donation location
    const updateSql = `
      UPDATE emergency_notifications 
      SET donor_donation_location = ?, hospital_id = ?, status = 'awaiting_confirmation'
      WHERE id = ?
    `;

    db.query(updateSql, [donationLocation, hospitalId || null, notificationId], (err) => {
      if (err) {
        console.error('Error updating notification:', err);
        return res.status(500).json({ message: 'Error updating donation location' });
      }

      res.json({ 
        message: 'Donation location confirmed! Awaiting confirmation.',
        notificationId
      });
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// HOSPITAL CONFIRMS DONATION
router.post('/hospital-confirm', async (req, res) => {
  try {
    const { notificationId, hospitalId } = req.body;

    if (!notificationId || !hospitalId) {
      return res.status(400).json({ message: 'Notification ID and Hospital ID required' });
    }

    // Get notification details
    db.query(
      `SELECT en.*, ebr.blood_type, ebr.patient_email, d.full_name 
       FROM emergency_notifications en
       JOIN emergency_blood_requests ebr ON en.request_id = ebr.id
       JOIN donors d ON en.donor_id = d.id
       WHERE en.id = ? AND en.hospital_id = ?`,
      [notificationId, hospitalId],
      async (err, results) => {
        if (err || results.length === 0) {
          return res.status(404).json({ message: 'Notification not found' });
        }

        const notification = results[0];
        const { blood_type, patient_email, full_name } = notification;

        // Update notification status
        db.query(
          'UPDATE emergency_notifications SET status = ? WHERE id = ?',
          ['confirmed', notificationId],
          async (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Error confirming donation' });

            // Get hospital name
            db.query(
              'SELECT name FROM hospitals WHERE id = ?',
              [hospitalId],
              async (err, hospitalResults) => {
                const hospitalName = hospitalResults[0]?.name || 'Hospital';

                // Send email to patient
                await sendPatientConfirmationEmail(patient_email, blood_type, full_name, 'hospital', hospitalName);

                res.json({ 
                  message: 'Donation confirmed! Patient notified.',
                  notificationId
                });
              }
            );
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ADMIN CONFIRMS DONATION (from center)
router.post('/admin-confirm', async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json({ message: 'Notification ID required' });
    }

    // Get notification details
    db.query(
      `SELECT en.*, ebr.blood_type, ebr.patient_email, d.full_name 
       FROM emergency_notifications en
       JOIN emergency_blood_requests ebr ON en.request_id = ebr.id
       JOIN donors d ON en.donor_id = d.id
       WHERE en.id = ? AND en.donor_donation_location = 'center'`,
      [notificationId],
      async (err, results) => {
        if (err || results.length === 0) {
          return res.status(404).json({ message: 'Notification not found or not for center' });
        }

        const notification = results[0];
        const { blood_type, patient_email, full_name } = notification;

        // Update notification status
        db.query(
          'UPDATE emergency_notifications SET status = ? WHERE id = ?',
          ['confirmed', notificationId],
          async (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Error confirming donation' });

            // Send email to patient
            await sendPatientConfirmationEmail(patient_email, blood_type, full_name, 'center', null);

            res.json({ 
              message: 'Donation confirmed! Patient notified.',
              notificationId
            });
          }
        );
      }
    );
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET EMERGENCY REQUEST STATUS (for patient to check)
router.get('/status/:requestId', (req, res) => {
  const sql = `
    SELECT 
      ebr.id,
      ebr.blood_type,
      ebr.governorate,
      ebr.patient_email,
      ebr.status,
      COUNT(CASE WHEN en.status = 'confirmed' THEN 1 END) as confirmed_count
    FROM emergency_blood_requests ebr
    LEFT JOIN emergency_notifications en ON ebr.id = en.request_id
    WHERE ebr.id = ?
    GROUP BY ebr.id
  `;
  
  db.query(sql, [req.params.requestId], (err, results) => {
    if (err) {
      console.error('Error fetching status:', err);
      return res.status(500).json({ message: 'Error fetching status' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(results[0]);
  });
});

// GET ALL EMERGENCY DONATIONS (for admin panel)
router.get('/all-emergency-donations', (req, res) => {
  const sql = `
    SELECT 
      en.id as notification_id,
      en.status,
      en.donor_donation_location,
      en.hospital_id,
      ebr.blood_type,
      ebr.patient_email,
      d.full_name as donor_name,
      h.name as hospital_name
    FROM emergency_notifications en
    JOIN emergency_blood_requests ebr ON en.request_id = ebr.id
    JOIN donors d ON en.donor_id = d.id
    LEFT JOIN hospitals h ON en.hospital_id = h.id
    ORDER BY en.created_at DESC
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching donations:', err);
      return res.status(500).json({ message: 'Error fetching donations' });
    }
    res.json(results);
  });
});

module.exports = router;