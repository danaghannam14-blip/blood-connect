// ============================================
// BLOODCONNECT BACKEND - EMERGENCY REQUEST APIs
// File: routes/emergency-requests.js
// ============================================

const express = require('express');
const mysql = require('mysql2');
const nodemailer = require('nodemailer');
const router = express.Router();

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.AIVEN_HOST || 'mysql-16d1c321-blood-bank2026.k.aivencloud.com',
  port: process.env.AIVEN_PORT || 18083,
  user: process.env.AIVEN_USER || 'avnadmin',
  password: process.env.AIVEN_PASSWORD,
  database: process.env.AIVEN_DB || 'defaultdb',
  ssl: { rejectUnauthorized: false },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL || 'blood.connect.donate@gmail.com',
    pass: process.env.NODEMAILER_PASSWORD || 'your_app_password'
  }
});

// ============================================
// 1️⃣ CREATE EMERGENCY BLOOD REQUEST
// ============================================
router.post('/emergency-requests', (req, res) => {
  const { blood_type, governorate, patient_email, patient_name, patient_phone, urgency_level, notes } = req.body;

  // Validation
  if (!blood_type || !governorate || !patient_email) {
    return res.status(400).json({ 
      error: 'Missing required fields: blood_type, governorate, patient_email' 
    });
  }

  const sql = `
    INSERT INTO emergency_blood_requests 
    (blood_type, governorate, patient_email, patient_name, patient_phone, urgency_level, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
  `;

  pool.query(sql, [blood_type, governorate, patient_email, patient_name, patient_phone, urgency_level || 'urgent', notes], (err, results) => {
    if (err) {
      console.error('❌ Error creating emergency request:', err);
      return res.status(500).json({ error: 'Failed to create emergency request' });
    }

    const requestId = results.insertId;

    // Immediately search for compatible donors
    searchCompatibleDonors(requestId, blood_type, governorate, (donorsFound) => {
      res.status(201).json({
        success: true,
        request_id: requestId,
        message: `Emergency request created. ${donorsFound} compatible donors found.`,
        donors_notified: donorsFound
      });
    });
  });
});

// ============================================
// 2️⃣ SEARCH FOR COMPATIBLE DONORS
// ============================================
function searchCompatibleDonors(requestId, bloodType, governorate, callback) {
  // Blood type compatibility logic
  const compatibleTypes = getCompatibleDonors(bloodType);

  const sql = `
    SELECT id, email, full_name, blood_type, governorate 
    FROM donors 
    WHERE blood_type IN (${compatibleTypes.map(() => '?').join(',')})
    AND governorate = ?
    AND is_eligible = TRUE
    LIMIT 20
  `;

  pool.query(sql, [...compatibleTypes, governorate], (err, donors) => {
    if (err) {
      console.error('❌ Error searching donors:', err);
      callback(0);
      return;
    }

    if (donors.length === 0) {
      console.log(`⚠️  No compatible donors found for ${bloodType} in ${governorate}`);
      callback(0);
      return;
    }

    // Create emergency donation records for each donor
    donors.forEach(donor => {
      const insertSql = `
        INSERT INTO emergency_donations 
        (request_id, donor_id, blood_type, governorate, status)
        VALUES (?, ?, ?, ?, 'pending')
      `;

      pool.query(insertSql, [requestId, donor.id, bloodType, governorate], (insertErr) => {
        if (insertErr) {
          console.error('❌ Error creating donation record:', insertErr);
        } else {
          // Send email notification to donor
          sendDonorNotification(donor, bloodType, governorate, requestId);
        }
      });
    });

    callback(donors.length);
  });
}

