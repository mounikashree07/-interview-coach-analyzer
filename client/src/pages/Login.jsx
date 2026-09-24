import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import EarthGlobe from '../components/EarthGlobe.jsx';
import { matchCountryCode } from '../data/countryCodes.js';

const providers = ['Google', 'Outlook', 'Yahoo'];
const STEP = { DETAILS: 'details', OTP: 'otp', DONE: 'done' };

const providerMeta = {
  google: { label: 'Google', accent: '#4285F4', bg: 'linear-gradient(135deg, rgba(66,133,244,0.18), rgba(15,23,42,0.14))' },
  outlook: { label: 'Outlook', accent: '#0078d4', bg: 'linear-gradient(135deg, rgba(0,120,212,0.18), rgba(15,23,42,0.14))' },
  yahoo: { label: 'Yahoo', accent: '#6001d2', bg: 'linear-gradient(135deg, rgba(96,1,210,0.18), rgba(15,23,42,0.14))' },
};

export function ProviderAuthPage() {
  const { provider = 'google' } = useParams();
  const navigate = useNavigate();
  const meta = providerMeta[provider] || providerMeta.google;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[rgba(8,11,18,0.38)] p-7 shadow-[0_20px_60px_rgba(0,0,0,0.2)] backdrop-blur-md">
        <div className="mb-8 flex items-center justify-between">
          <Link to="/login" className="font-ui text-[11px] tracking-[0.22em] text-taupe uppercase">Back</Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-taupe">{meta.label}</span>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-lg font-bold" style={{ background: meta.bg, color: meta.accent }}>
            {meta.label.slice(0, 1)}
          </div>
          <h1 className="font-ui text-3xl text-porcelain">Sign in</h1>
          <p className="mt-2 font-ui text-sm text-taupe">Continue to {meta.label}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block font-ui text-[11px] uppercase tracking-[0.15em] text-taupe">Email or phone</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={meta.label === 'Google' ? 'you@example.com' : 'name@email.com'}
              className="w-full rounded-md border border-white/10 bg-white/90 px-3 py-3 font-ui text-sm text-obsidian outline-none transition focus:border-champagne"
            />
          </div>

          <div>
            <label className="mb-2 block font-ui text-[11px] uppercase tracking-[0.15em] text-taupe">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-md border border-white/10 bg-white/90 px-3 py-3 font-ui text-sm text-obsidian outline-none transition focus:border-champagne"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-taupe">
            <button type="button" className="font-ui hover:text-porcelain">Forgot password?</button>
            <button type="button" className="font-ui hover:text-porcelain">Create account</button>
          </div>

          <button type="submit" className="w-full rounded-sm bg-champagne px-4 py-3 font-ui text-[13px] tracking-wide text-obsidian hover:brightness-110 transition-all duration-300">
            Continue to {meta.label}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Login() {
  const [phone, setPhone] = useState('+91 ');
  const [mode, setMode] = useState('phone');
  const [step, setStep] = useState(STEP.DETAILS);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  const matched = useMemo(() => matchCountryCode(phone), [phone]);

  const handleContinue = (e) => {
    e.preventDefault();
    setStep(STEP.OTP);
  };

  const handleOtpChange = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) otpRefs.current[i + 1]?.focus();
  };

  const handleOtpKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setStep(STEP.DONE);
    setTimeout(() => navigate('/dashboard'), 1400);
  };

  return (
    <div className="relative min-h-screen text-porcelain grid lg:grid-cols-[1.05fr_1.25fr] bg-transparent">
      <div className="flex items-center justify-center px-8 py-20">
        <div className="w-full max-w-sm rounded-sm border border-white/10 bg-[rgba(8,11,18,0.18)] p-6 shadow-[0_10px_35px_rgba(0,0,0,0.18)] backdrop-blur-sm">
          <Link to="/" className="font-ui text-[11px] tracking-[0.2em] text-taupe uppercase block mb-16">
            Interview Analyzer
          </Link>

          {step === STEP.DETAILS && (
            <>
              <h1 className="font-editorial text-5xl text-porcelain mb-3">Welcome back.</h1>
              <p className="font-ui text-taupe text-sm mb-10">Continue your preparation.</p>

              <div className="space-y-2.5 mb-8">
                {providers.map((p) => {
                 const slug = p.toLowerCase();
                 return (
                   <button
                     key={p}
                     type="button"
                     onClick={() => navigate(`/auth/${slug}`)}
                     className="w-full flex items-center justify-center gap-2 font-ui text-[13px] text-porcelain border border-qborder rounded-sm py-3 hover:border-champagne/40 hover:bg-white/[0.02] transition-all duration-300"
                   >
                     Continue with {p}
                   </button>
                 );
                })}
              </div>

              <div className="flex items-center gap-4 mb-8">
                <div className="h-px bg-qborder flex-1" />
                <span className="font-ui text-[11px] text-taupe/50 uppercase tracking-wide">or</span>
                <div className="h-px bg-qborder flex-1" />
              </div>

              <div className="flex gap-6 mb-6">
                {['phone', 'email'].map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`font-ui text-[12px] tracking-wide uppercase pb-1 border-b transition-colors duration-300 ${mode === m ? 'text-champagne border-champagne' : 'text-taupe border-transparent hover:text-porcelain'}`}>
                    {m === 'phone' ? 'Phone' : 'Email'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleContinue}>
                {mode === 'phone' ? (
                  <>
                    <label className="block font-ui text-[11px] tracking-wide text-taupe uppercase mb-3">Phone number</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210"
                      className="w-full bg-transparent border-b border-qborder pb-3 text-[15px] font-ui tracking-wide text-porcelain placeholder-taupe/30 focus:outline-none focus:border-champagne transition-colors duration-300" />
                    <div className="mt-3 h-4">
                      {matched && <p className="font-ui text-[11px] text-champagne tracking-wide">{matched.name}</p>}
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block font-ui text-[11px] tracking-wide text-taupe uppercase mb-3">Email address</label>
                    <input type="email" required placeholder="you@example.com"
                      className="w-full bg-transparent border-b border-qborder pb-3 text-[15px] font-ui tracking-wide text-porcelain placeholder-taupe/30 focus:outline-none focus:border-champagne transition-colors duration-300" />
                    <div className="mt-3 h-4" />
                  </>
                )}
                <button type="submit" className="w-full mt-6 font-ui text-[13px] tracking-wide bg-champagne text-obsidian py-3.5 rounded-sm hover:brightness-110 transition-all duration-300">
                  Continue →
                </button>
              </form>

              <p className="font-ui text-[11px] text-taupe/50 mt-8 leading-relaxed">
                Preview interface — no authentication provider is connected yet.
              </p>
            </>
          )}

          {step === STEP.OTP && (
            <>
              <button onClick={() => setStep(STEP.DETAILS)} className="font-ui text-[11px] text-taupe hover:text-porcelain mb-10 transition-colors duration-300">
                ← Back
              </button>
              <h1 className="font-editorial text-4xl text-porcelain mb-3">Enter the code.</h1>
              <p className="font-ui text-taupe text-sm mb-10">
                {mode === 'phone' ? `Sent to ${phone}` : 'Sent to your email'}
              </p>

              <form onSubmit={handleVerify}>
                <div className="flex gap-3 mb-10">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-13 text-center bg-white/90 border border-qborder rounded-md py-3 text-lg font-ui text-obsidian focus:outline-none focus:border-champagne transition-colors duration-300"
                    />
                  ))}
                </div>
                <button type="submit" className="w-full font-ui text-[13px] tracking-wide bg-champagne text-obsidian py-3.5 rounded-sm hover:brightness-110 transition-all duration-300">
                  Verify →
                </button>
              </form>
              <p className="font-ui text-[11px] text-taupe/50 mt-8">
                Preview interface — any code will work.
              </p>
            </>
          )}

          {step === STEP.DONE && (
            <div>
              <p className="font-ui text-[11px] tracking-wide text-champagne uppercase mb-4">Verified</p>
              <h1 className="font-editorial text-4xl text-porcelain">You're in.</h1>
              <p className="font-ui text-taupe text-sm mt-3">Taking you to your dashboard…</p>
            </div>
          )}
        </div>
      </div>

      <div className="relative hidden lg:flex items-center justify-center overflow-hidden border-l border-white/10 bg-[rgba(8,11,18,0.12)] backdrop-blur-[1px]">
        <EarthGlobe
          highlight={step === STEP.DETAILS && matched ? { lat: matched.lat, lng: matched.lng } : null}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
