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

    if (!resumeFile) {
      setError('Please upload your resume as a PDF.');
      return;
    }
    if (jobDescription.trim().length < 20) {
      setError('Please paste a job description (at least a few sentences).');
      return;
    }

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
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Resume + Job Description Match Analyzer</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Resume (PDF)</label>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files[0])}
            className="block w-full text-sm border border-gray-300 rounded-md p-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Description</label>
          <textarea
            rows={8}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="block w-full text-sm border border-gray-300 rounded-md p-2"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Match'}
        </button>
      </form>

      {result && (
        <div className="mt-8 space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Match Score</h3>
            <p className="text-3xl font-bold text-indigo-600">{result.matchScore}/100</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Matched Skills</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {result.matchedSkills?.map((skill, i) => (
                <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Missing Skills</h3>
            <div className="flex flex-wrap gap-2 mt-1">
              {result.missingSkills?.map((skill, i) => (
                <span key={i} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold">Suggestions</h3>
            <ul className="list-disc list-inside text-sm space-y-1 mt-1">
              {result.suggestions?.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