// ============================================
// 3️⃣ SEND DONOR NOTIFICATION EMAIL
// ============================================
function sendDonorNotification(donor, bloodType, governorate, requestId) {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL || 'blood.connect.donate@gmail.com',
    to: donor.email,
    subject: `🚨 URGENT: Blood Donation Needed - ${bloodType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #d32f2f; color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h1 style="margin: 0;">🚨 EMERGENCY BLOOD DONATION NEEDED</h1>
        </div>

        <div style="padding: 20px; background-color: #f5f5f5; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333;">Hi ${donor.full_name},</h2>
          
          <p style="font-size: 16px; color: #555;">
            We have an <strong>URGENT</strong> blood donation request in your area.
          </p>

          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #d32f2f; margin: 15px 0;">
            <p><strong>Blood Type Needed:</strong> <span style="font-size: 20px; color: #d32f2f;">${bloodType}</span></p>
            <p><strong>Location:</strong> ${governorate}</p>
            <p><strong>Urgency Level:</strong> <span style="color: #d32f2f; font-weight: bold;">CRITICAL</span></p>
          </div>

          <p style="font-size: 14px; color: #666;">
            Your blood type matches the requirement. If you can help, please click the button below to confirm your availability.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/emergency/confirm/${requestId}" 
               style="display: inline-block; background-color: #d32f2f; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold;">
              ✓ YES, I CAN DONATE
            </a>
          </div>

          <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #856404; font-size: 14px;">
              <strong>⏰ Time-sensitive:</strong> Emergency blood donations are needed urgently. 
              If you cannot help right now, you can still check the request status and donate within 24 hours.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p style="font-size: 12px; color: #999;">
            This is an automated emergency notification. Your email was selected because your blood type matches the requirement.
            <br><br>
            BloodConnect Team
          </p>
        </div>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('❌ Error sending email to', donor.email, ':', err);
      
      // Log failed email attempt
      const logSql = `
        UPDATE emergency_donations 
        SET status = 'pending' 
        WHERE donor_id = ? AND request_id = ? AND email_sent_at IS NULL
      `;
      pool.query(logSql, [donor.id, requestId]);
    } else {
      console.log('✅ Email sent to', donor.email);
      
      // Update email sent timestamp
      const updateSql = `
        UPDATE emergency_donations 
        SET email_sent_at = NOW()
        WHERE donor_id = ? AND request_id = ?
      `;
      pool.query(updateSql, [donor.id, requestId]);
    }
  });
}

// ============================================
// 4️⃣ DONOR CONFIRMS AVAILABILITY
// ============================================
router.post('/donations/:requestId/confirm', (req, res) => {
  const { requestId } = req.params;
  const { donor_id, donor_email, donation_location, hospital_id } = req.body;

  if (!donor_id || !donor_email || !donation_location) {
    return res.status(400).json({ 
      error: 'Missing: donor_id, donor_email, donation_location (hospital or center)' 
    });
  }

  // Validate location
  if (!['hospital', 'center'].includes(donation_location)) {
    return res.status(400).json({ 
      error: 'donation_location must be "hospital" or "center"' 
    });
  }

  const sql = `
    UPDATE emergency_donations 
    SET status = 'awaiting_confirmation', 
        donor_donation_location = ?,
        hospital_id = ?,
        updated_at = NOW()
    WHERE request_id = ? AND donor_id = ?
  `;

  pool.query(sql, [donation_location, hospital_id || null, requestId, donor_id], (err, results) => {
    if (err) {
      console.error('❌ Error confirming donation:', err);
      return res.status(500).json({ error: 'Failed to confirm donation' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Donation record not found' });
    }

    // Send confirmation email to donor
    const selectSql = `
      SELECT ed.*, ebr.patient_email, ebr.blood_type 
      FROM emergency_donations ed
      JOIN emergency_blood_requests ebr ON ed.request_id = ebr.id
      WHERE ed.request_id = ? AND ed.donor_id = ?
    `;

    pool.query(selectSql, [requestId, donor_id], (selectErr, donations) => {
      if (!selectErr && donations.length > 0) {
        const donation = donations[0];
        sendDonorConfirmationEmail(donor_email, donation, donation_location);
        sendPatientConfirmationEmail(donation.patient_email, donation.blood_type);
      }

      res.json({
        success: true,
        message: 'Donation availability confirmed. Awaiting hospital confirmation.',
        request_id: requestId
      });
    });
  });
});

// ============================================
// 5️⃣ SEND DONOR CONFIRMATION EMAIL
// ============================================
function sendDonorConfirmationEmail(donorEmail, donation, location) {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL || 'blood.connect.donate@gmail.com',
    to: donorEmail,
    subject: '✅ Donation Confirmed - Thank You!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h1 style="margin: 0;">✅ THANK YOU FOR HELPING!</h1>
        </div>

        <div style="padding: 20px; background-color: #f5f5f5; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333;">Your Donation is Confirmed</h2>
          
          <p style="font-size: 16px; color: #555;">
            We have received your confirmation to donate <strong>${donation.blood_type}</strong> blood.
          </p>

          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0;">
            <p><strong>Donation Location:</strong> ${location === 'hospital' ? 'Hospital' : 'Blood Donation Center'}</p>
            <p><strong>Blood Type:</strong> ${donation.blood_type}</p>
            <p><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">AWAITING HOSPITAL CONFIRMATION</span></p>
          </div>

          <p style="font-size: 14px; color: #666;">
            The hospital will contact you shortly with specific timing and location details.
            <br><br>
            Your donation will save lives. Thank you for being a hero! ❤️
          </p>

          <div style="text-align: center; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">
              BloodConnect Team
            </p>
          </div>
        </div>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('❌ Error sending confirmation to donor:', err);
    } else {
      console.log('✅ Confirmation email sent to donor');
    }
  });
}

// ============================================
// 6️⃣ SEND PATIENT CONFIRMATION EMAIL
// ============================================
function sendPatientConfirmationEmail(patientEmail, bloodType) {
  const mailOptions = {
    from: process.env.NODEMAILER_EMAIL || 'blood.connect.donate@gmail.com',
    to: patientEmail,
    subject: '✅ Blood Donation Confirmed - Your Request is Being Fulfilled',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #4caf50; color: white; padding: 20px; text-align: center; border-radius: 8px;">
          <h1 style="margin: 0;">✅ DONATION CONFIRMED</h1>
        </div>

        <div style="padding: 20px; background-color: #f5f5f5; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333;">Great News!</h2>
          
          <p style="font-size: 16px; color: #555;">
            A compatible donor has confirmed their availability to help.
          </p>

          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4caf50; margin: 15px 0;">
            <p><strong>Blood Type:</strong> ${bloodType}</p>
            <p><strong>Status:</strong> <span style="color: #4caf50; font-weight: bold;">DONOR CONFIRMED</span></p>
          </div>

          <p style="font-size: 14px; color: #666;">
            The hospital will coordinate with the donor for the final pickup and delivery.
            <br><br>
            We will update you as soon as the blood is available.
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">

          <p style="font-size: 12px; color: #999;">
            BloodConnect Team
          </p>
        </div>
      </div>
    `
  };

  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      console.error('❌ Error sending confirmation to patient:', err);
    } else {
      console.log('✅ Confirmation email sent to patient');
    }
  });
}

