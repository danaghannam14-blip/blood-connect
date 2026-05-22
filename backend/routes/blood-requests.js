const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

// Get compatible donors for a blood type (who CAN receive this blood)
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

// Send email to donor about emergency request
const sendDonorEmail = async (donor, bloodType, governorate, patientEmail) => {
  try {
    const emailContent = `
      <h2 style="color: #dc2626;">🩸 URGENT BLOOD DONATION NEEDED</h2>
      <p><strong>Blood Type Needed:</strong> ${bloodType}</p>
      <p><strong>Location:</strong> ${governorate}</p>
      <p><strong>Patient Contact:</strong> ${patientEmail}</p>
      <p style="margin: 20px 0; font-size: 14px; color: #991b1b; font-weight: bold;">A patient needs blood immediately!</p>
      <ol>
        <li>Log in to BloodConnect</li>
        <li>Go to your Emergency Blood Requests</li>
        <li>Choose where you can donate (Center or Hospital)</li>
        <li>Confirm your donation</li>
      </ol>
      <p style="color: #dc2626; font-weight: bold; font-size: 16px;">Every donation saves lives! 🙏</p>
    `;

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: donor.email, name: donor.full_name }],
      sender: { email: 'noreply@bloodconnect.com', name: 'BloodConnect' },
      subject: `🚨 URGENT: ${bloodType} Blood Needed in ${governorate}`,
      htmlContent: emailContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    console.log(`✅ Emergency notification sent to ${donor.email}`);
  } catch (error) {
    console.error('❌ Error sending donor email:', error.message);
  }
};

// Send confirmation email to patient (location-specific)
const sendPatientConfirmationEmail = async (patientEmail, bloodType, donorName, locationType, locationInfo) => {
  try {
    let emailContent = '';

    if (locationType === 'center') {
      // Email for Center donation (Hamra)
      emailContent = `
        <h2 style="color: #22c55e;">✅ Blood Donation Confirmed!</h2>
        <p>Great news! A compatible donor has confirmed their donation for you.</p>
        
        <h3 style="color: #dc2626;">🩸 Blood Details</h3>
        <p><strong>Blood Type:</strong> ${bloodType}</p>
        <p><strong>Donor Name:</strong> ${donorName}</p>
        
        <h3 style="color: #dc2626;">📍 Pickup Location</h3>
        <p><strong>BloodConnect Hamra Center</strong></p>
        <p style="margin: 8px 0;">Address: Hamra, Beirut, Lebanon</p>
        <p style="margin: 8px 0; font-weight: bold;">⏰ Operating Hours: 8AM - 6PM Daily</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 13px;">
          Please visit our center during operating hours to pick up the blood. 
          If you have any questions, contact us at noreply@bloodconnect.com
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Thank you for using BloodConnect! 🙏
        </p>
      `;
    } else if (locationType === 'hospital') {
      // Email for Hospital donation
      emailContent = `
        <h2 style="color: #22c55e;">✅ Blood Donation Confirmed!</h2>
        <p>Great news! A compatible donor has confirmed their donation for you.</p>
        
        <h3 style="color: #dc2626;">🩸 Blood Details</h3>
        <p><strong>Blood Type:</strong> ${bloodType}</p>
        <p><strong>Donor Name:</strong> ${donorName}</p>
        
        <h3 style="color: #dc2626;">🏥 Pickup Location</h3>
        <p><strong>${locationInfo}</strong></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 13px;">
          Please contact <strong>${locationInfo}</strong> to arrange the blood pickup or delivery.
          Provide them with this confirmation and your blood type requirement.
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Thank you for using BloodConnect! 🙏
        </p>
      `;
    }

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
    console.error('❌ Error sending patient confirmation email:', error.message);
  }
};

