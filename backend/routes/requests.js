const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');

console.log('[requests.js] Setting up Brevo REST API...');

// ✅ Normalize governorate from hospital address
const normalizeGovernorate = (address) => {
  if (!address) return 'Other'
  
  const addressLower = address.toLowerCase()
  
  const normalizationMap = {
    'akkar': 'Akkar', 'محافظة عكار': 'Akkar', 'عكار': 'Akkar',
    'baalbek': 'Baalbek-Hermel', 'baalbak': 'Baalbek-Hermel', 'hermel': 'Baalbek-Hermel',
    'beirut': 'Beirut', 'beyrouth': 'Beirut', 'محافظة بيروت': 'Beirut', 'بيروت': 'Beirut', 'hamra': 'Beirut', 'ashrafieh': 'Beirut',
    'beqaa': 'Beqaa', 'bekaa': 'Beqaa', 'chtaura': 'Beqaa', 'zahle': 'Beqaa',
    'keserwan': 'Keserwan-Jbeil', 'jbeil': 'Keserwan-Jbeil', 'jounieh': 'Keserwan-Jbeil',
    'mount lebanon': 'Mount Lebanon', 'baabda': 'Mount Lebanon', 'aley': 'Mount Lebanon',
    'nabatiyeh': 'Nabatiyeh', 'bent jbail': 'Nabatiyeh',
    'north lebanon': 'North Lebanon', 'tripoli': 'North Lebanon',
    'south lebanon': 'South Lebanon', 'sidon': 'South Lebanon', 'tyre': 'South Lebanon',
  }
  
  for (let [key, value] of Object.entries(normalizationMap)) {
    if (addressLower.includes(key)) return value
  }
  return 'Other'
}

