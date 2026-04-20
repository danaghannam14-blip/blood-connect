const express = require('express');
const router = express.Router();
const db = require('../db');
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/screen', async (req, res) => {
  const { donor_id, answers } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are a blood donation health screener. Reply with JSON only, no markdown, no backticks, no extra text. Format: {"eligible": true, "reason": "explanation"} or {"eligible": false, "reason": "explanation"}'
        },
        {
          role: 'user',
          content: `Based on these answers, is this person eligible to donate blood? ${JSON.stringify(answers)}`
        }
      ],
      temperature: 0.3
    });

    let text = completion.choices[0].message.content.trim();
    
    // Remove markdown backticks if present
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      // If still can't parse, create a default response
      const isEligible = !answers.chronic_illness?.includes('yes') && 
                         !answers.recent_surgery?.includes('yes')
      result = { 
        eligible: isEligible, 
        reason: text 
      };
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
        res.json({ eligible: result.eligible, reason: result.reason });
      });
    });

 } catch (error) {
    console.error('Groq full error:', JSON.stringify(error));
    res.status(500).json({ message: 'Chatbot error', error: error.message, full: JSON.stringify(error) });
  }
});

module.exports = router;