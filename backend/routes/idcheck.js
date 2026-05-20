const express = require('express');
const router = express.Router();
const multer = require('multer');
const Groq = require('groq-sdk');

const upload = multer({ storage: multer.memoryStorage() });
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const fixDate = (dateStr) => {
  if (!dateStr) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  let [a, b, c] = parts;
  if (parseInt(a) <= 31 && parseInt(c) > 1900) {
    return `${c}-${b.padStart(2,'0')}-${a.padStart(2,'0')}`;
  }
  return `${a}-${b.padStart(2,'0')}-${c.padStart(2,'0')}`;
};

const VALID_BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

router.post('/scan', upload.single('id_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const side = req.body.side || 'front';

    console.log(`📤 Scanning ID ${side} - Size:`, req.file.size, 'bytes');

    let prompt = '';
    
    if (side === 'front') {
      prompt = `You are analyzing the FRONT side of a national ID card from ANY country. Extract ONLY the date of birth. Look for "DOB", "Date of Birth", "تاريخ الميلاد", etc. Convert to YYYY-MM-DD format. Return ONLY: {"date_of_birth": "YYYY-MM-DD"}`;
    } else {
      prompt = `You are analyzing the BACK side of a national ID card from ANY country. Extract ONLY the blood type (A+, A-, B+, B-, AB+, AB-, O+, O-). Return ONLY: {"blood_type": "O+" or null if not found}`;
    }

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0.1,
      max_completion_tokens: 200
    });

    let text = completion.choices[0].message.content.trim();
    console.log(`✅ Groq response (${side}):`, text);
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      console.error('❌ JSON parse error:', text);
      return res.status(400).json({ message: `Could not read ID ${side}. Please provide a clearer photo.` });
    }

    if (side === 'front') {
      if (!result.date_of_birth) {
        return res.status(400).json({ message: 'Could not read date of birth. Please upload a clearer photo.' });
      }

      result.date_of_birth = fixDate(result.date_of_birth);

      const dob = new Date(result.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }

      if (age < 18) {
        return res.status(400).json({
          eligible: false,
          message: 'You must be at least 18 years old to donate blood.',
          date_of_birth: result.date_of_birth,
          age
        });
      }

      return res.json({
        eligible: true,
        message: 'Age verified successfully!',
        date_of_birth: result.date_of_birth,
        age
      });
    }

    if (side === 'back') {
      let blood_type = null;
      
      if (result.blood_type) {
        blood_type = result.blood_type.toUpperCase().trim();
        if (!VALID_BLOOD_TYPES.includes(blood_type)) {
          blood_type = null;
        }
      }

      if (!blood_type) {
        return res.status(400).json({
          detected: false,
          message: 'Blood type not detected. Please upload a clearer photo of the ID back.',
          blood_type: null
        });
      }

      return res.json({
        detected: true,
        message: 'Blood type extracted successfully!',
        blood_type: blood_type
      });
    }

  } catch (error) {
    console.error('❌ Scan error:', error.message);
    return res.status(500).json({ message: 'Failed to scan ID. Please try again with a clearer photo.' });
  }
});

module.exports = router;
