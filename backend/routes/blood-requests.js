const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

console.log('[blood-requests.js] Setting up Brevo REST API...');

// ✅ Normalize governorate names to match frontend and database
const normalizeGovernorate = (governorate) => {
  if (!governorate) return '';
  
  const normalizationMap = {
    'akkar': 'Akkar',
    'محافظة عكار': 'Akkar',
    'عكار': 'Akkar',
    
    'baalbek': 'Baalbek-Hermel',
    'baalbak': 'Baalbek-Hermel',
    'hermel': 'Baalbek-Hermel',
    'محافظة بعلبك الهرمل': 'Baalbek-Hermel',
    'بعلبك': 'Baalbek-Hermel',
    'الهرمل': 'Baalbek-Hermel',
    'baalbek-hermel': 'Baalbek-Hermel',
    
    'beirut': 'Beirut',
    'beyrouth': 'Beirut',
    'محافظة بيروت': 'Beirut',
    'بيروت': 'Beirut',
    'hamra': 'Beirut',
    'ashrafieh': 'Beirut',
    'sin el fil': 'Beirut',
    'سن الفيل': 'Beirut',
    
    'beqaa': 'Beqaa',
    'bekaa': 'Beqaa',
    'محافظة البقاع': 'Beqaa',
    'البقاع': 'Beqaa',
    'chtaura': 'Beqaa',
    'chtoura': 'Beqaa',
    'zahle': 'Beqaa',
    'zahlé': 'Beqaa',
    'زحلة': 'Beqaa',
    
    'keserwan': 'Keserwan-Jbeil',
    'jbeil': 'Keserwan-Jbeil',
    'jbail': 'Keserwan-Jbeil',
    'محافظة كسروان جبيل': 'Keserwan-Jbeil',
    'كسروان': 'Keserwan-Jbeil',
    'جبيل': 'Keserwan-Jbeil',
    'jounieh': 'Keserwan-Jbeil',
    'juniyah': 'Keserwan-Jbeil',
    
    'mount lebanon': 'Mount Lebanon',
    'محافظة جبل لبنان': 'Mount Lebanon',
    'جبل لبنان': 'Mount Lebanon',
    'baabda': 'Mount Lebanon',
    'aley': 'Mount Lebanon',
    'chouf': 'Mount Lebanon',
    'شوف': 'Mount Lebanon',
    
    'nabatiyeh': 'Nabatiyeh',
    'nabatieh': 'Nabatiyeh',
    'محافظة النبطية': 'Nabatiyeh',
    'النبطية': 'Nabatiyeh',
    'bent jbail': 'Nabatiyeh',
    'bint jbail': 'Nabatiyeh',
    
    'north lebanon': 'North Lebanon',
    'محافظة الشمال': 'North Lebanon',
    'الشمال': 'North Lebanon',
    'tripoli': 'North Lebanon',
    'trablous': 'North Lebanon',
    'طرابلس': 'North Lebanon',
    'batrun': 'North Lebanon',
    'halba': 'North Lebanon',
    'البترون': 'North Lebanon',
    
    'south lebanon': 'South Lebanon',
    'محافظة الجنوب': 'South Lebanon',
    'الجنوب': 'South Lebanon',
    'sidon': 'South Lebanon',
    'saida': 'South Lebanon',
    'صيدا': 'South Lebanon',
    'tyre': 'South Lebanon',
    'sour': 'South Lebanon',
    'صور': 'South Lebanon',
    'jezzine': 'South Lebanon',
    'جزين': 'South Lebanon',
  };
  
  const normalized = normalizationMap[governorate.toLowerCase()];
  return normalized || governorate;
};

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
      const governorate = normalizeGovernorate(hospital.governorate);
      
      if (!governorate || governorate === 'Other') {
        console.error('[/blood-requests/create] Hospital has no valid governorate assigned');
        res.json({ success: true, requestId: result.insertId, warning: 'Hospital has no valid governorate' });
        return;
      }
      
      console.log('[/blood-requests/create] Hospital:', hospital.name, 'Raw governorate:', hospital.governorate, 'Normalized:', governorate);
      
      // Get compatible blood types
      const compatibleBloodTypes = getCompatibleDonors(blood_type);
      console.log('[/blood-requests/create] Compatible blood types:', compatibleBloodTypes);
      console.log('[/blood-requests/create] Filtering donors by governorate:', governorate);
      
      const donorQuery = `
        SELECT id, email, full_name FROM donors 
        WHERE blood_type IN (?) 
        AND governorate = ?
        AND is_eligible = 1
        LIMIT 50
      `;
      
      db.query(donorQuery, [compatibleBloodTypes, governorate], async (err, donors) => {
        if (err) {
          console.error('[/blood-requests/create] Donor query error:', err);
          res.json({ success: true, requestId: result.insertId });
          return;
        }

        console.log('[/blood-requests/create] Found donors in', governorate, ':', donors?.length || 0);

        // ✅ ALWAYS create an emergency_donations record for hospital requests
        // Even if no donors are found now, the request should exist
        const insertEmergencySql = `
          INSERT INTO emergency_donations 
          (donor_id, blood_type, patient_email, governorate, status, hospital_id) 
          VALUES (NULL, ?, ?, ?, 'pending', ?)
        `;
        db.query(insertEmergencySql, [blood_type, hospital.name, governorate, hospital_id], (err) => {
          if (err) console.error('[/blood-requests/create] Emergency donation insert error:', err);
          else console.log('[/blood-requests/create] ✅ Created emergency donation record for hospital request');
        });

        // Now try to notify matching donors if they exist
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
            }
          }
          
          console.log(`[/blood-requests/create] ✅ ${successCount}/${donors.length} donors notified`);
        } else {
          console.log('[/blood-requests/create] ⚠️ No matching donors found, but hospital request created');
        }

        res.json({ success: true, requestId: result.insertId });
      });
    });
  });
});

