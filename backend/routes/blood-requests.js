const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

// Get compatible donors for a blood type (which DONORS CAN GIVE to this patient)
const getCompatibleDonors = (bloodType) => {
  const compatibility = {
    'O-': ['O-'],                           // Only O- can give to O-
    'O+': ['O-', 'O+'],                     // O- and O+ can give to O+
    'A-': ['O-', 'A-'],                     // O- and A- can give to A-
    'A+': ['O-', 'O+', 'A-', 'A+'],         // O-, O+, A-, A+ can give to A+
    'B-': ['O-', 'B-'],                     // O- and B- can give to B-
    'B+': ['O-', 'O+', 'B-', 'B+'],         // O-, O+, B-, B+ can give to B+
    'AB-': ['O-', 'A-', 'B-', 'AB-'],       // O-, A-, B-, AB- can give to AB-
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] // Everyone can give to AB+
  };
  return compatibility[bloodType] || [];
};

// ✅ FIXED: Send email to donor about emergency request with proper error handling
const sendDonorEmail = async (donor, bloodType, governorate, patientEmail) => {
  try {
    const emailContent = `
      <h2 style="color: #dc2626;">🩸 URGENT BLOOD DONATION NEEDED</h2>
      <p><strong>Blood Type Needed:</strong> ${bloodType}</p>
      <p><strong>Location:</strong> ${governorate}</p>
      <p style="margin: 20px 0; font-size: 14px; color: #991b1b; font-weight: bold;">A patient needs blood immediately!</p>
      <ol>
        <li>Log in to BloodConnect</li>
        <li>Go to your Emergency Blood Requests</li>
        <li>Choose where you can donate (Center or Hospital)</li>
        <li>Confirm your donation</li>
      </ol>
      <p style="color: #dc2626; font-weight: bold; font-size: 16px;">Every donation saves lives! 🙏</p>
    `;

    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: donor.email, name: donor.full_name }],
      sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
      subject: `🚨 URGENT: ${bloodType} Blood Needed in ${governorate}`,
      htmlContent: emailContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Emergency notification sent to ${donor.email} (ID: ${response.status})`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email to ${donor.email}:`, error.message);
    return false;
  }
};

// ✅ FIXED: Send confirmation email to patient (location-specific)
const sendPatientConfirmationEmail = async (patientEmail, bloodType, locationType, locationInfo) => {
  try {
    let emailContent = '';

    if (locationType === 'center') {
      // Email for Center donation (Hamra)
      emailContent = `
        <h2 style="color: #22c55e;">✅ Blood Donation Confirmed!</h2>
        <p>Great news! A compatible donor has confirmed their donation for you.</p>
        
        <h3 style="color: #dc2626;">🩸 Blood Details</h3>
        <p><strong>Blood Type:</strong> ${bloodType}</p>
        
        <h3 style="color: #dc2626;">📍 Pickup Location</h3>
        <p><strong>BloodConnect Hamra Center</strong></p>
        <p style="margin: 8px 0;">Address: Hamra, Beirut, Lebanon</p>
        <p style="margin: 8px 0; font-weight: bold;">⏰ Operating Hours: 8AM - 6PM Daily</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 13px;">
          Please visit our center during operating hours to pick up the blood. 
          If you have any questions, contact us at blood.connect.donate@gmail.com
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
        
        <h3 style="color: #dc2626;">🏥 Pickup Location</h3>
        <p><strong>${locationInfo}</strong></p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 13px;">
          Please contact the hospital to arrange pickup. If you have any questions, contact us at blood.connect.donate@gmail.com
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 20px;">
          Thank you for using BloodConnect! 🙏
        </p>
      `;
    }

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: patientEmail }],
      sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
      subject: `✅ Blood Donation Confirmed - ${bloodType}`,
      htmlContent: emailContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Confirmation email sent to patient: ${patientEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending confirmation email to ${patientEmail}:`, error.message);
    return false;
  }
};

// ✅ SEND EMAIL TO PATIENT WHEN DONATION CONFIRMED
const sendPatientDonationConfirmedEmail = async (patientEmail, bloodType, locationType, locationName) => {
  try {
    let emailContent = '';

    if (locationType === 'center') {
      emailContent = `
        <h2 style="color: #22c55e;">✅ Blood Donation Confirmed!</h2>
        <p>Excellent news! A compatible donor has successfully donated blood for your emergency case at the BCC Hamra Center.</p>
        
        <h3 style="color: #dc2626;">🩸 Blood Details</h3>
        <p><strong>Blood Type:</strong> ${bloodType}</p>
        <p><strong>Donation Location:</strong> BCC Hamra Center, Hamra, Beirut</p>
        <p><strong>Status:</strong> ✅ Confirmed</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 13px;">
          Your blood is ready for pickup at BCC Hamra Center during operating hours (8AM - 6PM Daily).
        </p>
        
        <p style="color: #22c55e; font-weight: bold;">Thank you for using BloodConnect! 🙏</p>
      `;
    } else if (locationType === 'hospital') {
      emailContent = `
        <h2 style="color: #22c55e;">✅ Blood Donation Confirmed!</h2>
        <p>Excellent news! A compatible donor has successfully donated blood for your emergency case at the hospital.</p>
        
        <h3 style="color: #dc2626;">🩸 Blood Details</h3>
        <p><strong>Blood Type:</strong> ${bloodType}</p>
        <p><strong>Donation Location:</strong> Hospital</p>
        <p><strong>Status:</strong> ✅ Confirmed by Hospital</p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        
        <p style="color: #666; font-size: 13px;">
          Your blood has been confirmed by the hospital and is ready for use.
        </p>
        
        <p style="color: #22c55e; font-weight: bold;">Thank you for using BloodConnect! 🙏</p>
      `;
    }

    await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: patientEmail }],
      sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
      subject: `✅ Blood Donation Confirmed - ${bloodType}`,
      htmlContent: emailContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Donation confirmed email sent to patient: ${patientEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending donation confirmed email:`, error.message);
    return false;
  }
};

