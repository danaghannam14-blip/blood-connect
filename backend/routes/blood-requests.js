const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

console.log('[blood-requests.js] Setting up Brevo REST API...');

// ✅ Normalize governorate names (English & Arabic)
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
    'الصنايع, محافظة بيروت': 'Beirut',
    'الصنايع': 'Beirut',
    'صنايع': 'Beirut',
    'حمراء': 'Beirut',
    'الحمراء': 'Beirut',
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
    'keserwan-jbeil': 'Keserwan-Jbeil',
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
  
  const normalized = normalizationMap[governorate.toLowerCase().trim()];
  return normalized || governorate;
};

// ✅ Send email via Brevo REST API
const sendEmailViaBrevo = async (toEmail, toName, subject, htmlContent) => {
  try {
    console.log(`[Brevo] Attempting to send email to ${toEmail}...`);
    console.log(`[Brevo] API Key present: ${process.env.BREVO_API_KEY ? 'YES' : 'NO'}`);
    
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
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
    console.error(`❌ Error sending to ${toEmail}:`);
    console.error(`   Status: ${error.response?.status}`);
    console.error(`   Message: ${error.message}`);
    console.error(`   Data: ${JSON.stringify(error.response?.data)}`);
    return false;
  }
};

// ✅ Blood type compatibility
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

