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
              text: 'Find the تاريخ الولادة field in this Lebanese ID card. Copy the EXACT digits you see without converting them. The date format is DD/MM/YYYY. Return ONLY this JSON: {"date_of_birth": "DD/MM/YYYY"} with the actual digits from the card. If not a Lebanese ID return: {"error": "not_lebanese_id"}'
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
    
    // Convert Arabic-Indic numerals to Western
    text = arabicToWestern(text);
    
    // Remove markdown
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

    // Convert DD/MM/YYYY to YYYY-MM-DD
    if (result.date_of_birth && result.date_of_birth.includes('/')) {
      const parts = result.date_of_birth.split('/')
      if (parts.length === 3) {
        result.date_of_birth = `${parts[2]}-${parts[1].padStart(2,'0')}-${parts[0].padStart(2,'0')}`
      }
    }

    console.log('Converted date:', result.date_of_birth);

    const dob = new Date(result.date_of_birth);
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