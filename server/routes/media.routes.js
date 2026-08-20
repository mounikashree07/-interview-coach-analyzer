const express = require('express');
const axios = require('axios');

const router = express.Router();

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent';

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

// Common filler words/phrases to detect (case-insensitive)
const FILLER_WORDS = [
  'um', 'uh', 'like', 'you know', 'so', 'actually', 'basically',
  'literally', 'i mean', 'kind of', 'sort of', 'right', 'okay so',
];

function countFillerWords(transcript) {
  const lowerText = transcript.toLowerCase();
  const counts = {};
  let total = 0;

  FILLER_WORDS.forEach((filler) => {
    // Match as a whole word/phrase boundary
    const escaped = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'g');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      counts[filler] = matches.length;
      total += matches.length;
    }
  });

  return { total, breakdown: counts };
}

// POST /api/media/analyze
// Body: { transcript: string, durationSeconds: number, question?: string }
router.post('/analyze', async (req, res) => {
  try {
    const { transcript, durationSeconds, question } = req.body;

    if (!transcript || transcript.trim().length < 10) {
      return res.status(400).json({ error: 'No speech was detected. Please try recording again.' });
    }
    if (!durationSeconds || durationSeconds <= 0) {
      return res.status(400).json({ error: 'Missing recording duration.' });
    }

    // 1. Filler word count (computed locally, no AI needed)
    const fillerAnalysis = countFillerWords(transcript);

    // 2. Pacing: words per minute
    const wordCount = transcript.trim().split(/\s+/).length;
    const minutes = durationSeconds / 60;
    const wordsPerMinute = Math.round(wordCount / minutes);

    let pacingFeedback;
    if (wordsPerMinute < 110) {
      pacingFeedback = 'Your pace is a bit slow — aim for 120-160 words per minute for a natural conversational speed.';
    } else if (wordsPerMinute > 170) {
      pacingFeedback = 'You\'re speaking quite fast — slowing down slightly can help interviewers follow your points.';
    } else {
      pacingFeedback = 'Your speaking pace is in a good conversational range.';
    }

    // 3. AI feedback on tone, clarity, and content (based on transcript text)
    const prompt = `You are an expert interview coach. A candidate gave this SPOKEN answer (transcribed from audio)${question ? ` to the question: "${question}"` : ''}.

TRANSCRIPT: "${transcript}"

Evaluate the delivery and content: clarity of explanation, structure, confidence (based on word choice/hedging), and overall impression.

Return ONLY valid JSON (no markdown, no preamble) in exactly this shape:
{
  "toneScore": <number 0-100>,
  "clarityFeedback": <string, 1-2 sentences>,
  "confidenceFeedback": <string, 1-2 sentences>,
  "overallImpression": <string, 2-3 sentences>
}`;

    const geminiResponse = await callGeminiWithRetry(
      { contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.3 } },
      process.env.LLM_API_KEY
    );

    const rawText = geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let aiFeedback;
    try {
      aiFeedback = extractJson(rawText);
    } catch (e) {
      console.error('Failed to parse media analysis JSON:', rawText);
      return res.status(502).json({ error: 'AI response could not be parsed. Please try again.' });
    }

    res.json({
      transcript,
      wordCount,
      durationSeconds,
      wordsPerMinute,
      pacingFeedback,
      fillerWords: fillerAnalysis,
      ...aiFeedback,
    });
  } catch (err) {
    if (err.response) {
      console.error('Gemini API error (media):', err.response.status, err.response.data);
      if (err.response.status === 503) {
        return res.status(503).json({ error: 'The AI service is temporarily overloaded. Please try again.' });
      }
    } else {
      console.error('Media analysis error:', err);
    }
    res.status(500).json({ error: 'Something went wrong analyzing your answer.' });
  }
});

module.exports = router;
