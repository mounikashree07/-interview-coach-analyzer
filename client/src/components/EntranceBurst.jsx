import { useEffect, useRef, useState } from 'react';

// Fires a one-time particle burst from the center of the screen on first load,
// like a confetti/celebration effect, then fades out and removes itself.
export default function EntranceBurst() {
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Only play once per browser session, not on every route change
    if (sessionStorage.getItem('burst-played')) {
      setDone(true);
      return;
    }
    sessionStorage.setItem('burst-played', 'true');

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const colors = ['#C7A878', '#A77F7D', '#898393', '#F3EFE8'];
    const particleCount = 40;
    const particles = Array.from({ length: particleCount }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 4;
      return {
        x: width / 2,
        y: height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: 0.012 + Math.random() * 0.015,
        shape: Math.random() > 0.5 ? 'circle' : 'rect',
        rotation: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.2,
      };
    });

    let animationId;
    const gravity = 0.06;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      let alive = false;

      particles.forEach((p) => {
        if (p.life <= 0) return;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.vx *= 0.985;
        p.rotation += p.rotSpeed;
        p.life -= p.decay;

        ctx.save();
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 1.6);
        }
        ctx.restore();
      });

      if (alive) {
        animationId = requestAnimationFrame(draw);
      } else {
        setDone(true);
      }
    };
    draw();

    return () => cancelAnimationFrame(animationId);
  }, []);

  if (done) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[999] pointer-events-none"
    />
  );
}