// ════════════════════════════════════════════════════════════════════════════
// ✅ PUT ROUTE - Update blood request status (BEFORE DELETE!)
// ════════════════════════════════════════════════════════════════════════════
router.put('/:requestId', (req, res) => {
  const requestId = req.params.requestId;
  const { status } = req.body;

  if (!requestId || !status) {
    return res.status(400).json({ error: 'Request ID and status required' });
  }

  try {
    console.log(`[PUT /:requestId] Updating request ${requestId} to status: ${status}`);

    const updateSql = `UPDATE blood_requests SET status = ? WHERE id = ?`;

    db.query(updateSql, [status, requestId], (err, result) => {
      if (err) {
        console.error('[PUT /:requestId] ❌ Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log(`[PUT /:requestId] ✅ Request ${requestId} updated to status: ${status}`);
      res.json({ success: true, message: `Request updated to status: ${status}` });
    });
  } catch (error) {
    console.error('[PUT /:requestId] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ DELETE ROUTE - MOVED TO TOP (MUST BE BEFORE GET :requestId ROUTES!)
// ════════════════════════════════════════════════════════════════════════════
router.delete('/:requestId', (req, res) => {
  const requestId = req.params.requestId;

  if (!requestId) {
    return res.status(400).json({ error: 'Request ID required' });
  }

  try {
    console.log(`[DELETE /:requestId] Deleting request ${requestId}`);

    const deleteSql = `DELETE FROM blood_requests WHERE id = ?`;

    db.query(deleteSql, [requestId], (err) => {
      if (err) {
        console.error('[DELETE /:requestId] ❌ Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log(`[DELETE /:requestId] ✅ Request ${requestId} deleted from all dashboards`);
      res.json({ success: true, message: 'Request deleted successfully' });
    });
  } catch (error) {
    console.error('[DELETE /:requestId] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ CASE 1: EMERGENCY REQUEST (Patient posts) - FIXED CASE-INSENSITIVE
// ════════════════════════════════════════════════════════════════════════════
router.post('/create-emergency', async (req, res) => {
  const { patient_email, blood_type, governorate } = req.body;

  if (!patient_email || !blood_type) {
    return res.status(400).json({ message: 'Missing patient email or blood type' });
  }

  if (!/\S+@\S+\.\S+/.test(patient_email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    console.log('\n[create-emergency] 🆘 Emergency request received:', { patient_email, blood_type, governorate });

    const insertSql = `
      INSERT INTO emergency_donations 
      (blood_type, patient_email, governorate, status, donor_id, hospital_id, request_type, created_at)
      VALUES (?, ?, ?, 'pending', NULL, NULL, 'emergency', NOW())
    `;

    db.query(insertSql, [blood_type, patient_email, governorate || ''], (err, result) => {
      if (err) {
        console.error('[create-emergency] ❌ Database error:', err);
        return res.status(500).json({ message: 'Database error: ' + err.message });
      }

      const requestId = result.insertId;
      console.log('[create-emergency] ✅ Emergency request created with ID:', requestId);

      const compatibleBloodTypes = getCompatibleDonors(blood_type);
      let filterGovernorate = governorate ? normalizeGovernorate(governorate) : 'Beirut';
      
      console.log('[create-emergency] Looking for donors:', { blood_types: compatibleBloodTypes, governorate: filterGovernorate });

      const placeholders = compatibleBloodTypes.map(() => '?').join(',');
      // ✅ FIXED: ALWAYS filter by governorate (never search all)
      const donorQuery = `
        SELECT id, email, full_name 
        FROM donors 
        WHERE blood_type IN (${placeholders})
        AND LOWER(governorate) = LOWER(?)
        AND LOWER(TRIM(governorate)) = LOWER(?)
       AND COALESCE(email, '') != ''
        AND is_eligible = 1
        LIMIT 100
      `;
      
      const params = [...compatibleBloodTypes, filterGovernorate];
      
      console.log('[create-emergency] ✅ Using case-insensitive filter for governorate:', filterGovernorate);
      console.log('[create-emergency] Query params:', params);

      db.query(donorQuery, params, async (err, donors) => {
        if (err) {
          console.error('[create-emergency] ❌ Donor query error:', err);
          return res.json({ 
            success: true, 
            requestId: requestId, 
            donorsNotified: 0,
            message: 'Emergency request created but error finding donors'
          });
        }

        console.log('[create-emergency] ✅ Found', donors?.length || 0, 'matching donors');

        let successCount = 0;
        
        if (donors && donors.length > 0) {
          for (let i = 0; i < donors.length; i++) {
            const donor = donors[i];
            
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
                <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                  <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 40px; margin-bottom: 10px;">🩸</div>
                    <h2 style="color: #dc2626; margin: 0; font-size: 24px;">EMERGENCY Blood Request</h2>
                  </div>
                  
                  <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #991b1b; font-weight: bold; font-size: 16px;">
                      ⚠️ Your blood type matches!
                    </p>
                    <p style="margin: 10px 0 0 0; color: #7f1d1d;">
                      A patient urgently needs <strong>${blood_type}</strong> blood
                    </p>
                  </div>
                  
                  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 15px 0; color: #374151; line-height: 1.6;">
                      Hi <strong>${donor.full_name}</strong>,
                    </p>
                    <p style="margin: 0 0 10px 0; color: #4b5563; line-height: 1.6;">
                      A patient in <strong>${governorate || 'Lebanon'}</strong> urgently needs blood type 
                      <span style="background: white; padding: 2px 8px; border-radius: 4px; font-weight: bold; color: #dc2626;">
                        ${blood_type}
                      </span>
                    </p>
                    <p style="margin: 0; color: #4b5563; line-height: 1.6;">
                      This is a critical emergency. Your donation could save a life today.
                    </p>
                  </div>
                  
                  <p style="margin: 20px 0; color: #6b7280; line-height: 1.6;">
                    If you can help, please reply to this email or contact us immediately. Every minute counts in emergencies.
                  </p>
                  
                  <div style="background: #ecfdf5; border: 1px solid #d1fae5; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                    <p style="margin: 0; color: #065f46; font-weight: bold;">
                      Thank you for being a lifesaver! 💚
                    </p>
                  </div>
                  
                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                  <p style="font-size: 12px; color: #9ca3af; margin: 0; text-align: center;">
                    This is an automated message from BloodConnect Lebanon<br>
                    Patient Email: <strong>${patient_email}</strong>
                  </p>
                </div>
              </div>
            `;
            
            const sent = await sendEmailViaBrevo(
              donor.email,
              donor.full_name,
              `🩸 EMERGENCY: Patient needs ${blood_type} blood - URGENT RESPONSE NEEDED`,
              emailHtml
            );
            
            if (sent) successCount++;
          }
          
          console.log(`[create-emergency] ✅ Email batch complete: ${successCount}/${donors.length} sent successfully`);
        }

        res.json({
          success: true,
          requestId: requestId,
          donorsNotified: successCount,
          message: `Emergency request created. Notified ${successCount} donors.`
        });
      });
    });

  } catch (error) {
    console.error('[create-emergency] ❌ Server error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ CASE 2: HOSPITAL REQUEST (Hospital posts) - FIXED CASE-INSENSITIVE
// ════════════════════════════════════════════════════════════════════════════
router.post('/create-hospital', async (req, res) => {
  const { hospital_id, blood_type, quantity_needed, urgency } = req.body;

  if (!hospital_id || !blood_type || !quantity_needed) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log('\n[create-hospital] 🏥 Hospital request received:', { hospital_id, blood_type, quantity_needed });

    const hospitalQuery = 'SELECT name, governorate, id FROM hospitals WHERE id = ?';
    
    db.query(hospitalQuery, [hospital_id], async (err, hospitalResults) => {
      if (err || !hospitalResults || !hospitalResults.length) {
        console.error('[create-hospital] Hospital not found');
        return res.status(400).json({ error: 'Hospital not found' });
      }

      const hospital = hospitalResults[0];
      const hospitalGovernorate = hospital.governorate || '';
      
      if (!hospitalGovernorate || hospitalGovernorate.trim() === '') {
        console.error('[create-hospital] Hospital has no valid governorate');
        return res.status(400).json({ error: 'Hospital has no valid governorate assigned' });
      }
      
      console.log('[create-hospital] Hospital:', hospital.name, 'Governorate:', hospitalGovernorate);

      const insertSql = `
        INSERT INTO blood_requests 
        (hospital_id, blood_type, quantity_needed, urgency, status, created_at)
        VALUES (?, ?, ?, ?, 'pending', NOW())
      `;

      db.query(insertSql, [hospital_id, blood_type, quantity_needed, urgency || 'urgent'], (err, result) => {
        if (err) {
          console.error('[create-hospital] ❌ Database error:', err);
          return res.status(500).json({ error: 'Database error: ' + err.message });
        }

        const requestId = result.insertId;
        console.log('[create-hospital] ✅ Hospital request created with ID:', requestId);

        const compatibleBloodTypes = getCompatibleDonors(blood_type);
        console.log('[create-hospital] Looking for donors:', { blood_types: compatibleBloodTypes, governorate: hospitalGovernorate });
        
        const placeholders = compatibleBloodTypes.map(() => '?').join(',');
        // ✅ FIXED: Use case-insensitive governorate matching
        const donorQuery = `
          SELECT id, email, full_name FROM donors 
          WHERE blood_type IN (${placeholders})
          AND LOWER(governorate) = LOWER(?)
          AND is_eligible = 1
          LIMIT 50
        `;

        const hospitalParams = [...compatibleBloodTypes, hospitalGovernorate];
        console.log('[create-hospital] Using case-insensitive filter for governorate:', hospitalGovernorate);
        
        db.query(donorQuery, hospitalParams, async (err, donors) => {
          if (err) {
            console.error('[create-hospital] ❌ Donor query error:', err);
            return res.json({ success: true, message: 'Request created but error finding donors' });
          }

          console.log('[create-hospital] ✅ Found', donors?.length || 0, 'matching donors');

          let emailCount = 0;
          
          if (donors && donors.length) {
            for (let i = 0; i < donors.length; i++) {
              const donor = donors[i];
              
              const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <h2 style="color: #dc2626; margin: 0 0 20px 0;">🩸 Blood Request from Hospital</h2>
                  
                  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0 0 10px 0;">Hi <strong>${donor.full_name}</strong>,</p>
                    <p style="margin: 0 0 10px 0;">
                      <strong style="color: #dc2626;">${hospital.name}</strong> needs 
                      <strong style="color: #dc2626;">${blood_type}</strong> blood 
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
                `🩸 ${hospital.name} needs ${blood_type} blood`, 
                emailHtml
              );

              if (sent) emailCount++;
            }
            
            console.log(`[create-hospital] ✅ ${emailCount}/${donors.length} emails sent`);
          }

          res.json({ 
            success: true, 
            requestId: requestId,
            donorsNotified: emailCount,
            message: 'Hospital request created and donors notified' 
          });
        });
      });
    });

  } catch (error) {
    console.error('[create-hospital] ❌ Server error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ DEBUG ENDPOINT: See all donors and what governorates are in database
// ════════════════════════════════════════════════════════════════════════════
router.get('/debug/donors-list', (req, res) => {
  const sql = `
    SELECT 
      id,
      full_name,
      email,
      blood_type,
      governorate,
      is_eligible
    FROM donors
    LIMIT 100
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('[DEBUG] Error:', err);
      return res.status(500).json({ error: err.message });
    }

    console.log(`[DEBUG] Total donors in database: ${results?.length || 0}`);
    console.log('[DEBUG] Donors:', results);

    res.json({
      total_donors: results?.length || 0,
      donors: results || [],
      message: '✅ See all donors above. Check their governorate values!'
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ DONOR DASHBOARD: Get emergency requests
// ════════════════════════════════════════════════════════════════════════════
router.get('/donor/:donorId', (req, res) => {
  const donorId = req.params.donorId;
  console.log(`\n[/donor/:donorId] 🔍 Fetching emergency donations for donor ${donorId}`);
  
  const donorQuery = 'SELECT governorate FROM donors WHERE id = ?';
  db.query(donorQuery, [donorId], (err, donorResults) => {
    if (err || !donorResults?.length) {
      console.error('[/donor/:donorId] Donor not found:', donorId);
      return res.json([]);
    }

    const donorGovernorate = donorResults[0].governorate;
    
    const query = `
      SELECT ed.*
      FROM emergency_donations ed
      WHERE (ed.donor_id = ? OR (ed.donor_id IS NULL AND ed.status = 'pending'))
      AND ed.status IN ('pending', 'awaiting_confirmation')
      AND ed.governorate = ?
      ORDER BY ed.created_at DESC
    `;
    
    db.query(query, [donorId, donorGovernorate], (err, results) => {
      if (err) {
        console.error('[/donor/:donorId] ❌ DB Error:', err);
        return res.json([]);
      }
      console.log(`[/donor/:donorId] ✅ Found ${results?.length || 0} emergency donations in ${donorGovernorate}`);
      res.json(results || []);
    });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ HOSPITAL DASHBOARD: Get hospital-specific requests
// ════════════════════════════════════════════════════════════════════════════
router.get('/hospital/:hospitalId', (req, res) => {
  const query = `
    SELECT ed.*, d.full_name as donor_name, d.email as donor_email
    FROM emergency_donations ed
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
    console.log(`[/hospital/:hospitalId] Returning ${results?.length || 0} donations for hospital`);
    res.json(results || []);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ DONOR CONFIRMS DONATION
// ════════════════════════════════════════════════════════════════════════════
router.post('/donor-confirm-donation', async (req, res) => {
  try {
    const { notification_id, donation_location, hospital_id } = req.body;

    if (!notification_id || !donation_location) {
      return res.status(400).json({ error: 'notification_id and donation_location required' });
    }

    console.log(`[donor-confirm-donation] Donor responding to request ${notification_id}`);

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

      console.log(`[donor-confirm-donation] ✅ Updated donation ${notification_id}`);
      res.json({ success: true, message: 'Donation location confirmed' });
    });

  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ HOSPITAL CONFIRMS DONATION
// ════════════════════════════════════════════════════════════════════════════
router.post('/hospital-confirm', async (req, res) => {
  const { donationId, hospitalId, bloodType, patientEmail } = req.body;

  if (!donationId || !patientEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    console.log(`[hospital-confirm] Hospital confirming donation ${donationId}`);

    const deleteSql = `DELETE FROM emergency_donations WHERE id = ?`;

    db.query(deleteSql, [donationId], async (err) => {
      if (err) {
        console.error('[hospital-confirm] ❌ Database error:', err);
        return res.status(500).json({ error: 'Failed to confirm donation' });
      }

      console.log(`[hospital-confirm] ✅ Deleted from donor dashboard`);

      const hospitalQuery = 'SELECT name FROM hospitals WHERE id = ?';
      db.query(hospitalQuery, [hospitalId], async (err, hospitals) => {
        const hospitalName = hospitals && hospitals.length > 0 ? hospitals[0].name : 'Your Hospital';

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
          `;

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
          });

          console.log(`[hospital-confirm] ✅ Email sent to patient: ${patientEmail}`);
        } catch (emailErr) {
          console.error(`[hospital-confirm] ❌ Error sending email:`, emailErr.message);
        }
        
        res.json({ success: true, message: '✅ Donation confirmed and patient notified!' });
      });
    });
  } catch (error) {
    console.error('[hospital-confirm] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ HOSPITAL MARKS: DONOR DIDN'T SHOW UP - ISSUE #1 FINAL FIX
// ════════════════════════════════════════════════════════════════════════════
// When hospital clicks "Did Not Show Up" on a request in "Your Posted Requests":
// 1. Delete ALL emergency_donations responding to this request (hospital_id + blood_type + awaiting_confirmation)
// 2. Update blood_requests status to 'ns' (appears in admin Hospital Supply)
// ════════════════════════════════════════════════════════════════════════════
router.post('/hospital-no-show', async (req, res) => {
  const { requestId, hospitalId, bloodType } = req.body;

  if (!requestId || !hospitalId || !bloodType) {
    return res.status(400).json({ error: 'Request ID, Hospital ID, and Blood Type required' });
  }

  try {
    console.log(`[hospital-no-show] Marking request ${requestId} as no-show for hospital ${hospitalId}, blood type ${bloodType}`);

    // ✅ Step 1: Delete ALL emergency_donations responding to this hospital's request
    // These are donors who responded to this specific request (awaiting_confirmation status)
    const deleteEmergencySql = `
      DELETE FROM emergency_donations 
      WHERE hospital_id = ? AND blood_type = ? AND status = 'awaiting_confirmation'
    `;

    db.query(deleteEmergencySql, [hospitalId, bloodType], (deleteErr, deleteResult) => {
      if (deleteErr) {
        console.error('[hospital-no-show] ❌ Error deleting emergency donations:', deleteErr);
        return res.status(500).json({ error: 'Failed to delete emergency donations' });
      }

      console.log(`[hospital-no-show] ✅ Deleted ${deleteResult.affectedRows} emergency donations`);

      // ✅ Step 2: Update blood_requests status to 'ns' (appears in admin HOSPITAL SUPPLY tab)
      const updateSql = `UPDATE blood_requests SET status = 'ns' WHERE id = ?`;
      
      db.query(updateSql, [requestId], (updateErr) => {
        if (updateErr) {
          console.error('[hospital-no-show] ❌ Error updating blood_requests:', updateErr);
          return res.status(500).json({ error: 'Failed to update request status' });
        }

        console.log(`[hospital-no-show] ✅ Updated blood_request ${requestId} status to 'ns'`);
        res.json({ 
          success: true, 
          message: '✅ Marked as not shown. All responding donors removed. Appears in admin Hospital Supply.' 
        });
      });
    });
  } catch (error) {
    console.error('[hospital-no-show] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET ALL EMERGENCY DONATIONS (for admin)
// ════════════════════════════════════════════════════════════════════════════
router.get('/all-emergency-donations', (req, res) => {
  const sql = `
    SELECT 
      ed.id,
      ed.donor_id,
      ed.blood_type,
      ed.patient_email,
      ed.governorate,
      ed.status,
      ed.request_type,
      ed.quantity_needed,
      ed.urgency,
      h.name as hospital_name,
      ed.hospital_id,
      ed.created_at
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    ORDER BY ed.created_at DESC
    LIMIT 200
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('[all-emergency-donations] Error:', err);
      return res.status(500).json({ error: 'Error fetching donations' });
    }
    res.json(results || []);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET HOSPITAL'S POSTED REQUESTS
// ════════════════════════════════════════════════════════════════════════════
router.get('/hospital-list/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;
  
  const sql = `
    SELECT 
      id,
      hospital_id,
      blood_type,
      quantity_needed,
      urgency,
      status,
      created_at
    FROM blood_requests
    WHERE hospital_id = ?
    ORDER BY created_at DESC
  `;

  db.query(sql, [hospitalId], (err, results) => {
    if (err) {
      console.error('[hospital-list] Error:', err);
      return res.status(500).json({ error: 'Error fetching hospital requests' });
    }
    console.log(`[hospital-list] Found ${results?.length || 0} requests for hospital ${hospitalId}`);
    res.json(results || []);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ NEW: GET ALL HOSPITAL SUPPLY REQUESTS (status = 'ns')
// ════════════════════════════════════════════════════════════════════════════
router.get('/all-no-show', (req, res) => {
  const sql = `
    SELECT 
      br.id,
      br.hospital_id,
      br.blood_type,
      br.quantity_needed,
      br.urgency,
      br.status,
      br.created_at,
      h.name as hospital_name,
      h.governorate
    FROM blood_requests br
    LEFT JOIN hospitals h ON br.hospital_id = h.id
    WHERE br.status = 'ns'
    ORDER BY br.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('[all-no-show] Error:', err);
      return res.status(500).json({ error: 'Error fetching no-show requests' });
    }
    
    console.log(`[all-no-show] ✅ Found ${results?.length || 0} hospital supply requests`);
    res.json(results || []);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// ✅ GET HOSPITAL REQUESTS FOR DONOR DASHBOARD
// ════════════════════════════════════════════════════════════════════════════
router.get('/hospital-requests/:donorId', (req, res) => {
  const { donorId } = req.params;

  const donorQuery = 'SELECT blood_type, governorate FROM donors WHERE id = ?';
  
  db.query(donorQuery, [donorId], (err, donorResults) => {
    if (err || !donorResults?.length) {
      console.error('[hospital-requests] Donor not found:', donorId);
      return res.status(500).json({ error: 'Donor not found' });
    }

    const donor = donorResults[0];
    const donorBloodType = donor.blood_type;
    const donorGovernorate = donor.governorate;
    
    const canGiveTo = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+'],
    };

    const compatibleBloodTypes = canGiveTo[donorBloodType] || [];
    
    if (compatibleBloodTypes.length === 0) {
      console.log(`[hospital-requests] No compatible blood types for donor ${donorId} (${donorBloodType})`);
      return res.json([]);
    }

    const placeholders = compatibleBloodTypes.map(() => '?').join(',');
    const sql = `
      SELECT 
        br.id,
        br.hospital_id,
        br.blood_type,
        br.quantity_needed,
        br.urgency,
        br.status,
        br.created_at,
        h.name as hospital_name
      FROM blood_requests br
      LEFT JOIN hospitals h ON br.hospital_id = h.id
      WHERE br.blood_type IN (${placeholders})
      AND br.status = 'pending'
      AND h.governorate = ?
      AND LOWER(TRIM(h.governorate)) = LOWER(?)
      ORDER BY br.created_at DESC
      LIMIT 100
    `;

    const params = [...compatibleBloodTypes, donorGovernorate];
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('[hospital-requests] Error:', err);
        return res.status(500).json({ error: 'Error fetching hospital requests' });
      }
      console.log(`[hospital-requests] Donor ${donorId} (${donorBloodType}, ${donorGovernorate}) → Found ${results?.length || 0} requests`);
      res.json(results || []);
    });
  });
});

console.log('[blood-requests.js] ✅ All routes registered - CASE-INSENSITIVE governorate matching FIXED for Issues #1 & #2');

module.exports = router;