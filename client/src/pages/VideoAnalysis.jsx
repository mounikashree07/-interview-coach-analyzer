import { useState, useRef } from 'react';
import axios from 'axios';

export default function VideoAnalysis() {
  const [question, setQuestion] = useState('Tell me about a challenging project you worked on.');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const startRecording = () => {
    setError(''); setResult(null); setTranscript(''); finalTranscriptRef.current = '';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) { setError('Please use Google Chrome for voice analysis.'); return; }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscriptRef.current += text + ' ';
        else interim += text;
      }
      setTranscript(finalTranscriptRef.current + interim);
    };
    recognition.onerror = () => { setError('Something interrupted the recording.'); setIsRecording(false); };
    recognition.start();
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) recognitionRef.current.stop();
    const durationSeconds = (Date.now() - startTimeRef.current) / 1000;
    setIsRecording(false);
    const finalText = finalTranscriptRef.current.trim();
    if (finalText.length < 10) { setError('No speech was detected. Please try again.'); return; }
    try {
      setLoading(true);
      const res = await axios.post('/api/media/analyze', { transcript: finalText, durationSeconds, question });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something interrupted the analysis.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-obsidian text-porcelain">
      <div className="max-w-2xl mx-auto px-8 py-24">
        <p className="font-ui text-[11px] tracking-[0.2em] text-taupe uppercase mb-4">Voice & delivery</p>
        <h1 className="font-editorial text-5xl mb-4">Hear what you sound like.</h1>
        <p className="font-ui text-taupe text-sm mb-14">Works best in Google Chrome.</p>

        <p className="font-editorial text-2xl mb-8">{question}</p>

        <div className="flex items-center gap-4 mb-8">
          {!isRecording ? (
            <button onClick={startRecording} disabled={loading}
              className="font-ui text-[13px] tracking-wide bg-champagne text-obsidian px-8 py-3 rounded-sm hover:brightness-110 transition-all duration-300 disabled:opacity-40">
              Begin recording
            </button>
          ) : (
            <button onClick={stopRecording} className="font-ui text-[13px] tracking-wide border border-qborder text-porcelain px-8 py-3 rounded-sm hover:border-champagne transition-all duration-300">
              Finish →
            </button>
          )}
          {isRecording && (
            <span className="font-ui text-[11px] text-rose flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose animate-pulse" /> Listening…
            </span>
          )}
        </div>

        {transcript && (
          <p className="font-ui text-sm text-taupe italic mb-8 leading-relaxed">"{transcript}"</p>
        )}
        {error && <p className="font-ui text-sm text-rose mb-8">{error}</p>}
        {loading && <p className="font-ui text-sm text-taupe">Analyzing your responses…</p>}

        {result && (
          <div className="mt-16 space-y-14">
            <div className="grid grid-cols-3 gap-8">
              {[
                ['Tone', result.toneScore],
                ['Pace', result.wordsPerMinute],
                ['Filler words', result.fillerWords.total],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="font-editorial text-5xl text-champagne">{val}</p>
                  <p className="font-ui text-[11px] tracking-wide text-taupe uppercase mt-2">{label}</p>
                </div>
              ))}
            </div>
            {[
              ['Pacing', result.pacingFeedback],
              ['Clarity', result.clarityFeedback],
              ['Confidence', result.confidenceFeedback],
              ['Overall', result.overallImpression],
            ].map(([label, text]) => (
              <div key={label} className="border-t border-qborder pt-6">
                <p className="font-ui text-[11px] tracking-wide text-taupe uppercase mb-2">{label}</p>
                <p className="font-ui text-sm text-porcelain/80 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
