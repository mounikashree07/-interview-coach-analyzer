import { useState } from 'react';
import axios from 'axios';

export default function ResumeAnalyzer() {
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!resumeFile) { setError('Please upload your resume as a PDF.'); return; }
    if (jobDescription.trim().length < 20) { setError('Please paste a job description.'); return; }

    const formData = new FormData();
    formData.append('resume', resumeFile);
    formData.append('jobDescription', jobDescription);

    try {
      setLoading(true);
      const res = await axios.post('/api/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something interrupted the analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-porcelain">
      <div className="max-w-2xl mx-auto px-8 py-24">
        <p className="font-ui text-[11px] tracking-[0.2em] text-taupe uppercase mb-4">Resume analysis</p>
        <h1 className="font-editorial text-5xl mb-14">Understand your fit.</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block font-ui text-[11px] tracking-wide text-taupe uppercase mb-3">Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setResumeFile(e.target.files[0])}
              className="block w-full font-ui text-sm text-taupe file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border-0 file:bg-graphite file:text-porcelain file:text-xs"
            />
          </div>
          <div>
            <label className="block font-ui text-[11px] tracking-wide text-taupe uppercase mb-3">Job description</label>
            <textarea
              rows={8}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the role here..."
              className="block w-full bg-graphite border border-qborder rounded-md px-4 py-3 text-sm text-porcelain placeholder-taupe/40 focus:outline-none focus:border-champagne transition-colors duration-300"
            />
          </div>
          {error && <p className="font-ui text-sm text-rose">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="font-ui text-[13px] tracking-wide bg-champagne text-obsidian px-8 py-3 rounded-sm hover:brightness-110 transition-all duration-300 disabled:opacity-40"
          >
            {loading ? 'Analyzing…' : 'Begin analysis →'}
          </button>
        </form>

        {result && (
          <div className="mt-20 space-y-14">
            <div>
              <p className="font-ui text-[11px] tracking-wide text-taupe uppercase mb-2">Match score</p>
              <p className="font-editorial text-8xl text-champagne">{result.matchScore}</p>
              <div className="h-px bg-qborder mt-6 relative overflow-hidden">
                <div className="h-px bg-champagne absolute left-0 top-0" style={{ width: `${result.matchScore}%` }} />
              </div>
            </div>

            <div>
              <p className="font-ui text-[11px] tracking-wide text-taupe uppercase mb-4">Present</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {result.matchedSkills?.map((s, i) => (
                  <span key={i} className="font-ui text-sm text-porcelain">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-ui text-[11px] tracking-wide text-taupe uppercase mb-4">Missing</p>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                {result.missingSkills?.map((s, i) => (
                  <span key={i} className="font-ui text-sm text-rose">{s}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-editorial text-2xl text-porcelain mb-5">What to refine</p>
              <ul className="space-y-4">
                {result.suggestions?.map((s, i) => (
                  <li key={i} className="font-ui text-sm text-taupe leading-relaxed border-l border-qborder pl-4">{s}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