// Blood type compatibility
const getCompatibleDonors = (bloodType) => {
  const compatibility = {
    'O-': ['O-'], 'O+': ['O-', 'O+'], 'A-': ['O-', 'A-'], 'A+': ['O-', 'O+', 'A-', 'A+'],
    'B-': ['O-', 'B-'], 'B+': ['O-', 'O+', 'B-', 'B+'], 'AB-': ['O-', 'A-', 'B-', 'AB-'],
    'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  };
  return compatibility[bloodType] || [];
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

// ✅ POST /api/requests/create - Hospital blood requests
router.post('/create', async (req, res) => {
  console.log('[POST /create] Received:', req.body);
  
  try {
    const { hospital_id, blood_type, quantity_needed, urgency } = req.body;
    if (!hospital_id || !blood_type || !quantity_needed) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // ✅ Insert into blood_requests (hospital dashboard)
    const query = `
      INSERT INTO blood_requests (hospital_id, blood_type, quantity_needed, urgency, status, created_at)
      VALUES (?, ?, ?, ?, 'pending', NOW())
    `;

    db.query(query, [hospital_id, blood_type, quantity_needed, urgency || 'urgent'], async (err, result) => {
      if (err) {
        console.error('[POST /create] Database error:', err.message);
        return res.status(500).json({ error: 'Failed to create request' });
      }

      const requestId = result.insertId;
      console.log('[POST /create] Request created with ID:', requestId);

      // Get hospital info
      const hospitalQuery = 'SELECT name, address, id FROM hospitals WHERE id = ?';
      db.query(hospitalQuery, [hospital_id], async (err, hospitalResults) => {
        if (!err && hospitalResults && hospitalResults.length) {
          const hospital = hospitalResults[0];
          const normalizedGovernorate = normalizeGovernorate(hospital.address || '');
          
          console.log('[POST /create] Hospital:', hospital.name, 'Governorate:', normalizedGovernorate);
          
          // ✅ INSERT into emergency_donations for DONOR DASHBOARD
          const insertEmergencySql = `
            INSERT INTO emergency_donations 
            (hospital_id, blood_type, patient_email, governorate, status, request_id) 
            VALUES (?, ?, ?, ?, 'pending', ?)
          `;
          db.query(insertEmergencySql, [hospital_id, blood_type, hospital.name, normalizedGovernorate, requestId], (err) => {
            if (err) console.error('[POST /create] Emergency donation error:', err);
            else console.log(`[POST /create] ✅ Added to donor dashboard`);
          });

          // ✅ Send emails to matching donors
          const compatibleBloodTypes = getCompatibleDonors(blood_type);
          const donorQuery = `
            SELECT id, email, full_name FROM donors 
            WHERE blood_type IN (?) AND governorate = ? AND is_eligible = 1 LIMIT 50
          `;
          
          db.query(donorQuery, [compatibleBloodTypes, normalizedGovernorate], async (err, donors) => {
            if (!err && donors && donors.length) {
              console.log(`[POST /create] Found ${donors.length} donors`);
              let emailCount = 0;
              
              for (let i = 0; i < donors.length; i++) {
                const donor = donors[i];
                const emailHtml = `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #dc2626; margin: 0 0 20px 0;">🩸 Blood Request</h2>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0 0 10px 0;">Hi <strong>${donor.full_name}</strong>,</p>
                      <p><strong style="color: #dc2626;">${hospital.name}</strong> needs <strong style="color: #dc2626;">${blood_type}</strong> blood (<strong>${quantity_needed} units</strong>).</p>
                    </div>
                    <p style="margin: 20px 0;">Every donation saves lives. Thank you!</p>
                  </div>
                `;
                
                const sent = await sendEmailViaBrevo(donor.email, donor.full_name, `🩸 ${hospital.name} needs ${blood_type} blood`, emailHtml);
                if (sent) emailCount++;
              }
              console.log(`[POST /create] ✅ ${emailCount}/${donors.length} emails sent`);
            }
          });
        }
      });

      res.json({ success: true, message: 'Blood request created', requestId: requestId });
    });
  } catch (error) {
    console.error('[POST /create] Error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

<<<<<<< HEAD
// GET /api/requests - Get ALL requests (for admin dashboard)
=======
// ✅ GET /api/requests - Hospital dashboard (blood_requests)
>>>>>>> 215178dfc2d51bbfb834f0ec4c7eb6fa198a1b3d
router.get('/', (req, res) => {
  const query = `SELECT br.*, h.name as hospital_name FROM blood_requests br LEFT JOIN hospitals h ON br.hospital_id = h.id ORDER BY br.created_at DESC LIMIT 200`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch' });
    res.json(results || []);
  });
});

<<<<<<< HEAD
// GET /api/requests/hospital/:hospitalId - Get hospital's requests
=======
// ✅ GET /api/requests/hospital/:hospitalId - Hospital's posted requests
>>>>>>> 215178dfc2d51bbfb834f0ec4c7eb6fa198a1b3d
router.get('/hospital/:hospitalId', (req, res) => {
  const query = `SELECT * FROM blood_requests WHERE hospital_id = ? ORDER BY created_at DESC LIMIT 100`;
  db.query(query, [req.params.hospitalId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch' });
    res.json(results || []);
  });
});

// ✅ GET /api/requests/:requestId - Get single request
router.get('/:requestId', (req, res) => {
  const id = req.params.requestId;
  if (!id) return res.status(400).json({ error: 'Request ID required' });
  
  db.query('SELECT * FROM blood_requests WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0] || {});
  });
});

<<<<<<< HEAD
// DELETE /api/requests/:requestId - Delete request (removes from hospital view and donor dashboard)
router.delete('/:requestId', (req, res) => {
  console.log('[DELETE] Deleting request:', req.params.requestId);
  const id = parseInt(req.params.requestId);
  if (!id) return res.status(400).json({ error: 'Invalid ID' });
=======
// ✅ DELETE /api/requests/:requestId - Delete request from blood_requests AND emergency_donations
router.delete('/:requestId', (req, res) => {
  const id = req.params.requestId;
  if (!id) return res.status(400).json({ error: 'Request ID required' });
>>>>>>> 215178dfc2d51bbfb834f0ec4c7eb6fa198a1b3d
  
  console.log('[DELETE] Deleting request:', id);
  
  // Delete from blood_requests
  db.query('DELETE FROM blood_requests WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Also delete from emergency_donations (removes from donor dashboard)
    db.query('DELETE FROM emergency_donations WHERE request_id = ?', [id], (err2) => {
      if (err2) console.error('[DELETE error in emergency_donations]:', err2);
      else console.log('[DELETE] ✅ Also removed from emergency_donations');
      res.json({ success: true });
    });
  });
});

<<<<<<< HEAD
// PUT /api/requests/:requestId - Updates status (NEVER deletes on 'ns', only on final confirmation)
router.put('/:requestId', (req, res) => {
  console.log('[PUT] Updating request:', req.params.requestId, 'with status:', req.body.status);
  const id = parseInt(req.params.requestId);
=======
// ✅ PUT /api/requests/:requestId - Update request status
router.put('/:requestId', (req, res) => {
  const id = req.params.requestId;
>>>>>>> 215178dfc2d51bbfb834f0ec4c7eb6fa198a1b3d
  const { status } = req.body;
  
  if (!id || !status) return res.status(400).json({ error: 'ID and status required' });
  
<<<<<<< HEAD
  console.log(`[PUT] ✅ Updating request ${id} to status '${status}' (NO DELETION)`);
  
  // ✅ ALWAYS UPDATE - never delete on 'ns'
  // Status flow:
  // - 'pending': Initial state (yellow/orange/red)
  // - 'ns': Donor didn't show up (STAYS SAME COLOR - waiting for admin, appears in admin dashboard)
  // - 'supply_coming': Admin confirmed supply (TURNS BLUE - hospital sees "COMING")
  // - 'ok': Confirmed by hospital/donor (REMOVE FROM HOSPITAL VIEW)
  // - 'fulfilled': Completed
  
  db.query('UPDATE blood_requests SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) {
      console.error('[PUT error updating blood_requests]:', err);
      return res.status(500).json({ error: err.message });
    }
    
    console.log(`[PUT] ✅ Updated blood_requests to status '${status}'`);
    
    // Also update emergency_donations with the new status
    db.query('UPDATE emergency_donations SET status = ? WHERE request_id = ?', [status, id], (err2) => {
      if (err2) {
        console.error('[PUT error updating emergency_donations]:', err2);
        // Don't fail - blood_requests was already updated
      } else {
        console.log(`[PUT] ✅ Also updated emergency_donations to status '${status}'`);
      }
      res.json({ success: true, message: `Status updated to ${status}` });
    });
=======
  console.log(`[PUT] Updating request ${id} to status '${status}'`);
  
  db.query('UPDATE blood_requests SET status = ? WHERE id = ?', [status, id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // If status is 'ok' or 'ns', DELETE from emergency_donations (removes from donor dashboard)
    if (status === 'ok' || status === 'ns') {
      db.query('DELETE FROM emergency_donations WHERE request_id = ?', [id], (err2) => {
        if (err2) console.error('[PUT error]:', err2);
        else console.log(`[PUT] ✅ Removed from emergency_donations for status '${status}'`);
        res.json({ success: true });
      });
    } else {
      // For other statuses, update emergency_donations status
      db.query('UPDATE emergency_donations SET status = ? WHERE request_id = ?', [status, id], (err2) => {
        if (err2) console.error('[PUT error]:', err2);
        res.json({ success: true });
      });
    }
  });
});

// ✅ GET /api/requests/donor/:donorId - Get hospital requests for donor dashboard
router.get('/donor/:donorId', (req, res) => {
  const donorId = req.params.donorId;
  console.log(`[GET /requests/donor/:donorId] Fetching hospital requests for donor ${donorId}`);
  
  // Hospital requests from emergency_donations that have hospital_id and donor_id=NULL
  const query = `
    SELECT ed.*, h.name as hospital_name
    FROM emergency_donations ed
    LEFT JOIN hospitals h ON ed.hospital_id = h.id
    WHERE ed.hospital_id IS NOT NULL 
    AND ed.donor_id IS NULL
    ORDER BY ed.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('[GET /requests/donor/:donorId] Error:', err);
      return res.json([]);
    }
    console.log(`[GET /requests/donor/:donorId] Found ${results?.length || 0} hospital requests`);
    res.json(results || []);
>>>>>>> 215178dfc2d51bbfb834f0ec4c7eb6fa198a1b3d
  });
});

console.log('[requests.js] ✅ Routes registered');
module.exports = router;