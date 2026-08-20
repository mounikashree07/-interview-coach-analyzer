import { useState, useRef } from 'react';
import axios from 'axios';

export default function VideoAnalysis() {
  const [question, setQuestion] = useState('Tell me about a challenging project you worked on.');
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const finalTranscriptRef = useRef('');

  const startRecording = () => {
    setError('');
    setResult(null);
    setTranscript('');
    finalTranscriptRef.current = '';

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      setError('Speech recognition is not supported in this browser. Please use Google Chrome.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscriptRef.current += text + ' ';
        } else {
          interim += text;
        }
      }
      setTranscript(finalTranscriptRef.current + interim);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setError(`Recording error: ${event.error}. Please try again.`);
      setIsRecording(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    const durationSeconds = (Date.now() - startTimeRef.current) / 1000;
    setDuration(durationSeconds);
    setIsRecording(false);

    const finalText = finalTranscriptRef.current.trim();
    if (finalText.length < 10) {
      setError('No speech was detected. Please try recording again, speaking clearly.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/media/analyze', {
        transcript: finalText,
        durationSeconds,
        question,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong analyzing your answer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Video/Audio Answer Analysis</h2>
      <p className="text-sm text-gray-500 mb-4">Works best in Google Chrome.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Question to answer</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isRecording}
          className="block w-full text-sm border border-gray-300 rounded-md p-2"
        />
      </div>

      <div className="flex gap-3 mb-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            ● Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            ■ Stop & Analyze
          </button>
        )}
      </div>

      {isRecording && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700 font-medium">🔴 Recording... speak your answer now.</p>
        </div>
      )}

      {transcript && (
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-xs text-gray-500 mb-1">Live transcript:</p>
          <p className="text-sm">{transcript}</p>
        </div>
      )}

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {loading && <p className="text-sm text-gray-500">Analyzing your answer...</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500">Tone Score</p>
              <p className="text-2xl font-bold text-indigo-600">{result.toneScore}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500">Words/Min</p>
              <p className="text-2xl font-bold text-indigo-600">{result.wordsPerMinute}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-xs text-gray-500">Filler Words</p>
              <p className="text-2xl font-bold text-indigo-600">{result.fillerWords.total}</p>
            </div>
          </div>

          {result.fillerWords.total > 0 && (
            <div>
              <p className="text-sm font-medium mb-1">Filler word breakdown:</p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(result.fillerWords.breakdown).map(([word, count]) => (
                  <span key={word} className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                    "{word}" × {count}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-sm font-medium">Pacing</p>
            <p className="text-sm text-gray-700">{result.pacingFeedback}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Clarity</p>
            <p className="text-sm text-gray-700">{result.clarityFeedback}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Confidence</p>
            <p className="text-sm text-gray-700">{result.confidenceFeedback}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Overall Impression</p>
            <p className="text-sm text-gray-700">{result.overallImpression}</p>
          </div>
        </div>
      )}
    </div>
  );
}
