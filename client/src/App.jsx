import { Routes, Route } from 'react-router-dom';
import MegaNavbar from './components/MegaNavbar.jsx';
import Footer from './components/Footer.jsx';
import CrazyGraphicsCanvas from './components/CrazyGraphicsCanvas.jsx';
import Home from './pages/Home.jsx';
import Login, { ProviderAuthPage } from './pages/Login.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import ResumeAnalyzer from './pages/ResumeAnalyzer.jsx';
import MockInterview from './pages/MockInterview.jsx';
import VideoAnalysis from './pages/VideoAnalysis.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <CrazyGraphicsCanvas className="fixed inset-0 z-0 pointer-events-none opacity-80 w-screen h-screen" />

      <div className="relative z-10">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/:provider" element={<ProviderAuthPage />} />
          <Route
            path="*"
            element={
              <>
                <MegaNavbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/help" element={<HelpCenter />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />
                  <Route path="/mock-interview" element={<MockInterview />} />
                  <Route path="/video-analysis" element={<VideoAnalysis />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </div>
  );
}
