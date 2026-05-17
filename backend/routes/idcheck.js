router.post('/scan', upload.single('id_photo'), async (req, res) => {
  try {
    console.log('=== REQUEST RECEIVED ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file ? { size: req.file.size, mimetype: req.file.mimetype } : 'NO FILE');

    if (!req.file) {
      console.log('❌ No file in request');
      return res.status(400).json({ message: 'No image uploaded' });
    }

    console.log('✅ File received, converting to base64...');
    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    console.log('📤 Sending to Claude:', req.file.size, 'bytes');
    console.log('🔑 API Key exists:', !!process.env.ANTHROPIC_API_KEY);

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: `Look at this Lebanese ID card. Extract the date of birth (تاريخ الولادة).

Return ONLY valid JSON:
{"date_of_birth": "YYYY-MM-DD"}

If NOT a Lebanese ID:
{"error": "not_lebanese_id"}`
            }
          ]
        }
      ]
    });

    console.log('✅ Claude response received');
    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    console.log('Response text:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(400).json({ message: 'Please upload a valid Lebanese national ID card.' });
    }

    let result = JSON.parse(jsonMatch[0]);

    if (result.error === 'not_lebanese_id') {
      return res.status(400).json({ message: 'Please upload a valid Lebanese national ID card.' });
    }

    if (!result.date_of_birth) {
      return res.status(400).json({ message: 'Could not read date of birth. Try a clearer photo.' });
    }

    result.date_of_birth = fixDate(result.date_of_birth);
    console.log('📅 Date:', result.date_of_birth);

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
    console.error('❌ FULL ERROR:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: error.message || 'Failed to scan ID' });
  }
});