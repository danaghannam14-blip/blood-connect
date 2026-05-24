const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

console.log('[blood-requests.js] Setting up Brevo REST API...');

// ✅ Send email via Brevo REST API
const sendEmailViaBrevo = async (toEmail, toName, subject, htmlContent) => {
  try {
    await axios.post('https://api.brevo.com/v3/smtp/email', {
      to: [{ email: toEmail, name: toName }],
      sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
      subject: subject,
      htmlContent: htmlContent
    }, {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log(`✅ Email sent to ${toEmail}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending to ${toEmail}:`, error.message);
    return false;
  }
};

// Blood type compatibility
const getCompatibleDonors = (bloodType) => {
  const compatibility = {
    'O-': ['O-'],
    'O+': ['O-', 'O+'],
    'A-': ['O-', 'A-'],
    'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'],
    'B+': ['O-', 'O+', 'B-', 'B+'],
    'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  };
  return compatibility[bloodType] || [];
};

// POST /api/blood-requests/create-emergency
router.post('/create-emergency', async (req, res) => {
  try {
    const { patient_email, blood_type, governorate } = req.body;

    if (!patient_email || !blood_type || !governorate) {
      return res.status(400).json({ error: 'patient_email, blood_type, and governorate required' });
    }

    const compatibleBloodTypes = getCompatibleDonors(blood_type);

    const donorSql = `
      SELECT id, full_name, email FROM donors 
      WHERE blood_type IN (?) 
      AND governorate = ? 
      AND is_eligible = 1
      LIMIT 100
    `;

    db.query(donorSql, [compatibleBloodTypes, governorate], async (err, donors) => {
      if (err || !donors || donors.length === 0) {
        return res.json({ message: 'No donors found', donorsNotified: 0 });
      }

      console.log(`📝 Emergency: ${blood_type} in ${governorate}, ${donors.length} donors`);

      let successCount = 0;
      for (let i = 0; i < donors.length; i++) {
        const donor = donors[i];
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc2626; margin: 0 0 20px 0;">🩸 Emergency Blood Request</h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0;">Hi <strong>${donor.full_name}</strong>,</p>
              <p style="margin: 0 0 10px 0;">
                A patient urgently needs <strong style="font-size: 16px; color: #dc2626;">${blood_type}</strong> blood 
                in <strong style="font-size: 16px; color: #1f2937;">${governorate}</strong>.
              </p>
            </div>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; font-weight: bold; color: #991b1b;">
                ⚠️ Your blood type matches! Please respond as soon as possible.
              </p>
            </div>
            
            <p style="margin: 20px 0; color: #4b5563;">
              Every blood donation saves lives. Your generosity can make a real difference in someone's life.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280; margin: 0;">
              This is an automated message from BloodConnect Lebanon<br>
              For more information, visit <a href="https://bloodconnect.lb" style="color: #dc2626;">bloodconnect.lb</a>
            </p>
          </div>
        `;

        const sent = await sendEmailViaBrevo(donor.email, donor.full_name, `🩸 URGENT: ${blood_type} blood needed in ${governorate}`, emailHtml);

        if (sent) {
          successCount++;
          const insertSql = `INSERT INTO emergency_donations (donor_id, blood_type, patient_email, governorate, status) VALUES (?, ?, ?, ?, 'pending')`;
          db.query(insertSql, [donor.id, blood_type, patient_email, governorate], () => {});
        }
      }

      res.json({ message: `${successCount}/${donors.length} donors notified`, donorsNotified: successCount });
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blood-requests/create
router.post('/create', async (req, res) => {
  const { hospital_id, blood_type, quantity_needed, urgency } = req.body;

  if (!hospital_id || !blood_type || !quantity_needed) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  console.log('[/blood-requests/create] Creating request:', { hospital_id, blood_type, quantity_needed });

  const query = `INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed, urgency, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())`;

  db.query(query, [hospital_id, blood_type, quantity_needed, urgency || 'urgent'], async (err, result) => {
    if (err) {
      console.error('[/blood-requests/create] DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    console.log('[/blood-requests/create] Request created with ID:', result.insertId);

    const hospitalQuery = 'SELECT name, id, governorate FROM hospitals WHERE id = ?';
    db.query(hospitalQuery, [hospital_id], async (err, hospitalResults) => {
      if (err) {
        console.error('[/blood-requests/create] Hospital query error:', err);
        return;
      }

      if (!hospitalResults || !hospitalResults.length) {
        console.error('[/blood-requests/create] Hospital not found');
        res.json({ success: true, requestId: result.insertId });
        return;
      }

      const hospital = hospitalResults[0];
      const governorate = hospital.governorate || 'Beirut';
      
      console.log('[/blood-requests/create] Hospital:', hospital.name, 'Governorate:', governorate);
      
      // Get compatible blood types
      const compatibleBloodTypes = getCompatibleDonors(blood_type);
      console.log('[/blood-requests/create] Compatible blood types:', compatibleBloodTypes);
      
      const donorQuery = `
        SELECT id, email, full_name FROM donors 
        WHERE blood_type IN (?) 
        AND is_eligible = 1
        LIMIT 50
      `;
      
      db.query(donorQuery, [compatibleBloodTypes], async (err, donors) => {
        if (err) {
          console.error('[/blood-requests/create] Donor query error:', err);
          res.json({ success: true, requestId: result.insertId });
          return;
        }

        console.log('[/blood-requests/create] Found donors:', donors?.length || 0);

        if (donors && donors.length) {
          let successCount = 0;
          for (let i = 0; i < donors.length; i++) {
            const donor = donors[i];
            
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc2626; margin: 0 0 20px 0;">🩸 Emergency Blood Request</h2>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;">Hi <strong>${donor.full_name}</strong>,</p>
                  <p style="margin: 0 0 10px 0;">
                    <strong style="font-size: 16px; color: #dc2626;">${hospital.name}</strong> urgently needs 
                    <strong style="font-size: 16px; color: #dc2626;">${blood_type}</strong> blood 
                    (<strong>${quantity_needed} units</strong>).
                  </p>
                </div>
                
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-weight: bold; color: #991b1b;">
                    ⚠️ Your blood type matches! Please respond as soon as possible.
                  </p>
                </div>
                
                <p style="margin: 20px 0; color: #4b5563;">
                  Every blood donation saves lives. Your generosity can make a real difference in someone's life.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #6b7280; margin: 0;">
                  This is an automated message from BloodConnect Lebanon<br>
                  For more information, visit <a href="https://bloodconnect.lb" style="color: #dc2626;">bloodconnect.lb</a>
                </p>
              </div>
            `;
            
            const sent = await sendEmailViaBrevo(
              donor.email, 
              donor.full_name, 
              `🩸 URGENT: ${hospital.name} needs ${blood_type} blood`, 
              emailHtml
            );

            if (sent) {
              successCount++;
              // Create emergency donation record
              const insertEmergencySql = `
                INSERT INTO emergency_donations 
                (donor_id, blood_type, patient_email, governorate, status, hospital_id) 
                VALUES (?, ?, ?, ?, 'pending', ?)
              `;
              db.query(insertEmergencySql, [donor.id, blood_type, hospital.name, governorate, hospital_id], (err) => {
                if (err) console.error('[/blood-requests/create] Emergency donation insert error:', err);
              });
            }
          }
          
          console.log(`[/blood-requests/create] ✅ ${successCount}/${donors.length} donors notified`);
        }

        res.json({ success: true, requestId: result.insertId });
      });
    });
  });
});

