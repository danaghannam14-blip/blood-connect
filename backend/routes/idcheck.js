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

router.post('/scan', upload.single('id_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log('📤 Sending to Groq:', req.file.size, 'bytes');

    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `This is a Lebanese ID card. Extract date of birth (تاريخ الولادة).
Return ONLY JSON:
{"date_of_birth": "YYYY-MM-DD"}
If NOT Lebanese ID:
{"error": "not_lebanese_id"}`
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
    console.log('✅ Groq response:', text);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result = JSON.parse(text);

    if (result.error === 'not_lebanese_id') {
      return res.status(400).json({ message: 'Please upload a valid Lebanese national ID card.' });
    }

    if (!result.date_of_birth) {
      return res.status(400).json({ message: 'Could not read date of birth. Try a clearer photo.' });
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

    res.json({
      eligible: true,
      message: 'Age verified successfully!',
      date_of_birth: result.date_of_birth,
      age
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Failed to scan ID. Please try again.' });
  }
});

module.exports = router;