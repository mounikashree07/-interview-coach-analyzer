import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.jsx';
import MockInterview from './pages/MockInterview.jsx';
import VideoAnalysis from './pages/VideoAnalysis.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
      <Route path="/mock-interview" element={<MockInterview />} />
      <Route path="/video-analysis" element={<VideoAnalysis />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
}