// ===== PATIENT INITIATES EMERGENCY REQUEST =====
router.post('/create-emergency', async (req, res) => {
  try {
    const { patient_email, blood_type, governorate } = req.body;

    if (!patient_email || !blood_type || !governorate) {
      return res.status(400).json({ error: 'patient_email, blood_type, and governorate are required' });
    }

    // Get compatible blood types that donors can provide
    const compatibleBloodTypes = getCompatibleDonors(blood_type);

    // Find eligible donors in the SAME governorate with compatible blood types
    const donorSql = `
      SELECT id, full_name, email, blood_type, governorate 
      FROM donors 
      WHERE blood_type IN (?) 
      AND governorate = ? 
      AND is_eligible = 1
      LIMIT 100
    `;

    db.query(donorSql, [compatibleBloodTypes, governorate], async (err, donors) => {
      if (err) {
        console.error('❌ Database error:', err);
        return res.status(500).json({ error: 'Database error', details: err.message });
      }

      if (!donors || donors.length === 0) {
        return res.json({
          message: `⚠️ No eligible donors found in ${governorate}. Request logged.`,
          donorsNotified: 0
        });
      }

      console.log(`📝 Emergency created: ${blood_type} needed in ${governorate}`);
      console.log(`👥 Found ${donors.length} compatible eligible donors`);

      // Create emergency records and send emails to all donors
      let successCount = 0;
      for (const donor of donors) {
        try {
          // Create emergency_donations record
          const insertSql = `
            INSERT INTO emergency_donations (donor_id, blood_type, patient_email, governorate, status)
            VALUES (?, ?, ?, ?, 'pending')
          `;

          db.query(insertSql, [donor.id, blood_type, patient_email, governorate], async (insertErr) => {
            if (!insertErr) {
              // Send notification email to donor
              await sendDonorEmail(donor, blood_type, governorate, patient_email);
              successCount++;
            }
          });
        } catch (error) {
          console.error(`Error processing donor ${donor.id}:`, error);
        }
      }

      // Return success response
      res.json({
        message: `✅ Emergency posted! ${donors.length} donors in ${governorate} are being notified.`,
        donorsNotified: donors.length
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// ===== GET DONOR'S EMERGENCY NOTIFICATIONS =====
router.get('/donor/:donorId', (req, res) => {
  const sql = `
    SELECT 
      ed.id as notification_id,
      ed.blood_type,
      ed.governorate,
      ed.patient_email,
      ed.status,
      ed.donor_donation_location,
      ed.hospital_id,
      h.name as hospital_name,
      ed.created_at
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    WHERE ed.donor_id = ?
    ORDER BY ed.created_at DESC
  `;

  db.query(sql, [req.params.donorId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching notifications:', err);
      return res.status(500).json({ error: 'Error fetching notifications' });
    }
    res.json(results || []);
  });
});

// ===== DONOR CONFIRMS DONATION LOCATION =====
router.post('/donor-confirm-donation', async (req, res) => {
  try {
    const { notificationId, donorId, donationLocation, hospitalId } = req.body;

    if (!notificationId || !donorId || !donationLocation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['center', 'hospital'].includes(donationLocation)) {
      return res.status(400).json({ error: 'Invalid donation location' });
    }

    // Update emergency donation record
    const updateSql = `
      UPDATE emergency_donations 
      SET donor_donation_location = ?, 
          hospital_id = ?,
          status = 'awaiting_confirmation'
      WHERE id = ? AND donor_id = ?
    `;

    db.query(updateSql, [donationLocation, hospitalId || null, notificationId, donorId], (err) => {
      if (err) {
        console.error('❌ Error updating donation:', err);
        return res.status(500).json({ error: 'Error updating donation location' });
      }

      console.log(`✅ Donor ${donorId} confirmed ${donationLocation} donation for notification ${notificationId}`);
      res.json({
        message: `Donation location confirmed! Awaiting ${donationLocation === 'center' ? 'admin' : 'hospital'} confirmation.`,
        notificationId
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== HOSPITAL CONFIRMS DONATION =====
router.post('/hospital-confirm', async (req, res) => {
  try {
    const { notificationId, hospitalId } = req.body;

    if (!notificationId || !hospitalId) {
      return res.status(400).json({ error: 'notificationId and hospitalId are required' });
    }

    // Get donation details
    const getSql = `
      SELECT 
        ed.id,
        ed.blood_type,
        ed.patient_email,
        ed.donor_donation_location,
        d.full_name as donor_name,
        h.name as hospital_name
      FROM emergency_donations ed
      JOIN donors d ON ed.donor_id = d.id
      LEFT JOIN hospitals h ON ed.hospital_id = h.id
      WHERE ed.id = ? AND ed.hospital_id = ? AND ed.donor_donation_location = 'hospital'
    `;

    db.query(getSql, [notificationId, hospitalId], async (err, results) => {
      if (err || !results || results.length === 0) {
        console.error('❌ Donation not found or invalid:', err);
        return res.status(404).json({ error: 'Donation not found or not for this hospital' });
      }

      const { blood_type, patient_email, donor_name, hospital_name } = results[0];

      // Update status to confirmed
      const updateSql = `
        UPDATE emergency_donations 
        SET status = 'confirmed'
        WHERE id = ?
      `;

      db.query(updateSql, [notificationId], async (updateErr) => {
        if (updateErr) {
          console.error('❌ Error confirming donation:', updateErr);
          return res.status(500).json({ error: 'Error confirming donation' });
        }

        // Send confirmation email to patient (hospital location)
        await sendPatientConfirmationEmail(
          patient_email,
          blood_type,
          donor_name,
          'hospital',
          hospital_name
        );

        console.log(`✅ Hospital ${hospitalId} confirmed donation ${notificationId}`);
        res.json({
          message: 'Donation confirmed! Patient has been notified.',
          notificationId
        });
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== ADMIN CONFIRMS DONATION (CENTER ONLY) =====
router.post('/admin-confirm', async (req, res) => {
  try {
    const { notification_id } = req.body;

    if (!notification_id) {
      return res.status(400).json({ error: 'notification_id is required' });
    }

    // Get donation details (must be center donation)
    const getSql = `
      SELECT 
        ed.id,
        ed.blood_type,
        ed.patient_email,
        ed.donor_donation_location,
        d.full_name as donor_name
      FROM emergency_donations ed
      JOIN donors d ON ed.donor_id = d.id
      WHERE ed.id = ? AND ed.donor_donation_location = 'center'
    `;

    db.query(getSql, [notification_id], async (err, results) => {
      if (err || !results || results.length === 0) {
        console.error('❌ Donation not found or not center donation:', err);
        return res.status(404).json({ error: 'Donation not found or not a center donation' });
      }

      const { blood_type, patient_email, donor_name } = results[0];

      // Update status to confirmed
      const updateSql = `
        UPDATE emergency_donations 
        SET status = 'confirmed'
        WHERE id = ?
      `;

      db.query(updateSql, [notification_id], async (updateErr) => {
        if (updateErr) {
          console.error('❌ Error confirming donation:', updateErr);
          return res.status(500).json({ error: 'Error confirming donation' });
        }

        // Send confirmation email to patient (center location)
        await sendPatientConfirmationEmail(
          patient_email,
          blood_type,
          donor_name,
          'center',
          'BCC Hamra Center, Hamra, Beirut'
        );

        console.log(`✅ Admin confirmed center donation ${notification_id}`);
        res.json({
          message: 'Donation confirmed! Patient has been notified with center details.',
          notificationId: notification_id
        });
      });
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// ===== GET ALL EMERGENCY DONATIONS (FOR ADMIN) =====
router.get('/all-emergency-donations', (req, res) => {
  const sql = `
    SELECT 
      ed.id as notification_id,
      ed.status,
      ed.donor_donation_location,
      ed.hospital_id,
      ed.blood_type,
      ed.patient_email,
      ed.governorate,
      d.full_name as donor_name,
      h.name as hospital_name,
      ed.created_at
    FROM emergency_donations ed
    JOIN donors d ON ed.donor_id = d.id
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    ORDER BY ed.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching donations:', err);
      return res.status(500).json({ error: 'Error fetching donations' });
    }
    res.json(results || []);
  });
});

// ===== GET EMERGENCY REQUEST STATUS (FOR PATIENT) =====
router.get('/status/:patientEmail', (req, res) => {
  const sql = `
    SELECT 
      ed.id,
      ed.blood_type,
      ed.governorate,
      ed.patient_email,
      ed.status,
      ed.donor_donation_location,
      COUNT(CASE WHEN ed.status = 'confirmed' THEN 1 END) as confirmed_count,
      ed.created_at
    FROM emergency_donations ed
    WHERE ed.patient_email = ?
    GROUP BY ed.id
    ORDER BY ed.created_at DESC
  `;

  db.query(sql, [req.params.patientEmail], (err, results) => {
    if (err) {
      console.error('❌ Error fetching status:', err);
      return res.status(500).json({ error: 'Error fetching status' });
    }

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No emergency requests found' });
    }

    res.json(results);
  });
});

module.exports = router;