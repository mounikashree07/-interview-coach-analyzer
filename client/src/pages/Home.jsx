import { Link } from 'react-router-dom';
import EntranceBurst from '../components/EntranceBurst.jsx';
import TiltCard from '../components/TiltCard.jsx';
import ProductPreview from '../components/ProductPreview.jsx';
import WaveformCanvas from '../components/WaveformCanvas.jsx';

const modules = [
  { num: '01', title: 'Understand your fit.', desc: 'Your resume, read against the role. Not keyword matching — a considered comparison of what\'s there, and what\'s missing.', to: '/resume-analyzer' },
  { num: '02', title: 'Practice with intention.', desc: 'Questions built for the role you\'re preparing for. Every answer considered on structure, relevance, and specificity.', to: '/mock-interview' },
  { num: '03', title: 'Hear what you sound like.', desc: 'Speak your answer. Pacing, filler words, and tone — measured from your own voice, not a script.', to: '/video-analysis' },
];

export default function Home() {
  return (
    <div className="bg-obsidian text-porcelain">
      <EntranceBurst />

      {/* Hero */}
      <section className="relative min-h-[80vh] flex items-center border-b border-qborder overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(15,23,42,0.16),rgba(2,6,23,0.78)_62%,rgba(2,6,23,0.9))]" />
        <div className="relative max-w-6xl mx-auto px-8 py-28 grid lg:grid-cols-2 gap-16 items-center w-full z-10">
          <div>
            <p className="font-ui text-[11px] tracking-[0.25em] text-taupe uppercase mb-8">Interview Analyzer</p>
            <h1 className="font-ui font-light text-6xl leading-[1.05] mb-6">
              Prepare for the
              <br />
              <span className="font-editorial text-7xl text-champagne">conversation.</span>
            </h1>
            <p className="font-ui text-taupe text-lg max-w-md leading-relaxed mb-12">
              Understand how you communicate, perform, and respond under pressure.
            </p>
            <Link to="/mock-interview" className="inline-block font-ui text-[13px] tracking-wide bg-champagne text-obsidian px-8 py-3.5 rounded-sm hover:brightness-110 transition-all duration-300">
              Begin
            </Link>
          </div>

          <TiltCard className="w-full max-w-sm mx-auto lg:ml-auto">
            <ProductPreview />
          </TiltCard>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-20 opacity-60">
          <WaveformCanvas className="w-full h-full" />
        </div>
      </section>

      {/* Modules */}
      <section className="max-w-5xl mx-auto px-8 py-32">
        <div className="space-y-24">
          {modules.map((m) => (
            <Link key={m.num} to={m.to} className="group grid md:grid-cols-[100px_1fr] gap-8 items-baseline">
              <span className="font-ui text-taupe/40 text-sm">{m.num}</span>
              <div>
                <h3 className="font-editorial text-4xl text-porcelain mb-4 group-hover:text-champagne transition-colors duration-300">
                  {m.title}
                </h3>
                <p className="font-ui text-taupe leading-relaxed max-w-lg">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