// ============================================
// 7️⃣ GET EMERGENCY REQUEST STATUS
// ============================================
router.get('/emergency-requests/:requestId', (req, res) => {
  const { requestId } = req.params;

  const sql = `
    SELECT 
      ebr.*,
      COUNT(DISTINCT ed.id) as total_notified,
      SUM(CASE WHEN ed.status = 'confirmed' THEN 1 ELSE 0 END) as confirmed_count,
      SUM(CASE WHEN ed.status = 'rejected' THEN 1 ELSE 0 END) as rejected_count
    FROM emergency_blood_requests ebr
    LEFT JOIN emergency_donations ed ON ebr.id = ed.request_id
    WHERE ebr.id = ?
    GROUP BY ebr.id
  `;

  pool.query(sql, [requestId], (err, results) => {
    if (err) {
      console.error('❌ Error fetching request:', err);
      return res.status(500).json({ error: 'Failed to fetch request' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }

    res.json({
      request: results[0],
      donors_summary: {
        total_notified: results[0].total_notified || 0,
        confirmed: results[0].confirmed_count || 0,
        rejected: results[0].rejected_count || 0,
        pending: (results[0].total_notified || 0) - (results[0].confirmed_count || 0) - (results[0].rejected_count || 0)
      }
    });
  });
});

// ============================================
// 8️⃣ GET ALL EMERGENCY REQUESTS (ADMIN)
// ============================================
router.get('/emergency-requests', (req, res) => {
  const { status, governorate, blood_type } = req.query;

  let sql = 'SELECT * FROM emergency_blood_requests WHERE 1=1';
  const params = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }

  if (governorate) {
    sql += ' AND governorate = ?';
    params.push(governorate);
  }

  if (blood_type) {
    sql += ' AND blood_type = ?';
    params.push(blood_type);
  }

  sql += ' ORDER BY created_at DESC LIMIT 100';

  pool.query(sql, params, (err, results) => {
    if (err) {
      console.error('❌ Error fetching requests:', err);
      return res.status(500).json({ error: 'Failed to fetch requests' });
    }

    res.json({
      total: results.length,
      requests: results
    });
  });
});

// ============================================
// 9️⃣ UPDATE EMERGENCY REQUEST STATUS
// ============================================
router.patch('/emergency-requests/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  if (!['pending', 'fulfilled', 'cancelled', 'expired'].includes(status)) {
    return res.status(400).json({ 
      error: 'Invalid status. Must be: pending, fulfilled, cancelled, or expired' 
    });
  }

  const sql = `
    UPDATE emergency_blood_requests 
    SET status = ?, updated_at = NOW()
    WHERE id = ?
  `;

  pool.query(sql, [status, requestId], (err, results) => {
    if (err) {
      console.error('❌ Error updating request:', err);
      return res.status(500).json({ error: 'Failed to update request' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Emergency request not found' });
    }

    res.json({
      success: true,
      message: `Emergency request updated to ${status}`,
      request_id: requestId
    });
  });
});

// ============================================
// 🔟 BLOOD TYPE COMPATIBILITY HELPER
// ============================================
function getCompatibleDonors(patientBloodType) {
  const compatibility = {
    'O+': ['O+', 'O-'],
    'O-': ['O-'],
    'A+': ['A+', 'A-', 'O+', 'O-'],
    'A-': ['A-', 'O-'],
    'B+': ['B+', 'B-', 'O+', 'O-'],
    'B-': ['B-', 'O-'],
    'AB+': ['AB+', 'AB-', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-'],
    'AB-': ['AB-', 'A-', 'B-', 'O-']
  };

  return compatibility[patientBloodType] || [];
}

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================
router.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

module.exports = router;