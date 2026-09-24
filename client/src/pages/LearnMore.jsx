import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import TiltCard from '../components/TiltCard.jsx';
import { useReveal } from '../hooks/useReveal.js';

const layers = [
  { depth: 0.02, size: 300, x: '10%', y: '20%', color: '#E8A33D', blur: 80 },
  { depth: 0.04, size: 220, x: '75%', y: '15%', color: '#1F6F6B', blur: 90 },
  { depth: 0.015, size: 260, x: '60%', y: '70%', color: '#F3C47A', blur: 100 },
];

export default function LearnMore() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (e) => {
      setMouse({ x: e.clientX - window.innerWidth / 2, y: e.clientY - window.innerHeight / 2 });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div className="bg-ink text-white min-h-screen overflow-hidden relative">
      {/* Parallax glow layers */}
      {layers.map((l, i) => (
        <div
          key={i}
          className="pointer-events-none absolute rounded-full opacity-25 transition-transform duration-200 ease-out"
          style={{
            width: l.size,
            height: l.size,
            left: l.x,
            top: l.y,
            background: l.color,
            filter: `blur(${l.blur}px)`,
            transform: `translate(${mouse.x * l.depth}px, ${mouse.y * l.depth}px)`,
          }}
        />
      ))}

      <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-32">
        <p className="font-mono text-xs text-teal uppercase tracking-widest mb-3">How it works</p>
        <h1 className="font-display font-semibold text-5xl sm:text-6xl leading-[1.05] max-w-2xl mb-6">
          Three tools. One rehearsal loop.
        </h1>
        <p className="text-white/60 text-lg max-w-xl leading-relaxed">
          Nothing here is scripted in advance. Every question, every score, and every piece
          of delivery feedback is generated live from what you actually submit.
        </p>

        <div className="mt-20 space-y-24">
          <LoopStep
            num="01"
            title="Match your resume to the role"
            desc="A resume and a job description go in. What comes out is a match score, a list of skills that genuinely overlap, the gaps that matter, and rewrite suggestions specific to that gap — not a generic resume checklist."
          />
          <LoopStep
            num="02"
            title="Answer questions built for that role"
            desc="Questions are generated fresh for the target role — a mix of behavioral, technical, and situational. Each answer is scored on structure, relevance, and specificity, with feedback explaining the score, not just a number."
          />
          <LoopStep
            num="03"
            title="Hear how you actually sound"
            desc="Speak the answer instead of typing it. Filler words are counted, pace is measured in words per minute, and tone is evaluated from the transcript of your own voice — the layer text-based practice can't reach."
          />
        </div>

        <TiltCard className="mt-28">
          <div className="border border-white/10 bg-inksoft rounded-2xl p-10 text-center">
            <h3 className="font-display font-semibold text-2xl mb-3">Ready to see where you actually stand?</h3>
            <p className="text-white/50 text-sm mb-6 max-w-md mx-auto">
              Start with your resume, or jump straight into a mock interview — the loop works from either end.
            </p>
            <Link
              to="/resume-analyzer"
              className="inline-flex items-center gap-2 bg-amber text-ink font-medium px-6 py-3 rounded-lg text-sm hover:bg-amberdim transition-all hover:scale-105"
            >
              Get started <ArrowRight size={15} />
            </Link>
          </div>
        </TiltCard>
      </div>
    </div>
  );
}

function LoopStep({ num, title, desc }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      className={`grid md:grid-cols-[100px_1fr] gap-6 transition-all duration-700 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
      }`}
    >
      <span className="font-mono text-5xl font-semibold text-white/10">{num}</span>
      <div>
        <h3 className="font-display font-semibold text-2xl mb-3">{title}</h3>
        <p className="text-white/60 leading-relaxed max-w-xl">{desc}</p>
      </div>
    </div>
  );
}
