const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

const fixDate = (dateStr) => {
  if (!dateStr) return dateStr;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  let [year, month, day] = parts;
  // If year looks like a day and day looks like a year, swap them
  if (parseInt(year) < 32 && parseInt(day) > 1900) {
    return `${day}-${month}-${year}`;
  }
  // If year is in the future
  if (parseInt(year) > new Date().getFullYear()) {
    return `${day}-${month}-${year}`;
  }
  return dateStr;
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
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'This is a Lebanese ID card. Find the date of birth field which is labeled تاريخ الولادة. Extract the date and return it in this exact JSON format only, no extra text: {"date_of_birth": "YYYY-MM-DD"}. The date on the card uses Arabic-Indic numerals like ١٩٩٤/٠٢/٠١ which means 1994-02-01. The format is DD/MM/YYYY so ١٨/٠١/٢٠٠٥ means day=18, month=01, year=2005, return "2005-01-18". Convert to standard numbers carefully. If this is not a Lebanese ID card return exactly: {"error": "not_lebanese_id"}'
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
      max_completion_tokens: 100
    });

    let text = completion.choices[0].message.content.trim();
    console.log('Groq raw response:', text);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      console.log('JSON parse failed for:', text);
      // Check if the response mentions it's not a Lebanese ID
      if (text.toLowerCase().includes('not') || text.toLowerCase().includes('lebanese') || !text.includes('date')) {
        return res.status(400).json({ message: 'Please upload a valid Lebanese national ID card.' });
      }
      return res.status(400).json({ message: 'Could not read date of birth from ID. Please try a clearer photo.' });
    }

    if (result.error === 'not_lebanese_id') {
      return res.status(400).json({ 
        message: 'Please upload a valid Lebanese national ID card.' 
      });
    }

    // Fix year/day swap
    result.date_of_birth = fixDate(result.date_of_birth);
    console.log('Fixed date:', result.date_of_birth);

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

    res.json({
      eligible: true,
      message: 'Age verified successfully!',
      date_of_birth: result.date_of_birth,
      age
    });

  } catch (error) {
    console.error('ID scan error:', error.message);
    res.status(500).json({ message: 'Failed to scan ID', error: error.message });
  }
});

module.exports = router;