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

    console.log('📤 Scanning ID - Size:', req.file.size, 'bytes');

    // Extract both date of birth and blood type from the ID
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `This is an ID card (any country/format). Extract:
1. Date of birth (in any format found, convert to YYYY-MM-DD)
2. Blood type (look on the BACK of the card - usually shown as A+, A-, B+, B-, AB+, AB-, O+, O-)

Return ONLY JSON with these exact keys:
{
  "date_of_birth": "YYYY-MM-DD",
  "blood_type": "A+" or "B-" etc,
  "country": "country name if visible"
}

If you can't find either field, still return the JSON with null for missing fields.
Do NOT return errors - try your best to extract whatever is visible.`
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
    console.log('✅ Groq extracted:', text);
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result = JSON.parse(text);

    // Validate date of birth
    if (!result.date_of_birth) {
      return res.status(400).json({ message: 'Could not read date of birth. Please provide a clearer photo of the ID.' });
    }

    result.date_of_birth = fixDate(result.date_of_birth);

    // Validate age
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

    // Validate blood type if provided
    let blood_type = result.blood_type ? result.blood_type.toUpperCase().trim() : null;
    
    if (blood_type && !VALID_BLOOD_TYPES.includes(blood_type)) {
      blood_type = null; // Invalid format, set to null and let user manually select
    }

    res.json({
      eligible: true,
      message: 'Age verified successfully!',
      date_of_birth: result.date_of_birth,
      blood_type: blood_type, // Can be null if not found on ID
      country: result.country || 'Not identified',
      age
    });

  } catch (error) {
    console.error('❌ Scan error:', error.message);
    res.status(500).json({ message: 'Failed to scan ID. Please try a clearer photo and ensure the ID is fully visible.' });
  }
});

module.exports = router;