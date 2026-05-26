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

router.post('/create', async (req, res) => {
  const { hospital_id, blood_type, quantity_needed, urgency } = req.body;

  if (!hospital_id || !blood_type || !quantity_needed) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  console.log('[/blood-requests/create] Creating hospital request:', { hospital_id, blood_type, quantity_needed });

  // ✅ INSERT INTO emergency_donations with donor_id = NULL (generic hospital request)
  const query = `
    INSERT INTO emergency_donations 
    (hospital_id, blood_type, donor_id, status, created_at) 
    VALUES (?, ?, NULL, 'pending', NOW())
  `;

  db.query(query, [hospital_id, blood_type], async (err, result) => {
    if (err) {
      console.error('[/blood-requests/create] DB error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    const requestId = result.insertId;
    console.log('[/blood-requests/create] Hospital request created with ID:', requestId);

    // Get hospital info to send emails to matching donors
    const hospitalQuery = 'SELECT name, id, governorate FROM hospitals WHERE id = ?';
    db.query(hospitalQuery, [hospital_id], async (err, hospitalResults) => {
      if (err) {
        console.error('[/blood-requests/create] Hospital query error:', err);
        return res.json({ success: true, requestId: result.insertId });
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
      
      console.log('[/blood-requests/create] Hospital:', hospital.name, 'Governorate:', governorate);
      
      const compatibleBloodTypes = getCompatibleDonors(blood_type);
      console.log('[/blood-requests/create] Compatible blood types:', compatibleBloodTypes);
      
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
          return res.json({ success: true, requestId: result.insertId });
        }

        console.log('[/blood-requests/create] Found', donors?.length || 0, 'donors in', governorate);

        if (donors && donors.length) {
          let successCount = 0;
          for (let i = 0; i < donors.length; i++) {
            const donor = donors[i];
            
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #dc2626; margin: 0 0 20px 0;">🩸 Blood Request</h2>
                
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0 0 10px 0;">Hi <strong>${donor.full_name}</strong>,</p>
                  <p style="margin: 0 0 10px 0;">
                    <strong style="font-size: 16px; color: #dc2626;">${hospital.name}</strong> needs 
                    <strong style="font-size: 16px; color: #dc2626;">${blood_type}</strong> blood.
                  </p>
                </div>
                
                <p style="margin: 20px 0; color: #4b5563;">Every donation saves lives. Thank you!</p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="font-size: 12px; color: #6b7280; margin: 0;">
                  This is an automated message from BloodConnect Lebanon
                </p>
              </div>
            `;
            
            const sent = await sendEmailViaBrevo(
              donor.email,
              donor.full_name,
              `🩸 ${hospital.name} needs ${blood_type} blood`,
              emailHtml
            );
            
            if (sent) {
              successCount++;
            }
          }
          
          console.log(`[/blood-requests/create] ✅ ${successCount}/${donors.length} emails sent`);
        }

        res.json({ success: true, requestId: result.insertId });
      });
    });
  });
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
          console.log('[/blood-requests/create] ⚠️ No matching donors found');
        }

        res.json({ success: true, requestId: result.insertId });
      });
    });
  });
});

// ✅ GET /api/blood-requests/hospital/:hospitalId - Get emergency donations at this hospital
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

// ✅ GET /api/blood-requests/hospital-requests/:donorId - ONLY hospital posted requests
// Hospital posted requests have: donor_id = NULL, status = 'pending'
// NOT emergency donations where donor chose a hospital
router.get('/hospital-requests/:donorId', (req, res) => {
  const query = `
    SELECT ed.*, h.name as hospital_name
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    WHERE ed.donor_id IS NULL
    AND ed.hospital_id IS NOT NULL
    AND ed.status = 'pending'
    ORDER BY ed.created_at DESC
  `;
  db.query(query, [req.params.donorId], (err, results) => {
    if (err) {
      console.error('Error fetching hospital requests:', err);
      return res.json([]);
    }
    console.log(`[hospital-requests] Returning ${results?.length || 0} hospital blood requests for donor ${req.params.donorId}`);
    res.json(results || []);
  });
});

// ✅ FIXED: GET /api/blood-requests/donor/:donorId - Get ALL emergency donations for THIS donor
// Shows BOTH pending and awaiting_confirmation states
// Does NOT filter by hospital_id (show regardless of whether hospital was chosen)
router.get('/donor/:donorId', (req, res) => {
  const donorId = req.params.donorId;
  console.log(`\n[/donor/:donorId] 🔍 Fetching emergency donations for donor ${donorId}`);
  
  const query = `
    SELECT ed.*
    FROM emergency_donations ed
    WHERE ed.donor_id = ?
    AND ed.status IN ('pending', 'awaiting_confirmation')
    ORDER BY ed.created_at DESC
  `;
  
  console.log(`[/donor/:donorId] Query: Fetch all donations for donor ${donorId}`);
  
  db.query(query, [donorId], (err, results) => {
    if (err) {
      console.error('[/donor/:donorId] ❌ DB Error:', err);
      return res.json([]);
    }
    console.log(`[/donor/:donorId] ✅ Found ${results?.length || 0} emergency donations`);
    if (results && results.length > 0) {
      results.forEach((r, idx) => {
        console.log(`  [${idx}] ID=${r.id}, donor_id=${r.donor_id}, blood_type=${r.blood_type}, status=${r.status}, hospital_id=${r.hospital_id}`);
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

    console.log(`[donor-confirm-donation] Donor ${notification_id} chose ${donation_location}${hospital_id ? ' at hospital ' + hospital_id : ''}`);

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

      console.log(`[donor-confirm-donation] ✅ Updated donation ${notification_id} to status "awaiting_confirmation"`);
      res.json({ success: true, message: 'Donation location confirmed' });
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/blood-requests/hospital-confirm - Hospital confirms donation
router.post('/hospital-confirm', async (req, res) => {
  const { donationId, hospitalId, bloodType, patientEmail } = req.body

  console.log(`\n[hospital-confirm] 🎯 CONFIRM CALLED`)
  console.log(`[hospital-confirm] donationId=${donationId}, hospitalId=${hospitalId}, bloodType=${bloodType}, patientEmail=${patientEmail}`)

  if (!donationId || !patientEmail) {
    console.error('[hospital-confirm] ❌ Missing fields:', { donationId, patientEmail })
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const deleteSql = `
      DELETE FROM emergency_donations 
      WHERE id = ?
    `

    console.log(`[hospital-confirm] Deleting emergency donation ${donationId}`)

    db.query(deleteSql, [donationId], async (err, result) => {
      if (err) {
        console.error('[hospital-confirm] ❌ Database error:', err)
        return res.status(500).json({ error: 'Failed to confirm donation' })
      }

      console.log(`[hospital-confirm] ✅ Deleted donation ${donationId}`)

      const hospitalQuery = 'SELECT name FROM hospitals WHERE id = ?'
      db.query(hospitalQuery, [hospitalId], async (err, hospitals) => {
        const hospitalName = hospitals && hospitals.length > 0 ? hospitals[0].name : 'Your Hospital'

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

// POST /api/blood-requests/admin-confirm - Admin confirms center donation
router.post('/admin-confirm', async (req, res) => {
  const { donationId, bloodType, patientEmail, donorName } = req.body

  console.log(`\n[admin-confirm] 🎯 CONFIRM CALLED`)
  console.log(`[admin-confirm] donationId=${donationId}, bloodType=${bloodType}, patientEmail=${patientEmail}`)

  if (!donationId || !patientEmail) {
    console.error('[admin-confirm] ❌ Missing fields:', { donationId, patientEmail })
    return res.status(400).json({ error: 'Missing required fields' })
  }

  try {
    const deleteSql = `
      DELETE FROM emergency_donations 
      WHERE id = ?
    `

    console.log(`[admin-confirm] Executing DELETE from emergency_donations WHERE id = ${donationId}`)

    db.query(deleteSql, [donationId], async (err, result) => {
      if (err) {
        console.error('[admin-confirm] ❌ Database error:', err)
        return res.status(500).json({ error: 'Failed to confirm donation' })
      }

      console.log(`[admin-confirm] ✅ Successfully deleted donation ${donationId}`)

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

// GET /api/blood-requests/center-donations - Get donations at BCC Hamra
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

// GET ALL EMERGENCY DONATIONS (for admin)
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

console.log('[blood-requests.js] ✅ All routes registered');

module.exports = router;