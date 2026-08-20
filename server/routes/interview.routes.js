const express = require('express');
const axios = require('axios');
const InterviewSession = require('../models/InterviewSession');

const router = express.Router();

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

// Calls Gemini with automatic retry on temporary overload (503) or timeout.
async function callGeminiWithRetry(payload, apiKey, maxAttempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await axios.post(
        `${GEMINI_API_URL}?key=${apiKey}`,
        payload,
        { headers: { 'Content-Type': 'application/json' }, timeout: 20000 }
      );
      return response;
    } catch (err) {
      lastError = err;
      const status = err.response?.status;
      const isRetryable = status === 503 || status === 429 || err.code === 'ECONNABORTED';
      if (!isRetryable || attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastError;
}

function extractJson(rawText) {
  const cleaned = rawText.replace(/^```json\s*|```$/g, '').trim();
  return JSON.parse(cleaned);
}

// POST /api/interview/questions
// Body: { role: string, jobDescription?: string, count?: number }
// Returns: { questions: string[] }
router.post('/questions', async (req, res) => {
  try {
    const { role, jobDescription, count = 5 } = req.body;

    if (!role || role.trim().length < 2) {
      return res.status(400).json({ error: 'Please provide a target role (e.g. "Frontend Developer").' });
    }

    const prompt = `You are an experienced technical interviewer. Generate ${count} realistic interview questions for a candidate applying to the role: "${role}".
${jobDescription ? `Use this job description for context:\n"""${jobDescription.slice(0, 2000)}"""\n` : ''}
Mix question types: a couple behavioral, a couple role/technical-knowledge, and one situational/problem-solving question.

Return ONLY valid JSON (no markdown, no preamble) in exactly this shape:
{
  "questions": [<string>, <string>, ...]
}`;

    const geminiResponse = await callGeminiWithRetry(
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7 } },
      process.env.LLM_API_KEY
    );

    const rawText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
      parsed = extractJson(rawText);
    } catch (e) {
      console.error('Failed to parse questions JSON:', rawText);
      return res.status(502).json({ error: 'AI response could not be parsed. Please try again.' });
    }

    res.json({ questions: parsed.questions });
  } catch (err) {
    if (err.response) {
      console.error('Gemini API error (questions):', err.response.status, err.response.data);
      if (err.response.status === 503) {
        return res.status(503).json({ error: 'The AI service is temporarily overloaded. Please try again.' });
      }
    } else {
      console.error('Question generation error:', err);
    }
    res.status(500).json({ error: 'Something went wrong generating questions.' });
  }
});

// POST /api/interview/feedback
// Body: { role: string, question: string, answer: string }
// Returns: { score: number, strengths: string[], improvements: string[], feedback: string }
router.post('/feedback', async (req, res) => {
  try {
    const { role, question, answer } = req.body;

    if (!question || !answer || answer.trim().length < 5) {
      return res.status(400).json({ error: 'Please provide an answer to get feedback.' });
    }

    const prompt = `You are an expert interview coach evaluating a candidate's answer for a "${role || 'general'}" role interview.

QUESTION: "${question}"

CANDIDATE'S ANSWER: "${answer}"

Evaluate the answer on structure, relevance to the question, and specificity (concrete examples/details vs vague statements).

Return ONLY valid JSON (no markdown, no preamble) in exactly this shape:
{
  "score": <number 0-100>,
  "strengths": [<string>, ...],
  "improvements": [<string>, ...],
  "feedback": <string, a short 2-3 sentence overall verdict>
}`;

    const geminiResponse = await callGeminiWithRetry(
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3 } },
      process.env.LLM_API_KEY
    );

    const rawText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let parsed;
    try {
      parsed = extractJson(rawText);
    } catch (e) {
      console.error('Failed to parse feedback JSON:', rawText);
      return res.status(502).json({ error: 'AI response could not be parsed. Please try again.' });
    }

    res.json(parsed);
  } catch (err) {
    if (err.response) {
      console.error('Gemini API error (feedback):', err.response.status, err.response.data);
      if (err.response.status === 503) {
        return res.status(503).json({ error: 'The AI service is temporarily overloaded. Please try again.' });
      }
    } else {
      console.error('Feedback generation error:', err);
    }
    res.status(500).json({ error: 'Something went wrong generating feedback.' });
  }
});

// POST /api/interview/session -> save a completed session
// Body: { role, questions: string[], answers: string[], feedback: string[], overallScore: number }
router.post('/session', async (req, res) => {
  try {
    const { role, questions, answers, feedback, overallScore } = req.body;
    const saved = await InterviewSession.create({ role, questions, answers, feedback, overallScore });
    res.json({ id: saved._id });
  } catch (err) {
    console.error('Session save error:', err);
    res.status(500).json({ error: 'Could not save this session.' });
  }
});

module.exports = router;
