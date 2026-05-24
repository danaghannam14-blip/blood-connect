const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

console.log('[requests.js] Setting up Brevo REST API...');
console.log('[requests.js] BREVO_API_KEY exists:', !!process.env.BREVO_API_KEY);

// ✅ EXACT same normalization as HospitalPartners.jsx - extracts from ADDRESS
const normalizeGovernorate = (address) => {
  if (!address) return 'Other'
  
  const addressLower = address.toLowerCase()
  
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
  }
  
  // Search through address for any matching key
  for (let [key, value] of Object.entries(normalizationMap)) {
    if (addressLower.includes(key)) {
      return value
    }
  }
  
  return 'Other'
}

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

// ✅ Send email via Brevo REST API
const sendEmailViaBrevo = async (toEmail, toName, subject, htmlContent) => {
  try {
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
    console.error(`❌ Error sending to ${toEmail}:`, error.message);
    return false;
  }
};

console.log('[requests.js] Routes registering...');

// ✅ POST /api/requests/create - Hospital blood requests with governorate filtering
router.post('/create', async (req, res) => {
  console.log('[POST /create] Received:', req.body);
  
  try {
    const { hospital_id, blood_type, quantity_needed, urgency } = req.body;

    if (!hospital_id || !blood_type || !quantity_needed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `
      INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed, urgency, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(query, [hospital_id, blood_type, quantity_needed, urgency || 'urgent'], async (err, result) => {
      if (err) {
        console.error('[POST /create] Database error:', err.message);
        return res.status(500).json({ error: 'Failed to create request' });
      }

      console.log('[POST /create] Request created with ID:', result.insertId);

      // Get hospital info - we need ADDRESS to extract governorate (like HospitalPartners.jsx does)
      const hospitalQuery = 'SELECT name, address, id FROM hospitals WHERE id = ?';
      db.query(hospitalQuery, [hospital_id], async (err, hospitalResults) => {
        if (!err && hospitalResults && hospitalResults.length) {
          const hospital = hospitalResults[0];
          
          // ✅ Extract and normalize governorate from ADDRESS (same as HospitalPartners.jsx)
          const hospitalAddress = hospital.address || '';
          const normalizedGovernorate = normalizeGovernorate(hospitalAddress);
          
          console.log('[POST /create] Hospital:', hospital.name);
          console.log('[POST /create] Hospital Address:', hospitalAddress);
          console.log('[POST /create] Extracted & Normalized Governorate:', normalizedGovernorate);
          
          // Get compatible blood types
          const compatibleBloodTypes = getCompatibleDonors(blood_type);
          console.log('[POST /create] Compatible blood types:', compatibleBloodTypes);
          
          // ✅ Query donors from the SAME GOVERNORATE ONLY
          // Donors table should have a 'governorate' column with normalized names
          const donorQuery = `
            SELECT id, email, full_name FROM donors 
            WHERE blood_type IN (?) 
            AND governorate = ?
            AND is_eligible = 1 
            LIMIT 50
          `;
          
          db.query(donorQuery, [compatibleBloodTypes, normalizedGovernorate], async (err, donors) => {
            if (!err && donors && donors.length) {
              console.log(`[POST /create] ✅ Found ${donors.length} donors in ${normalizedGovernorate}`);
              
              let emailCount = 0;
              // Send emails via Brevo REST API
              for (let i = 0; i < donors.length; i++) {
                const donor = donors[i];
                
                const emailHtml = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc2626; margin: 0 0 20px 0;">🩸 Blood Request</h2>
                    
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0 0 10px 0;">Hi <strong>${donor.full_name}</strong>,</p>
                      <p style="margin: 0 0 10px 0;">
                        <strong style="font-size: 16px; color: #dc2626;">${hospital.name}</strong> needs 
                        <strong style="font-size: 16px; color: #dc2626;">${blood_type}</strong> blood 
                        (<strong>${quantity_needed} units</strong>).
                      </p>
                    </div>
                    
                    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; border-radius: 4px;">
                      <p style="margin: 0; font-weight: bold; color: #991b1b;">⚠️ Your blood type matches! Please respond ASAP.</p>
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
                  emailCount++;
                  
                  // ✅ IMPORTANT: Also insert into emergency_donations so it shows on donor dashboard
                  const insertEmergencySql = `
                    INSERT INTO emergency_donations 
                    (donor_id, blood_type, patient_email, governorate, status, hospital_id) 
                    VALUES (?, ?, ?, ?, 'pending', ?)
                  `;
                  db.query(insertEmergencySql, [donor.id, blood_type, hospital.name, normalizedGovernorate, hospital_id], (err) => {
                    if (err) console.error('[POST /create] Emergency donation insert error:', err);
                    else console.log(`[POST /create] ✅ Added to emergency_donations for donor ${donor.id}`);
                  });
                }
              }
              
              console.log(`[POST /create] ✅ ${emailCount}/${donors.length} emails sent successfully`);
            } else {
              console.log(`[POST /create] ⚠️ No donors found in ${normalizedGovernorate}`);
              console.log(`[POST /create] Available governorates in donors table - run: SELECT DISTINCT governorate FROM donors;`);
            }
          });
        } else {
          console.log('[POST /create] ⚠️ Hospital not found');
        }
      });

      res.json({ 
        success: true,
        message: 'Blood request created',
        requestId: result.insertId
      });
    });
  } catch (error) {
    console.error('[POST /create] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/requests
router.get('/', (req, res) => {
  const query = `
    SELECT br.*, h.name as hospital_name
    FROM blood_requests br
    LEFT JOIN hospitals h ON br.hospital_id = h.id
    ORDER BY br.created_at DESC
    LIMIT 200
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch' });
    }
    res.json(results || []);
  });
});

// GET /api/requests/hospital/:hospitalId
router.get('/hospital/:hospitalId', (req, res) => {
  const { hospitalId } = req.params;

  const query = `
    SELECT * FROM blood_requests
    WHERE hospital_id = ?
    ORDER BY created_at DESC
    LIMIT 100
  `;

  db.query(query, [hospitalId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch' });
    }
    res.json(results || []);
  });
});

// GET /api/requests/:requestId - Get single request
router.get('/:requestId', (req, res) => {
  const id = parseInt(req.params.requestId);
  if (!id) return res.status(400).json({ error: 'Invalid ID' });
  
  db.query('SELECT * FROM blood_requests WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('[GET error]:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0] || {});
  });
});

// DELETE /api/requests/:requestId
router.delete('/:requestId', (req, res) => {
  console.log('[DELETE] params:', req.params);
  const id = parseInt(req.params.requestId);
  if (!id) return res.status(400).json({ error: 'Invalid ID' });
  
  db.query('DELETE FROM blood_requests WHERE id = ?', [id], (err) => {
    if (err) {
      console.error('[DELETE error]:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

// PUT /api/requests/:requestId
router.put('/:requestId', (req, res) => {
  console.log('[PUT] params:', req.params, 'body:', req.body);
  const id = parseInt(req.params.requestId);
  const { status } = req.body;
  
  if (!id || !status) return res.status(400).json({ error: 'Invalid ID or status' });
  
  db.query('UPDATE blood_requests SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      console.error('[PUT error]:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true });
  });
});

console.log('[requests.js] ✅ Routes registered');

module.exports = router;