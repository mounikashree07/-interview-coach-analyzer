import StarfieldCanvas from '../components/StarfieldCanvas.jsx';

export default function About() {
  return (
    <div className="relative min-h-screen bg-obsidian text-porcelain overflow-hidden">
      <StarfieldCanvas className="absolute inset-0" />

      <div className="relative max-w-2xl mx-auto px-8 py-24">
        <p className="font-ui text-[11px] tracking-[0.2em] text-taupe uppercase mb-4">About</p>
        <h1 className="font-editorial text-5xl mb-10 leading-tight">
          A foundational project, built to be used.
        </h1>

        <div className="space-y-6 font-ui text-porcelain/80 leading-relaxed">
          <p>
            Interview Analyzer began as a foundational academic project — but the intent from
            the start was to build something that actually works end to end, not a proof of
            concept that only runs in a demo. It brings together three things that usually live
            in separate, disconnected tools: resume-to-job matching, mock interview practice,
            and voice-based delivery feedback.
          </p>
          <p>
            Most interview preparation advice is generic — the same twenty tips repeated across
            a hundred articles, regardless of who you are or what role you're applying for. This
            project tries to do the opposite. Every match score is computed against the actual
            job description you provide. Every mock interview question is generated for the
            specific role you're preparing for. Every piece of delivery feedback — filler words,
            pacing, tone — comes from your own recorded voice, not a self-assessment form or a
            static checklist.
          </p>
          <p className="text-taupe">
            The three modules were built in sequence, each tested end to end before the next was
            started, and the platform was designed to be demonstrated live — not screenshotted.
            It runs on a MERN stack (MongoDB, Express, React, Node.js), with feedback generated
            live through the Gemini API, and browser-native speech recognition handling
            transcription without any paid service.
          </p>
          <p className="text-taupe">
            What you're reading this on is the same interface used to build, test, and refine
            the product itself — nothing shown here is a mockup.
          </p>
        </div>
      </div>
    </div>
  );
}
