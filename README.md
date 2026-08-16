# AI Interview Coach Analyzer

A full-stack platform to help job seekers prepare for interviews: resume/JD
match analysis, AI-driven mock interview Q&A with feedback, and audio/video
answer analysis (filler words, pacing, tone).

## Stack
- Frontend: React + Tailwind
- Backend: Node.js + Express
- Database: MongoDB
- AI: LLM API (feedback generation, scoring, question generation)

## Structure
```
client/   React frontend
server/   Express backend (routes, models, controllers)
```

## Modules
1. **Resume + JD Match Analyzer** — upload resume, paste job description, get a
   match score, skill gaps, and rewrite suggestions.
2. **Mock Interview Q&A** — role-based AI-generated questions, text/spoken
   answers, AI feedback on structure/relevance/specificity.
3. **Video/Audio Analysis** — transcribe recorded answers, detect filler
   words, estimate pacing, give tone feedback.

## Setup
```bash
cd server
cp .env.example .env   # fill in MONGO_URI and LLM_API_KEY
npm install
npm run dev
```

## Status
Project skeleton — Week 1 of a 12-week build plan. Routes currently return
501 placeholders; implementation follows the roadmap phase by phase.
