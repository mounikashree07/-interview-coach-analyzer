import { useState } from 'react';
import axios from 'axios';

const STAGE = {
  SETUP: 'setup',
  ANSWERING: 'answering',
  SUMMARY: 'summary',
};

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
    if (role.trim().length < 2) {
      setError('Please enter a target role.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post('/api/interview/questions', { role, jobDescription, count: 5 });
      setQuestions(res.data.questions);
      setAnswers([]);
      setFeedbackList([]);
      setCurrentIndex(0);
      setStage(STAGE.ANSWERING);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong generating questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    setError('');
    if (currentAnswer.trim().length < 5) {
      setError('Please write an answer before submitting.');
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post('/api/interview/feedback', {
        role,
        question: questions[currentIndex],
        answer: currentAnswer,
      });

      const newAnswers = [...answers, currentAnswer];
      const newFeedback = [...feedbackList, res.data];
      setAnswers(newAnswers);
      setFeedbackList(newFeedback);
      setCurrentAnswer('');

      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // Save the completed session
        const overallScore = Math.round(
          newFeedback.reduce((sum, f) => sum + (f.score || 0), 0) / newFeedback.length
        );
        try {
          await axios.post('/api/interview/session', {
            role,
            questions,
            answers: newAnswers,
            feedback: newFeedback.map((f) => f.feedback),
            overallScore,
          });
        } catch (saveErr) {
          console.error('Could not save session:', saveErr);
        }
        setStage(STAGE.SUMMARY);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong getting feedback.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = () => {
    setStage(STAGE.SETUP);
    setRole('');
    setJobDescription('');
    setQuestions([]);
    setCurrentIndex(0);
    setCurrentAnswer('');
    setAnswers([]);
    setFeedbackList([]);
    setError('');
  };

  const overallScore =
    feedbackList.length > 0
      ? Math.round(feedbackList.reduce((sum, f) => sum + (f.score || 0), 0) / feedbackList.length)
      : 0;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Mock Interview Q&amp;A</h2>

      {stage === STAGE.SETUP && (
        <form onSubmit={handleGenerateQuestions} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Target Role</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Developer"
              className="block w-full text-sm border border-gray-300 rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Job Description (optional)</label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description for more tailored questions..."
              className="block w-full text-sm border border-gray-300 rounded-md p-2"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Generating questions...' : 'Start Mock Interview'}
          </button>
        </form>
      )}

      {stage === STAGE.ANSWERING && (
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <p className="text-lg font-medium">{questions[currentIndex]}</p>
          <textarea
            rows={6}
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="block w-full text-sm border border-gray-300 rounded-md p-2"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            onClick={handleSubmitAnswer}
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            {loading ? 'Getting feedback...' : currentIndex + 1 < questions.length ? 'Submit & Next' : 'Submit & Finish'}
          </button>

          {feedbackList.length > 0 && feedbackList[feedbackList.length - 1] && currentIndex > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm">
              <p className="font-medium">Feedback on previous answer:</p>
              <p className="text-gray-700 mt-1">{feedbackList[feedbackList.length - 1].feedback}</p>
            </div>
          )}
        </div>
      )}

      {stage === STAGE.SUMMARY && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">Overall Score</h3>
            <p className="text-3xl font-bold text-indigo-600">{overallScore}/100</p>
          </div>

          {questions.map((q, i) => (
            <div key={i} className="border border-gray-200 rounded-md p-4">
              <p className="font-medium">{q}</p>
              <p className="text-sm text-gray-600 mt-2 italic">Your answer: {answers[i]}</p>
              <div className="mt-3 text-sm">
                <p className="font-medium">Score: {feedbackList[i]?.score}/100</p>
                <p className="mt-1">{feedbackList[i]?.feedback}</p>
                {feedbackList[i]?.strengths?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-green-700">Strengths:</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {feedbackList[i].strengths.map((s, j) => <li key={j}>{s}</li>)}
                    </ul>
                  </div>
                )}
                {feedbackList[i]?.improvements?.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-amber-700">Improvements:</p>
                    <ul className="list-disc list-inside text-gray-700">
                      {feedbackList[i].improvements.map((s, j) => <li key={j}>{s}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            onClick={handleRestart}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Start Another Mock Interview
          </button>
        </div>
      )}
    </div>
  );
}
