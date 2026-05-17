const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

router.post('/scan', upload.single('id_photo'), async (req, res) => {
  let tempFile = null;
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    tempFile = path.join('/tmp', `id_${Date.now()}.jpg`);  // ✅ Remove const
    fs.writeFileSync(tempFile, req.file.buffer);

    console.log('📤 Running EasyOCR on:', tempFile);

    const pythonCode = `
import easyocr
import json
import sys

try:
    reader = easyocr.Reader(['ar', 'en'], gpu=False)
    results = reader.readtext('${tempFile}')
    text = '\\n'.join([r[1] for r in results])
    print(json.dumps({"text": text}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;

    const pythonProcess = spawn('python3', ['-c', pythonCode]);
    let output = '';
    let errorOutput = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      try {
        if (tempFile && fs.existsSync(tempFile)) fs.unlinkSync(tempFile);

        if (code !== 0) {
          console.error('Python error:', errorOutput);
          return res.status(500).json({ message: 'OCR failed. Try a clearer photo.' });
        }

        const result = JSON.parse(output);
        if (result.error) {
          return res.status(500).json({ message: 'OCR error: ' + result.error });
        }

        let text = result.text;
        console.log('✅ Extracted:', text.substring(0, 200));

        const arabicToEnglish = (str) => {
          const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
          const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
          let result = str;
          arabicNumerals.forEach((arabic, index) => {
            result = result.replace(new RegExp(arabic, 'g'), englishNumerals[index]);
          });
          return result;
        };

        text = arabicToEnglish(text);

        const dateMatch = text.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
        
        if (!dateMatch) {
          return res.status(400).json({ message: 'Please upload a valid Lebanese national ID card.' });
        }

        const year = dateMatch[1];
        const month = dateMatch[2];
        const day = dateMatch[3];

        if (year < 1900 || year > 2030) {
          return res.status(400).json({ message: 'Invalid date on ID.' });
        }

        const dateOfBirth = `${year}-${month.padStart(2,'0')}-${day.padStart(2,'0')}`;

        const dob = new Date(year, parseInt(month) - 1, parseInt(day));
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
            date_of_birth: dateOfBirth,
            age
          });
        }

        res.json({
          eligible: true,
          message: 'Age verified successfully!',
          date_of_birth: dateOfBirth,
          age
        });

      } catch (err) {
        console.error('Parse error:', err);
        res.status(500).json({ message: 'Failed to process ID.' });
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    if (tempFile && fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
    }
    res.status(500).json({ message: 'Failed to scan ID.' });
  }
});