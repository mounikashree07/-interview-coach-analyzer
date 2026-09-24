import { useState } from 'react';
import axios from 'axios';

const STAGE = { SETUP: 'setup', ANSWERING: 'answering', SUMMARY: 'summary' };

export default function MockInterview() {
  const [stage, setStage] = useState(STAGE.SETUP);
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState([]);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateQuestions = async (e) => {
    e.preventDefault();
    setError('');
    if (role.trim().length < 2) { setError('Please enter a target role.'); return; }
    try {
      setLoading(true);
      const res = await axios.post('/api/interview/questions', { role, jobDescription, count: 5 });
      setQuestions(res.data.questions);
      setAnswers([]); setFeedbackList([]); setCurrentIndex(0);
      setStage(STAGE.ANSWERING);
    } catch (err) {
      setError(err.response?.data?.error || 'Something interrupted the setup.');
    } finally { setLoading(false); }
  };

  const handleSubmitAnswer = async () => {
    setError('');
    if (currentAnswer.trim().length < 5) { setError('Please write an answer.'); return; }
    try {
      setLoading(true);
      const res = await axios.post('/api/interview/feedback', { role, question: questions[currentIndex], answer: currentAnswer });
      const newAnswers = [...answers, currentAnswer];
      const newFeedback = [...feedbackList, res.data];
      setAnswers(newAnswers); setFeedbackList(newFeedback); setCurrentAnswer('');
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        const overallScore = Math.round(newFeedback.reduce((s, f) => s + (f.score || 0), 0) / newFeedback.length);
        try {
          await axios.post('/api/interview/session', { role, questions, answers: newAnswers, feedback: newFeedback.map((f) => f.feedback), overallScore });
        } catch {}
        setStage(STAGE.SUMMARY);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something interrupted the analysis.');
    } finally { setLoading(false); }
  };

  const overallScore = feedbackList.length > 0
    ? Math.round(feedbackList.reduce((s, f) => s + (f.score || 0), 0) / feedbackList.length) : 0;

  return (
    <div className="min-h-screen bg-obsidian text-porcelain">
      <div className="max-w-2xl mx-auto px-8 py-24">
        {stage === STAGE.SETUP && (
          <>
            <p className="font-ui text-[11px] tracking-[0.2em] text-taupe uppercase mb-4">Interview practice</p>
            <h1 className="font-editorial text-5xl mb-14">Your next conversation.</h1>
            <form onSubmit={handleGenerateQuestions} className="space-y-8">
              <div>
                <label className="block font-ui text-[11px] tracking-wide text-taupe uppercase mb-3">Role</label>
                <input type="text" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer"
                  className="w-full bg-transparent border-b border-qborder pb-3 text-[15px] text-porcelain placeholder-taupe/30 focus:outline-none focus:border-champagne transition-colors duration-300" />
              </div>
              <div>
                <label className="block font-ui text-[11px] tracking-wide text-taupe uppercase mb-3">Job description (optional)</label>
                <textarea rows={4} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-graphite border border-qborder rounded-md px-4 py-3 text-sm text-porcelain placeholder-taupe/40 focus:outline-none focus:border-champagne transition-colors duration-300" />
              </div>
              {error && <p className="font-ui text-sm text-rose">{error}</p>}
              <button type="submit" disabled={loading}
                className="font-ui text-[13px] tracking-wide bg-champagne text-obsidian px-8 py-3 rounded-sm hover:brightness-110 transition-all duration-300 disabled:opacity-40">
                {loading ? 'Preparing…' : 'Begin interview →'}
              </button>
            </form>
          </>
        )}

        {stage === STAGE.ANSWERING && (
          <div>
            <p className="font-ui text-taupe text-sm mb-8">{String(currentIndex + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}</p>
            <p className="font-editorial text-3xl leading-snug mb-10">{questions[currentIndex]}</p>
            <textarea rows={6} value={currentAnswer} onChange={(e) => setCurrentAnswer(e.target.value)} placeholder="Your answer..."
              className="w-full bg-graphite border border-qborder rounded-md px-4 py-3 text-sm text-porcelain placeholder-taupe/40 focus:outline-none focus:border-champagne transition-colors duration-300" />
            {error && <p className="font-ui text-sm text-rose mt-3">{error}</p>}
            <button onClick={handleSubmitAnswer} disabled={loading}
              className="mt-6 font-ui text-[13px] tracking-wide bg-champagne text-obsidian px-8 py-3 rounded-sm hover:brightness-110 transition-all duration-300 disabled:opacity-40">
              {loading ? 'Evaluating…' : currentIndex + 1 < questions.length ? 'Continue →' : 'Finish →'}
            </button>
          </div>
        )}

        {stage === STAGE.SUMMARY && (
          <div className="space-y-16">
            <div>
              <p className="font-ui text-[11px] tracking-wide text-taupe uppercase mb-2">Overall performance</p>
              <p className="font-editorial text-8xl text-champagne">{overallScore}</p>
            </div>
            {questions.map((q, i) => (
              <div key={i} className="border-t border-qborder pt-8">
                <p className="font-editorial text-2xl mb-3">{q}</p>
                <p className="font-ui text-sm text-taupe italic mb-4">"{answers[i]}"</p>
                <p className="font-ui text-[11px] tracking-wide text-champagne uppercase mb-2">{feedbackList[i]?.score} / 100</p>
                <p className="font-ui text-sm text-porcelain/80 leading-relaxed">{feedbackList[i]?.feedback}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
