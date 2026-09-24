import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, ChevronDown } from 'lucide-react';

const dropdowns = {
  Solutions: [
    { label: 'Resume & JD Match', to: '/resume-analyzer', desc: 'See where you fit, and where you don\'t.' },
    { label: 'Mock Interviews', to: '/mock-interview', desc: 'Real questions, considered answers.' },
    { label: 'Voice & Delivery', to: '/video-analysis', desc: 'Filler words, pacing, tone — from your own voice.' },
  ],
  Resources: [
    { label: 'Help Center', to: '/help', desc: 'Questions, answered plainly.' },
    { label: 'Dashboard', to: '/dashboard', desc: 'Your sessions, over time.' },
  ],
  Company: [
    { label: 'About', to: '/about', desc: 'What this project is, and why.' },
    { label: 'Contact', to: '/contact', desc: 'Reach out directly.' },
  ],
};

export default function MegaNavbar() {
  const [openMenu, setOpenMenu] = useState(null);

  return (
    <header className="sticky top-0 z-50 bg-obsidian/90 backdrop-blur-md border-b border-qborder">
      <div className="max-w-6xl mx-auto px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link to="/" className="font-ui text-[13px] tracking-[0.15em] text-porcelain leading-tight shrink-0">
            INTERVIEW
            <br />
            ANALYZER
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {Object.entries(dropdowns).map(([label, items]) => (
              <div
                key={label}
                className="relative"
                onMouseEnter={() => setOpenMenu(label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <button className="flex items-center gap-1.5 px-3.5 py-2 font-ui text-[13px] text-taupe hover:text-porcelain transition-colors duration-300">
                  {label}
                  <ChevronDown size={12} className={`transition-transform duration-300 ${openMenu === label ? 'rotate-180' : ''}`} />
                </button>
                {openMenu === label && (
                  <div className="absolute top-full left-0 pt-2 w-72">
                    <div className="bg-graphite border border-qborder rounded-md p-2">
                      {items.map((item) => (
                        <Link key={item.to} to={item.to} className="block px-3 py-2.5 rounded hover:bg-white/[0.03] transition-colors duration-300">
                          <p className="font-ui text-[13px] text-porcelain">{item.label}</p>
                          <p className="font-ui text-[11px] text-taupe mt-0.5">{item.desc}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button className="hidden sm:flex items-center justify-center w-8 h-8 text-taupe hover:text-porcelain transition-colors duration-300">
            <Search size={15} />
          </button>
          <Link to="/login" className="hidden sm:block font-ui text-[13px] text-taupe hover:text-porcelain transition-colors duration-300">
            Log in
          </Link>
          <Link to="/resume-analyzer" className="font-ui text-[13px] tracking-wide bg-champagne text-obsidian px-4 py-2 rounded-sm hover:brightness-110 transition-all duration-300">
            Begin
          </Link>
        </div>
      </div>
    </header>
  );
}