// GET /api/blood-requests/hospital/:hospitalId - Get emergency donations at this hospital
router.get('/hospital/:hospitalId', (req, res) => {
  const query = `
    SELECT ed.*, h.name as hospital_name, h.phone as hospital_phone, h.email as hospital_email,
           d.full_name as donor_name, d.email as donor_email
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    LEFT JOIN donors d ON ed.donor_id = d.id
    WHERE ed.hospital_id = ? 
    AND ed.status IN ('awaiting_confirmation', 'confirmed')
    ORDER BY ed.created_at DESC
  `;
  db.query(query, [req.params.hospitalId], (err, results) => {
    if (err) {
      console.error('Error fetching hospital donations:', err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// GET /api/blood-requests/donor/:donorId - Get emergency requests for this donor
router.get('/donor/:donorId', (req, res) => {
  const query = `
    SELECT * FROM emergency_donations 
    WHERE donor_id = ? 
    ORDER BY created_at DESC
  `;
  db.query(query, [req.params.donorId], (err, results) => {
    if (err) {
      console.error('Error fetching donor notifications:', err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// POST /api/blood-requests/donor-confirm-donation - Donor chooses center or hospital
router.post('/donor-confirm-donation', async (req, res) => {
  try {
    const { notification_id, donation_location, hospital_id } = req.body;

    if (!notification_id || !donation_location) {
      return res.status(400).json({ error: 'notification_id and donation_location required' });
    }

    if (donation_location === 'hospital' && !hospital_id) {
      return res.status(400).json({ error: 'hospital_id required for hospital donation' });
    }

    const updateSql = `
      UPDATE emergency_donations 
      SET status = 'awaiting_confirmation', 
          donor_donation_location = ?,
          hospital_id = ?
      WHERE id = ?
    `;

    db.query(updateSql, [donation_location, hospital_id || null, notification_id], (err) => {
      if (err) {
        console.error('Error updating donation:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ success: true, message: 'Donation location confirmed' });
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blood-requests/hospital-confirm - Hospital confirms donation + email patient
router.post('/hospital-confirm', async (req, res) => {
  const { donationId, hospitalId, bloodType, patientEmail } = req.body

  if (!donationId || !patientEmail) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Update ONLY this specific donation by ID
    const updateSql = `
      UPDATE emergency_donations 
      SET status = 'confirmed'
      WHERE id = ?
    `

    db.query(updateSql, [donationId], async (err, result) => {
      if (err) {
        console.error('[hospital-confirm] Database error:', err)
        return res.status(500).json({ error: 'Failed to confirm donation' })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Donation not found' })
      }

      // ✅ Get hospital name for email
      const hospitalQuery = 'SELECT name FROM hospitals WHERE id = ?'
      db.query(hospitalQuery, [hospitalId], async (err, hospitals) => {
        const hospitalName = hospitals && hospitals.length > 0 ? hospitals[0].name : 'Your Hospital'

        // ✅ Send email to patient confirming donation
        const sendEmail = async () => {
          try {
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #22c55e;">✅ Blood Donation Confirmed!</h2>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p>Good news! A compatible donor has successfully donated <strong>${bloodType}</strong> blood for your emergency case.</p>
                </div>
                
                <div style="background: #ecfdf5; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; font-weight: bold; color: #1f2937;">🏥 Donation Location: ${hospitalName}</p>
                  <p style="margin: 8px 0 0; color: #666;">The blood is now available for your treatment.</p>
                </div>
                
                <p>Thank you for trusting BloodConnect with your emergency blood needs. Your health and safety are our priority.</p>
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p style="font-size: 12px; color: #666; margin: 0;">
                  This is an automated message from BloodConnect. Please do not reply to this email.
                </p>
              </div>
            `

            await axios.post('https://api.brevo.com/v3/smtp/email', {
              to: [{ email: patientEmail }],
              sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
              subject: `✅ Blood Donation Confirmed - ${bloodType}`,
              htmlContent: emailHtml
            }, {
              headers: {
                'api-key': process.env.BREVO_API_KEY,
                'Content-Type': 'application/json'
              },
              timeout: 10000
            })

            console.log(`[hospital-confirm] ✅ Email sent to patient: ${patientEmail}`)
          } catch (emailErr) {
            console.error(`[hospital-confirm] ❌ Error sending email to ${patientEmail}:`, emailErr.message)
          }
        }

        await sendEmail()
        res.json({ message: '✅ Donation confirmed and patient notified!' })
      })
    })
  } catch (error) {
    console.error('[hospital-confirm] Error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/blood-requests/admin-confirm - Admin (BCC Hamra) confirms center donation + email patient
router.post('/admin-confirm', async (req, res) => {
  const { donationId, bloodType, patientEmail, donorName } = req.body

  if (!donationId || !patientEmail) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // Update ONLY this specific donation by ID
    const updateSql = `
      UPDATE emergency_donations 
      SET status = 'confirmed'
      WHERE id = ?
    `

    db.query(updateSql, [donationId], async (err, result) => {
      if (err) {
        console.error('[admin-confirm] Database error:', err)
        return res.status(500).json({ error: 'Failed to confirm donation' })
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Donation not found' })
      }

      // ✅ Send email to patient confirming donation at BCC Hamra Center
      const sendEmail = async () => {
        try {
          const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #22c55e;">✅ Blood Donation Confirmed!</h2>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p>Good news! A compatible donor has successfully donated <strong>${bloodType}</strong> blood for your emergency case.</p>
              </div>
              
              <div style="background: #ecfdf5; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #1f2937;">👑 Donation Location: BCC Hamra Center, Beirut</p>
                <p style="margin: 8px 0 0; color: #666;">The blood is now available for your treatment. Our team has verified the donation quality and availability.</p>
              </div>
              
              <p>Thank you for trusting BloodConnect with your emergency blood needs. Your health and safety are our priority.</p>
              
              <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
              <p style="font-size: 12px; color: #666; margin: 0;">
                This is an automated message from BloodConnect. Please do not reply to this email.
              </p>
            </div>
          `

          await axios.post('https://api.brevo.com/v3/smtp/email', {
            to: [{ email: patientEmail }],
            sender: { email: 'blood.connect.donate@gmail.com', name: 'BloodConnect' },
            subject: `✅ Blood Donation Confirmed - ${bloodType}`,
            htmlContent: emailHtml
          }, {
            headers: {
              'api-key': process.env.BREVO_API_KEY,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          })

          console.log(`[admin-confirm] ✅ Email sent to patient: ${patientEmail}`)
        } catch (emailErr) {
          console.error(`[admin-confirm] ❌ Error sending email to ${patientEmail}:`, emailErr.message)
        }
      }

      await sendEmail()
      res.json({ message: '✅ Donation confirmed and patient notified!' })
    })
  } catch (error) {
    console.error('[admin-confirm] Error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/blood-requests/center-donations - Get donations at BCC Hamra (Beirut only)
router.get('/center-donations', (req, res) => {
  const query = `
    SELECT ed.*, d.full_name as donor_name, d.email as donor_email
    FROM emergency_donations ed
    LEFT JOIN donors d ON ed.donor_id = d.id
    WHERE ed.donor_donation_location = 'center'
    AND ed.status IN ('awaiting_confirmation', 'confirmed')
    ORDER BY ed.created_at DESC
  `;
  db.query(query, [], (err, results) => {
    if (err) {
      console.error('Error fetching center donations:', err);
      return res.json([]);
    }
    res.json(results || []);
  });
});

// DELETE - Delete emergency request
router.delete('/:requestId', (req, res) => {
  const query = `DELETE FROM emergency_donations WHERE id = ?`;
  db.query(query, [req.params.requestId], (err) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ success: true });
  });
});

// ✅ GET ALL EMERGENCY DONATIONS (for admin dashboard)
router.get('/all-emergency-donations', (req, res) => {
  const sql = `
    SELECT 
      ed.id,
      ed.donor_id,
      d.full_name as donor_name,
      ed.blood_type,
      ed.patient_email,
      ed.governorate,
      ed.status,
      ed.donor_donation_location,
      h.name as hospital_name,
      ed.hospital_id,
      ed.created_at
    FROM emergency_donations ed
    LEFT JOIN donors d ON ed.donor_id = d.id
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    ORDER BY ed.created_at DESC
    LIMIT 200
  `

  db.query(sql, (err, results) => {
    if (err) {
      console.error('[all-emergency-donations] Error:', err)
      return res.status(500).json({ error: 'Error fetching donations' })
    }
    res.json(results || [])
  })
})

console.log('[blood-requests.js] ✅ Routes registered');

module.exports = router;