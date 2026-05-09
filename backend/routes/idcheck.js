const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

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
            text: 'This is a Lebanese national ID card (بطاقة هوية). It must have الجمهورية اللبنانية at the top. If this is NOT a Lebanese national ID card, return exactly: {"error": "not_lebanese_id"}. If it IS a Lebanese ID, find the field labeled تاريخ الولادة. The date format on Lebanese IDs is DD/MM/YYYY using Arabic-Indic numerals where ٠=0 ١=1 ٢=2 ٣=3 ٤=4 ٥=5 ٦=6 ٧=7 ٨=8 ٩=9. The date reads as DAY/MONTH/YEAR from left to right. For example ١٧/١٠/٢٠١٠ means day=17, month=10, year=2010, return "2010-10-17". Convert VERY carefully digit by digit and return ONLY: {"date_of_birth": "YYYY-MM-DD"}'
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
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      return res.status(400).json({ message: 'Could not read date of birth from ID. Please try a clearer photo.' });
    }
if (result.error === 'not_lebanese_id') {
  return res.status(400).json({ 
    message: 'Please upload a valid Lebanese national ID card.' 
  });
}
    const dob = new Date(result.date_of_birth);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear()

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