// ✅ FIXED: Create emergency request and notify donors (with Promise.all)
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

      // ✅ FIXED: Use Promise.all to wait for all emails to be sent
      const emailPromises = donors.map(donor => {
        return new Promise((resolve) => {
          // Insert emergency_donations record
          const insertSql = `
            INSERT INTO emergency_donations (donor_id, blood_type, patient_email, governorate, status)
            VALUES (?, ?, ?, ?, 'pending')
          `;

          db.query(insertSql, [donor.id, blood_type, patient_email, governorate], async (insertErr) => {
            if (insertErr) {
              console.error(`❌ Error inserting record for donor ${donor.id}:`, insertErr);
              resolve(false);
              return;
            }

            // Send notification email to donor
            const emailSent = await sendDonorEmail(donor, blood_type, governorate, patient_email);
            resolve(emailSent);
          });
        });
      });

      // ✅ FIXED: Wait for all emails to complete
      const emailResults = await Promise.all(emailPromises);
      const successCount = emailResults.filter(r => r === true).length;

      console.log(`📧 Emails sent to ${successCount}/${donors.length} donors`);

      // Return success response
      res.json({
        message: `✅ Emergency posted! ${successCount}/${donors.length} donors in ${governorate} notified.`,
        donorsNotified: successCount,
        governorate: governorate,
        bloodType: blood_type
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

// ===== GET DONATIONS FOR HOSPITAL DASHBOARD =====
router.get('/hospital/:hospitalId', (req, res) => {
  const sql = `
    SELECT 
      ed.id,
      ed.donor_id,
      d.full_name as donor_name,
      ed.blood_type,
      ed.status,
      ed.donor_donation_location,
      ed.created_at,
      ed.updated_at
    FROM emergency_donations ed
    LEFT JOIN donors d ON ed.donor_id = d.id
    WHERE ed.hospital_id = ? 
    AND ed.donor_donation_location = 'hospital'
    AND ed.status IN ('awaiting_confirmation', 'confirmed')
    ORDER BY ed.created_at DESC
  `;

  db.query(sql, [req.params.hospitalId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching hospital donations:', err);
      return res.status(500).json({ error: 'Error fetching donations' });
    }
    res.json(results || []);
  });
});

// ===== GET DONATIONS AT CENTER (FOR ADMIN) =====
router.get('/center-donations', (req, res) => {
  const sql = `
    SELECT 
      ed.id,
      ed.donor_id,
      d.full_name as donor_name,
      ed.blood_type,
      ed.patient_email,
      ed.status,
      ed.created_at,
      ed.updated_at
    FROM emergency_donations ed
    LEFT JOIN donors d ON ed.donor_id = d.id
    WHERE ed.donor_donation_location = 'center'
    AND ed.status IN ('awaiting_confirmation', 'confirmed')
    ORDER BY ed.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching center donations:', err);
      return res.status(500).json({ error: 'Error fetching donations' });
    }
    res.json(results || []);
  });
});

// ===== DONOR CONFIRMS DONATION LOCATION =====
router.post('/donor-confirm-donation', (req, res) => {
  const { notification_id, donation_location, hospital_id } = req.body;

  if (!notification_id || !donation_location) {
    return res.status(400).json({ error: 'notification_id and donation_location are required' });
  }

  const updateSql = `
    UPDATE emergency_donations 
    SET 
      donor_donation_location = ?,
      hospital_id = ?,
      status = 'awaiting_confirmation'
    WHERE id = ?
  `;

  db.query(updateSql, [donation_location, hospital_id || null, notification_id], async (err) => {
    if (err) {
      console.error('❌ Error updating donation location:', err);
      return res.status(500).json({ error: 'Error updating donation location' });
    }

    // Get the updated record to get hospital name
    const getSql = `
      SELECT ed.*, h.name as hospital_name
      FROM emergency_donations ed
      LEFT JOIN hospitals h ON ed.hospital_id = h.id
      WHERE ed.id = ?
    `;

    db.query(getSql, [notification_id], async (getErr, results) => {
      if (!getErr && results.length > 0) {
        const record = results[0];
        let locationInfo = '';

        if (donation_location === 'center') {
          locationInfo = 'BCC Hamra Center, Hamra, Beirut';
        } else if (donation_location === 'hospital' && record.hospital_name) {
          locationInfo = record.hospital_name;
        }

        // Send confirmation email to patient
        if (locationInfo) {
          await sendPatientConfirmationEmail(
            record.patient_email,
            record.blood_type,
            donation_location,
            locationInfo
          );
        }
      }

      res.json({ message: '✅ Donation location confirmed and patient notified!' });
    });
  });
});

// ===== HOSPITAL CONFIRMS DONATION =====
router.post('/hospital-confirm', (req, res) => {
  const { notificationId, hospitalId } = req.body;

  if (!notificationId || !hospitalId) {
    return res.status(400).json({ error: 'notificationId and hospitalId are required' });
  }

  // Update status to 'confirmed' for this hospital's donation
  const updateSql = `
    UPDATE emergency_donations 
    SET status = 'confirmed'
    WHERE id = ? 
    AND hospital_id = ? 
    AND donor_donation_location = 'hospital'
  `;

  db.query(updateSql, [notificationId, hospitalId], async (err, result) => {
    if (err) {
      console.error('❌ Error confirming donation:', err);
      return res.status(500).json({ error: 'Error confirming donation' });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Donation not found or already confirmed' });
    }

    // Get donation details to send email to patient
    const getSql = `
      SELECT * FROM emergency_donations WHERE id = ?
    `;

    db.query(getSql, [notificationId], async (getErr, results) => {
      if (!getErr && results.length > 0) {
        const donation = results[0];
        
        // Send email to patient that donation was confirmed
        await sendPatientDonationConfirmedEmail(
          donation.patient_email,
          donation.blood_type,
          'hospital',
          'Hospital Confirmed'
        );
      }

      res.json({ 
        success: true,
        message: '✅ Donation confirmed! Patient notified.' 
      });
    });
  });
});

// ===== ADMIN/BCC CONFIRMS DONATION AT CENTER =====
router.post('/admin-confirm', (req, res) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({ error: 'notificationId is required' });
  }

  // Update status to 'confirmed' for center donation
  const updateSql = `
    UPDATE emergency_donations 
    SET status = 'confirmed'
    WHERE id = ? 
    AND donor_donation_location = 'center'
  `;

  db.query(updateSql, [notificationId], async (err, result) => {
    if (err) {
      console.error('❌ Error confirming donation:', err);
      return res.status(500).json({ error: 'Error confirming donation' });
    }

    if (result.affectedRows === 0) {
      return res.status(400).json({ error: 'Donation not found or already confirmed' });
    }

    // Get donation details
    const getSql = `
      SELECT * FROM emergency_donations WHERE id = ?
    `;

    db.query(getSql, [notificationId], async (getErr, results) => {
      if (!getErr && results.length > 0) {
        const donation = results[0];
        
        // Send email to patient
        await sendPatientDonationConfirmedEmail(
          donation.patient_email,
          donation.blood_type,
          'center',
          'BCC Hamra Center Confirmed'
        );
      }

      res.json({ 
        success: true,
        message: '✅ Donation confirmed! Patient notified.' 
      });
    });
  });
});

// ===== GET ALL EMERGENCY DONATIONS (ADMIN) =====
router.get('/all-emergency-donations', (req, res) => {
  const sql = `
    SELECT 
      ed.id,
      ed.donor_id,
      d.full_name as donor_name,
      d.email as donor_email,
      ed.blood_type,
      ed.patient_email,
      ed.governorate,
      ed.status,
      ed.donor_donation_location,
      h.name as hospital_name,
      ed.created_at
    FROM emergency_donations ed
    LEFT JOIN donors d ON ed.donor_id = d.id
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    ORDER BY ed.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Error fetching emergency donations:', err);
      return res.status(500).json({ error: 'Error fetching emergency donations' });
    }
    res.json(results || []);
  });
});

// ===== GET PATIENT STATUS =====
router.get('/status/:patientEmail', (req, res) => {
  const sql = `
    SELECT 
      ed.id,
      ed.blood_type,
      ed.governorate,
      ed.status,
      ed.donor_donation_location,
      h.name as hospital_name,
      ed.created_at
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    WHERE ed.patient_email = ?
    ORDER BY ed.created_at DESC
  `;

  db.query(sql, [req.params.patientEmail], (err, results) => {
    if (err) {
      console.error('❌ Error fetching status:', err);
      return res.status(500).json({ error: 'Error fetching status' });
    }
    res.json(results || []);
  });
});

module.exports = router;