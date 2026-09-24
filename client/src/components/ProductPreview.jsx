// A stylized "live product" mockup panel — built from real UI, not a fake
// screenshot, so it's honest about what the product actually looks like.
export default function ProductPreview() {
  return (
    <div className="relative bg-graphite border border-qborder rounded-2xl p-5 shadow-2xl">
      <div className="flex items-center gap-1.5 mb-4">
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
        <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="font-mono text-[11px] text-white/40">MATCH SCORE</p>
          <p className="font-mono text-2xl font-semibold text-champagne">72/100</p>
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-champagne to-rose rounded-full" style={{ width: '72%' }} />
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {['Agile', 'SQL', 'Stakeholder Mgmt'].map((s) => (
            <span key={s} className="font-mono text-[10px] bg-rose/10 text-rose border border-rose/30 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
          {['PRD Writing', 'Roadmapping'].map((s) => (
            <span key={s} className="font-mono text-[10px] bg-champagne/10 text-champagne border border-champagne/30 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/10 my-4" />

      <div className="space-y-2.5">
        <p className="font-mono text-[11px] text-white/40">LIVE ANSWER</p>
        <div className="flex items-end gap-[2px] h-8">
          {[6, 14, 22, 10, 18, 8, 16, 24, 12, 20, 9, 15].map((h, i) => (
            <span
              key={i}
              className="wave-bar w-1 bg-rose rounded-full"
              style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <p className="text-[11px] text-white/50 leading-relaxed">
          "...worked closely with engineering to prioritize the Q3 roadmap—"
        </p>
      </div>
    </div>
  );
}
