router.post('/scan', upload.single('id_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log('📤 Sending to Groq:', req.file.size, 'bytes');

    const completion = await groq.chat.completions.create({
      model: 'llama-3.2-11b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Look at this Lebanese ID card image. Find the date of birth (تاريخ الولادة).
Return ONLY valid JSON:
{"date_of_birth": "YYYY-MM-DD"}

If you cannot read it clearly, return:
{"error": "cannot_read"}`
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
      temperature: 0,
      max_completion_tokens: 50
    });

    let text = completion.choices[0].message.content.trim();
    console.log('Groq response:', text);
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.log('Parse failed:', text);
      return res.status(400).json({ message: 'Could not read ID. Try a clearer, well-lit photo.' });
    }

    if (result.error) {
      return res.status(400).json({ message: 'Please upload a valid Lebanese national ID card.' });
    }

    if (!result.date_of_birth) {
      return res.status(400).json({ message: 'Could not find date of birth on ID.' });
    }

    // Fix date format
    result.date_of_birth = fixDate(result.date_of_birth);
    console.log('Fixed date:', result.date_of_birth);

    // Calculate age
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
        message: 'You must be at least 18 years old.',
        age
      });
    }

    res.json({
      eligible: true,
      message: 'Age verified!',
      date_of_birth: result.date_of_birth,
      age
    });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ message: 'Scan failed. Please try again.' });
  }
});