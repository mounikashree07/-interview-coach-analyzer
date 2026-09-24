import { useEffect, useRef } from 'react';

// A living, audio-reactive-looking waveform field rendered on canvas.
// Purely decorative/simulated (no real mic input on the landing page) —
// bars pulse with layered sine waves + noise so it never looks static or looped.
export default function WaveformCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let width, height;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const barCount = 64;
    const barWidth = 3;
    const gap = 4;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const totalWidth = barCount * (barWidth + gap);
      const startX = (width - totalWidth) / 2;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * (barWidth + gap);
        // layered sine waves for organic, non-repeating motion
        const wave1 = Math.sin(t * 0.01 + i * 0.3) * 0.5;
        const wave2 = Math.sin(t * 0.018 + i * 0.15) * 0.3;
        const wave3 = Math.sin(t * 0.006 + i * 0.5) * 0.2;
        const amplitude = Math.abs(wave1 + wave2 + wave3);
        const barHeight = 8 + amplitude * height * 0.7;

        const y = (height - barHeight) / 2;
        const opacity = 0.25 + amplitude * 0.75;

        // amber-to-teal gradient across the field
        const hueMix = i / barCount;
        const r = Math.round(199 * (1 - hueMix) + 137 * hueMix);
        const g = Math.round(168 * (1 - hueMix) + 105 * hueMix);
        const b = Math.round(120 * (1 - hueMix) + 103 * hueMix);

        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      t += 1;
      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