// GET /api/blood-requests/hospital/:hospitalId - Get emergency donations at this hospital
// Shows BOTH pending and awaiting_confirmation - deleted when confirmed
router.get('/hospital/:hospitalId', (req, res) => {
  const query = `
    SELECT ed.*, h.name as hospital_name, h.phone as hospital_phone, h.email as hospital_email,
           d.full_name as donor_name, d.email as donor_email
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    LEFT JOIN donors d ON ed.donor_id = d.id
    WHERE ed.hospital_id = ? 
    AND ed.status IN ('pending', 'awaiting_confirmation')
    ORDER BY ed.created_at DESC
  `;
  db.query(query, [req.params.hospitalId], (err, results) => {
    if (err) {
      console.error('Error fetching hospital donations:', err);
      return res.json([]);
    }
    console.log(`[/hospital/:hospitalId] Returning ${results?.length || 0} donations for hospital ${req.params.hospitalId}`);
    res.json(results || []);
  });
});

// ✅ GET /api/blood-requests/patient-emergencies/:donorId - ONLY patient emergencies (no hospital)
router.get('/patient-emergencies/:donorId', (req, res) => {
  const query = `
    SELECT ed.*, h.name as hospital_name
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    WHERE ed.donor_id = ? 
    AND ed.hospital_id IS NULL
    AND ed.status IN ('pending', 'awaiting_confirmation')
    ORDER BY ed.created_at DESC
  `;
  db.query(query, [req.params.donorId], (err, results) => {
    if (err) {
      console.error('Error fetching patient emergencies:', err);
      return res.json([]);
    }
    console.log(`[patient-emergencies] Returning ${results?.length || 0} patient emergencies for donor ${req.params.donorId}`);
    res.json(results || []);
  });
});

// ✅ GET /api/blood-requests/hospital-requests/:donorId - ONLY hospital requests (has hospital_id)
router.get('/hospital-requests/:donorId', (req, res) => {
  const query = `
    SELECT ed.*, h.name as hospital_name
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    WHERE ed.donor_id = ? 
    AND ed.hospital_id IS NOT NULL
    AND ed.status IN ('pending', 'awaiting_confirmation')
    ORDER BY ed.created_at DESC
  `;
  db.query(query, [req.params.donorId], (err, results) => {
    if (err) {
      console.error('Error fetching hospital requests:', err);
      return res.json([]);
    }
    console.log(`[hospital-requests] Returning ${results?.length || 0} hospital requests for donor ${req.params.donorId}`);
    res.json(results || []);
  });
});

