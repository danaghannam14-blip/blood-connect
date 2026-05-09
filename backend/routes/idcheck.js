const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

const arabicToWestern = (str) => {
  return str.replace(/[٠١٢٣٤٥٦٧٨٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString());
}

const smartDateParse = (dateStr) => {
  // Remove any non-numeric and non-slash/dash characters
  dateStr = dateStr.trim();
  
  const separators = ['/', '-', '.'];
  let parts = null;
  
  for (const sep of separators) {
    if (dateStr.includes(sep)) {
      parts = dateStr.split(sep);
      break;
    }
  }
  
  if (!parts || parts.length !== 3) return null;
  
  const nums = parts.map(p => parseInt(p));
  
  // Figure out which is year, month, day
  let year, month, day;
  
  // Year is the 4-digit number
  if (nums[0] > 1000) { // YYYY/MM/DD or YYYY/DD/MM
    year = nums[0];
    // Month must be 1-12
    if (nums[1] >= 1 && nums[1] <= 12) {
      month = nums[1];
      day = nums[2];
    } else {
      month = nums[2];
      day = nums[1];
    }
  } else if (nums[2] > 1000) { // DD/MM/YYYY or MM/DD/YYYY
    year = nums[2];
    // If first number > 12, it must be day
    if (nums[0] > 12) {
      day = nums[0];
      month = nums[1];
    } else if (nums[1] > 12) {
      month = nums[0];
      day = nums[1];
    } else {
      // Lebanese format is DD/MM/YYYY
      day = nums[0];
      month = nums[1];
    }
  } else {
    return null;
  }
  
  if (!year || !month || !day) return null;
  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (year < 1900 || year > 2010) return null;
  
  return `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
}

router.post('/scan', upload.single('id_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are a JSON-only response bot. Output ONLY valid JSON, nothing else. No explanations, no text, just JSON.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Find the تاريخ الولادة field in this Lebanese ID card. Copy the EXACT digits you see without converting them. Return ONLY this JSON: {"date_of_birth": "DD/MM/YYYY"} with the actual digits from the card. If not a Lebanese ID return: {"error": "not_lebanese_id"}'
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
      max_completion_tokens: 50
    });

    let text = completion.choices[0].message.content.trim();
    console.log('Groq raw response:', text);
    
    text = arabicToWestern(text);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.log('JSON parse failed for:', text);
      return res.status(400).json({ message: 'Could not read date of birth from ID. Please try a clearer photo.' });
    }

    if (result.error === 'not_lebanese_id') {
      return res.status(400).json({ 
        message: 'Please upload a valid Lebanese national ID card.' 
      });
    }

    // Smart date parsing
    const parsedDate = smartDateParse(result.date_of_birth);
    console.log('Smart parsed date:', parsedDate, 'from:', result.date_of_birth);
    
    if (!parsedDate) {
      return res.status(400).json({ message: 'Could not read date of birth from ID. Please try a clearer photo.' });
    }

    const dob = new Date(parsedDate);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }

    if (age < 18) {
      return res.status(400).json({ 
        eligible: false,
        message: 'You must be at least 18 years old to donate blood.',
        date_of_birth: parsedDate,
        age
      });
    }

    res.json({
      eligible: true,
      message: 'Age verified successfully!',
      date_of_birth: parsedDate,
      age
    });

  } catch (error) {
    console.error('ID scan error:', error.message);
    res.status(500).json({ message: 'Failed to scan ID', error: error.message });
  }
});

module.exports = router;