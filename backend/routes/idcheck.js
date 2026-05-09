const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const upload = multer({ storage: multer.memoryStorage() });

router.post('/scan', upload.single('id_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `This is a Lebanese national ID card (بطاقة هوية - الجمهورية اللبنانية). 
    Find the تاريخ الولادة (date of birth) field.
    The date is written in Arabic-Indic numerals in DD/MM/YYYY format.
    Convert Arabic-Indic numerals to Western: ٠=0 ١=1 ٢=2 ٣=3 ٤=4 ٥=5 ٦=6 ٧=7 ٨=8 ٩=9
    Return ONLY valid JSON with no explanation: {"date_of_birth": "YYYY-MM-DD"}
    If this is not a Lebanese ID card, return: {"error": "not_lebanese_id"}`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image
        }
      }
    ]);

    let text = result.response.text().trim();
    console.log('Gemini raw response:', text);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.log('JSON parse failed for:', text);
      return res.status(400).json({ message: 'Could not read date of birth from ID. Please try a clearer photo.' });
    }

    if (parsed.error === 'not_lebanese_id') {
      return res.status(400).json({ 
        message: 'Please upload a valid Lebanese national ID card.' 
      });
    }

    console.log('Parsed date:', parsed.date_of_birth);

    const dob = new Date(parsed.date_of_birth);
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
        date_of_birth: parsed.date_of_birth,
        age
      });
    }

    res.json({
      eligible: true,
      message: 'Age verified successfully!',
      date_of_birth: parsed.date_of_birth,
      age
    });

  } catch (error) {
    console.error('ID scan error:', error.message);
    res.status(500).json({ message: 'Failed to scan ID', error: error.message });
  }
});

module.exports = router;