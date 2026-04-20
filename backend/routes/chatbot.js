const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/screen', async (req, res) => {
  const { donor_id, answers } = req.body;

  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gemma3',
        prompt: `You are a blood donation health screener. Based on the following answers, determine if the donor is eligible to donate blood. Reply with JSON only, no markdown, no backticks, no extra text. Only output this exact format:
{"eligible": true, "reason": "explanation"}

Donor answers: ${JSON.stringify(answers)}`,
        stream: false,
        format: 'json'
      })
    });

    const data = await response.json();
    
    let result;
    try {
      result = JSON.parse(data.response);
    } catch {
      result = { eligible: true, reason: data.response };
    }

    const sql = `INSERT INTO health_screenings (donor_id, questions, answers, is_eligible) VALUES (?, ?, ?, ?)`;
    const questions = Object.keys(answers).join(', ');
    const answersStr = JSON.stringify(answers);

    db.query(sql, [donor_id, questions, answersStr, result.eligible], (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to save screening', error: err.message });
      }

      const updateSql = `UPDATE donors SET is_eligible = ? WHERE id = ?`;
      db.query(updateSql, [result.eligible, donor_id], () => {
        res.json({
          eligible: result.eligible,
          reason: result.reason
        });
      });
    });

  } catch (error) {
    res.status(500).json({ message: 'Chatbot error', error: error.message });
  }
});

module.exports = router;