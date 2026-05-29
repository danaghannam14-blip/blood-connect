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
      prompt = `You are analyzing a national ID card (from ANY country). Your task is to extract ONLY the date of birth.

Look for any of these:
- "Date of Birth" or "DOB"
- "تاريخ الميلاد" (Arabic)
- Any date field
- Birth year, birth date format

The date might be in formats like: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD, or written out.

If you can see a date that looks like a birth date, extract it and convert to YYYY-MM-DD format.

If the image is blurry, at an angle, or hard to read, do your best to extract what you can see. Even partial information helps.

Return ONLY valid JSON: {"date_of_birth": "YYYY-MM-DD"} or {"date_of_birth": null} if completely unreadable.`;
    } else {
      prompt = `You are analyzing the back of a national ID card (from ANY country). Your task is to extract ONLY the blood type.

Look for any of these blood type values anywhere on the ID:
- A+, A-, B+, B-, AB+, AB-, O+, O-

The blood type might be:
- In a specific blood type field
- Written as "Blood Type:", "BT:", "Type:", etc.
- In Arabic as "فصيلة الدم"
- Just written as the letters/symbols

If you can see a blood type value, extract it exactly.

If the image is blurry or at an angle, look for any visible blood type indication.

Return ONLY valid JSON: {"blood_type": "O+"} or {"blood_type": null} if not found or unreadable.`;
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
      temperature: 0.2,
      max_completion_tokens: 300
    });

    let text = completion.choices[0].message.content.trim();
    console.log(`✅ Groq response (${side}):`, text);
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch (parseErr) {
      console.error('❌ JSON parse error:', text);
      return res.status(400).json({ message: `Could not read ID ${side}. Please provide a clearer photo with better lighting.` });
    }

    if (side === 'front') {
      if (!result.date_of_birth || result.date_of_birth === 'null') {
        return res.status(400).json({ 
          message: 'Could not read date of birth clearly. Tips: Make sure the ID is well-lit and the date field is visible.' 
        });
      }

      result.date_of_birth = fixDate(result.date_of_birth);

      try {
        const dob = new Date(result.date_of_birth);
        if (isNaN(dob.getTime())) {
          return res.status(400).json({ message: 'Invalid date format. Please try again with a clearer photo.' });
        }

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
      } catch (dateErr) {
        console.error('Date parsing error:', dateErr);
        return res.status(400).json({ message: 'Could not parse the date. Please try a clearer photo.' });
      }
    }

    if (side === 'back') {
      let blood_type = null;
      
      if (result.blood_type && result.blood_type !== 'null' && result.blood_type !== null) {
        blood_type = result.blood_type.toUpperCase().trim();
        
        // Remove any extra characters
        blood_type = blood_type.replace(/[^A-Z+\-]/g, '');
        
        if (!VALID_BLOOD_TYPES.includes(blood_type)) {
          blood_type = null;
        }
      }

      if (!blood_type) {
        return res.status(400).json({
          detected: false,
          message: 'Blood type not clearly visible. Tips: Make sure the ID back is well-lit and flat.',
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
    
    if (error.status === 429) {
      return res.status(429).json({ message: 'Too many requests. Please wait a moment and try again.' });
    }
    
    return res.status(500).json({ 
      message: 'Failed to scan ID. Please ensure the photo is clear, well-lit, and shows the full ID.' 
    });
  }
});

module.exports = router;