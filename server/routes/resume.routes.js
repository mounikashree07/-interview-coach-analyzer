const express = require('express');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const axios = require('axios');
const ResumeAnalysis = require('../models/ResumeAnalysis');

const router = express.Router();

// Store uploaded file in memory (not on disk) since we only need the text
const upload = multer({ storage: multer.memoryStorage() });

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

// Calls Gemini with automatic retry on temporary overload (503) or timeout.
// Tries up to 3 times with a short delay between attempts, and gives each
// attempt a 20s timeout so a single hung request never blocks forever.
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
      // Wait 1.5s, 3s, ... before retrying
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastError;
}

// POST /api/resume/analyze
// Expects multipart/form-data: fields = { resume: <PDF file>, jobDescription: <text> }
router.post('/analyze', upload.single('resume'), async (req, res) => {
  try {
    const { jobDescription } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Resume PDF file is required.' });
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      return res.status(400).json({ error: 'Please provide a valid job description.' });
    }

    // 1. Extract text from the uploaded PDF
    const parser = new PDFParse({ data: req.file.buffer });
    const pdfData = await parser.getText();
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length < 50) {
      return res.status(400).json({ error: 'Could not extract readable text from this PDF.' });
    }

    // 2. Ask Gemini to compare resume vs JD and return structured JSON
    const prompt = `You are an expert technical recruiter. Compare the RESUME below against the JOB DESCRIPTION.

Return ONLY valid JSON (no markdown, no preamble) in exactly this shape:
{
  "matchScore": <number 0-100>,
  "matchedSkills": [<string>, ...],
  "missingSkills": [<string>, ...],
  "suggestions": [<string>, ...]
}

Rules:
- matchScore reflects how well the resume fits the job description overall.
- matchedSkills: skills/keywords present in both.
- missingSkills: important skills from the JD that are missing or weak in the resume.
- suggestions: 3-6 concrete, actionable rewrite suggestions to improve the resume for this JD.

RESUME:
"""${resumeText.slice(0, 6000)}"""

JOB DESCRIPTION:
"""${jobDescription.slice(0, 3000)}"""`;

    const geminiResponse = await callGeminiWithRetry(
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3 },
      },
      process.env.LLM_API_KEY
    );

    const rawText =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Strip markdown code fences in case the model wraps the JSON in ```json ... ```
    const cleaned = rawText.replace(/^```json\s*|```$/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse Gemini response as JSON:', rawText);
      return res.status(502).json({ error: 'AI response could not be parsed. Please try again.' });
    }

    // 3. Save to MongoDB (optional: skip if user isn't logged in yet)
    const saved = await ResumeAnalysis.create({
      jobDescription,
      matchScore: parsed.matchScore,
      matchedSkills: parsed.matchedSkills,
      missingSkills: parsed.missingSkills,
      suggestions: parsed.suggestions,
    });

    res.json({
      id: saved._id,
      matchScore: parsed.matchScore,
      matchedSkills: parsed.matchedSkills,
      missingSkills: parsed.missingSkills,
      suggestions: parsed.suggestions,
    });
  } catch (err) {
    if (err.response) {
      console.error('Gemini API error:', err.response.status, err.response.data);
      if (err.response.status === 503) {
        return res.status(503).json({
          error: 'The AI service is temporarily overloaded. Please wait a moment and try again.',
        });
      }
    } else {
      console.error('Resume analysis error:', err);
    }
    res.status(500).json({ error: 'Something went wrong analyzing your resume.' });
  }
});

module.exports = router;
