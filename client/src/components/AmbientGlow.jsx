// A slow, extremely subtle atmospheric gradient — "light through smoked glass,"
// not a colorful decoration. Respects prefers-reduced-motion via CSS.
export default function AmbientGlow() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #A77F7D, transparent 70%)' }}
      />
      <div
        className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[120px]"
        style={{ background: 'radial-gradient(circle, #C7A878, transparent 70%)' }}
      />
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
