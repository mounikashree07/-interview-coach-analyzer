import { useState } from 'react';

const faqs = [
  { q: 'How does the resume match score work?', a: 'Your resume is compared against the job description you provide by an AI model, which returns a score along with the skills that overlap and the ones that are missing.' },
  { q: 'What file formats are supported?', a: 'PDF only. Resumes made in Canva can sometimes export text as flattened graphics rather than selectable text, which prevents analysis.' },
  { q: 'Which browser should I use for voice analysis?', a: 'Google Chrome is recommended for the most reliable speech recognition support.' },
  { q: 'Is my data saved?', a: 'Resume analyses and interview sessions are saved so you can review past sessions. Nothing is shared publicly.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-qborder py-6 cursor-pointer" onClick={() => setOpen(!open)}>
      <p className="font-ui text-[15px] text-porcelain">{q}</p>
      {open && <p className="font-ui text-sm text-taupe mt-3 leading-relaxed max-w-lg">{a}</p>}
    </div>
  );
}

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-obsidian text-porcelain">
      <div className="max-w-2xl mx-auto px-8 py-24">
        <p className="font-ui text-[11px] tracking-[0.2em] text-taupe uppercase mb-4">Help</p>
        <h1 className="font-editorial text-5xl mb-16">Questions, answered plainly.</h1>
        {faqs.map((f) => <FaqItem key={f.q} {...f} />)}
      </div>
    </div>
  );
}