// ✅ FIXED: GET /api/blood-requests/donor/:donorId - Get emergency requests for this donor
// Shows ONLY active requests (pending/awaiting) - deleted ones are gone
// Hospital requests have donor_id=NULL but are shown to all donors
router.get('/donor/:donorId', (req, res) => {
  const donorId = req.params.donorId;
  console.log(`\n[/donor/:donorId] 🔍 Fetching PATIENT emergency requests for donor ${donorId}`);
  
  // ✅ ONLY return PATIENT emergency requests
  // Patient requests have: donor_id = specific_id AND hospital_id = NULL or undefined
  // Hospital requests are NOT in emergency_donations - they're in blood_requests table!
  const query = `
    SELECT ed.*
    FROM emergency_donations ed
    WHERE ed.donor_id = ?
    AND (ed.hospital_id IS NULL OR ed.hospital_id = 0)
    ORDER BY ed.created_at DESC
  `;
  
  console.log(`[/donor/:donorId] Query: ${query}`);
  console.log(`[/donor/:donorId] Params: [${donorId}]`);
  
  db.query(query, [donorId], (err, results) => {
    if (err) {
      console.error('[/donor/:donorId] ❌ DB Error:', err);
      return res.json([]);
    }
    console.log(`[/donor/:donorId] ✅ Found ${results?.length || 0} PATIENT emergency requests`);
    if (results && results.length > 0) {
      results.forEach((r, idx) => {
        console.log(`  [${idx}] ID=${r.id}, donor_id=${r.donor_id}, blood_type=${r.blood_type}, status=${r.status}`);
      });
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

      res.json({ success: true, message: 'Donation location ok' });
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blood-requests/hospital-confirm - Hospital confirms donation + DELETE completely
router.post('/hospital-confirm', async (req, res) => {
  const { donationId, hospitalId, bloodType, patientEmail } = req.body

  console.log(`\n[hospital-confirm] 🎯 CONFIRM CALLED`)
  console.log(`[hospital-confirm] donationId=${donationId}, hospitalId=${hospitalId}, bloodType=${bloodType}, patientEmail=${patientEmail}`)

  if (!donationId || !patientEmail) {
    console.error('[hospital-confirm] ❌ Missing fields:', { donationId, patientEmail })
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // ✅ First get the request_id from this donation
    const getRequestSql = `SELECT request_id FROM emergency_donations WHERE id = ?`
    
    db.query(getRequestSql, [donationId], async (err, results) => {
      if (err) {
        console.error('[hospital-confirm] ❌ Error getting request_id:', err)
        return res.status(500).json({ error: 'Failed to confirm donation' })
      }

      if (!results || results.length === 0) {
        console.error('[hospital-confirm] ❌ Donation not found')
        return res.status(404).json({ error: 'Donation not found' })
      }

      const requestId = results[0].request_id;
      console.log(`[hospital-confirm] Found request_id: ${requestId}`)

      // ✅ DELETE ALL donations for this request_id
      const deleteAllSql = `
        DELETE FROM emergency_donations 
        WHERE request_id = ?
      `

      console.log(`[hospital-confirm] Deleting ALL donations for request_id=${requestId}`)

      db.query(deleteAllSql, [requestId], async (err, result) => {
        if (err) {
          console.error('[hospital-confirm] ❌ Database error:', err)
          return res.status(500).json({ error: 'Failed to confirm donation' })
        }

        console.log(`[hospital-confirm] Database result:`, result)
        console.log(`[hospital-confirm] ✅ Deleted ${result.affectedRows} donation records for request_id=${requestId}`)

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
    })
  } catch (error) {
    console.error('[hospital-confirm] Error:', error.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/blood-requests/admin-confirm - Admin (BCC Hamra) confirms center donation + DELETE completely
router.post('/admin-confirm', async (req, res) => {
  const { donationId, bloodType, patientEmail, donorName } = req.body

  console.log(`\n[admin-confirm] 🎯 CONFIRM CALLED`)
  console.log(`[admin-confirm] donationId=${donationId}, bloodType=${bloodType}, patientEmail=${patientEmail}`)

  if (!donationId || !patientEmail) {
    console.error('[admin-confirm] ❌ Missing fields:', { donationId, patientEmail })
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    // ✅ DELETE this donation completely
    const deleteSql = `
      DELETE FROM emergency_donations 
      WHERE id = ?
    `

    console.log(`[admin-confirm] Executing SQL: DELETE FROM emergency_donations WHERE id = ${donationId}`)

    db.query(deleteSql, [donationId], async (err, result) => {
      if (err) {
        console.error('[admin-confirm] ❌ Database error:', err)
        return res.status(500).json({ error: 'Failed to confirm donation' })
      }

      console.log(`[admin-confirm] Database result:`, result)
      console.log(`[admin-confirm] Affected rows: ${result.affectedRows}`)

      if (result.affectedRows === 0) {
        console.error('[admin-confirm] ❌ No rows affected - donation not found')
        return res.status(404).json({ error: 'Donation not found' })
      }

      console.log(`[admin-confirm] ✅ Successfully deleted donation ${donationId}`)

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
    AND ed.status IN ('awaiting_confirmation', 'ok')
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