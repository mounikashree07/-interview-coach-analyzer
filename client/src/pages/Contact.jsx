import { useState } from 'react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  return (
    <div className="min-h-screen bg-obsidian text-porcelain">
      <div className="max-w-xl mx-auto px-8 py-24">
        <p className="font-ui text-[11px] tracking-[0.2em] text-taupe uppercase mb-4">Contact</p>
        <h1 className="font-editorial text-5xl mb-16">Reach out.</h1>
        {submitted ? (
          <p className="font-ui text-taupe">Message noted — this is a preview form, no email is sent yet.</p>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-8">
            {['Name', 'Email'].map((label) => (
              <div key={label}>
                <label className="block font-ui text-[11px] tracking-wide text-taupe uppercase mb-3">{label}</label>
                <input required className="w-full bg-transparent border-b border-qborder pb-3 text-sm text-porcelain focus:outline-none focus:border-champagne transition-colors duration-300" />
              </div>
            ))}
            <div>
              <label className="block font-ui text-[11px] tracking-wide text-taupe uppercase mb-3">Message</label>
              <textarea rows={4} required className="w-full bg-graphite border border-qborder rounded-md px-4 py-3 text-sm text-porcelain focus:outline-none focus:border-champagne transition-colors duration-300" />
            </div>
            <button type="submit" className="font-ui text-[13px] tracking-wide bg-champagne text-obsidian px-8 py-3 rounded-sm hover:brightness-110 transition-all duration-300">
              Send →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
