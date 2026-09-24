import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-qborder">
      <div className="max-w-5xl mx-auto px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-ui text-[11px] tracking-wide text-taupe/60">
          Interview Analyzer — built as an academic project, CMR University.
        </p>
        <div className="flex gap-8">
          {[['Help', '/help'], ['About', '/about'], ['Contact', '/contact']].map(([label, to]) => (
            <Link key={to} to={to} className="font-ui text-[11px] text-taupe hover:text-champagne transition-colors">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
