import { useEffect, useRef } from 'react';

// A slow-drifting starfield with subtle mouse parallax across depth layers.
// Muted champagne/rose/lilac stars — atmospheric, not a bright particle show.
export default function StarfieldCanvas({ className = '' }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width, height, animationId;

    const resize = () => {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const colors = ['#C7A878', '#A77F7D', '#898393', '#F3EFE8'];
    const starCount = 140;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: 0.3 + Math.random() * 1, // depth: smaller = farther, moves less
      size: 0.6 + Math.random() * 1.6,
      color: colors[Math.floor(Math.random() * colors.length)],
      twinklePhase: Math.random() * Math.PI * 2,
      driftSpeed: 0.02 + Math.random() * 0.05,
    }));

    const handleMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left - width / 2) / width,
        y: (e.clientY - rect.top - height / 2) / height,
      };
    };
    window.addEventListener('mousemove', handleMove);

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      t += 1;

      stars.forEach((s) => {
        s.y += s.driftSpeed * s.z; // slow downward drift, farther stars slower
        if (s.y > height) { s.y = -5; s.x = Math.random() * width; }

        const parallaxX = mouseRef.current.x * 20 * s.z;
        const parallaxY = mouseRef.current.y * 20 * s.z;

        const twinkle = 0.5 + Math.sin(t * 0.02 + s.twinklePhase) * 0.5;
        const alpha = (0.2 + twinkle * 0.5) * s.z;

        ctx.beginPath();
        ctx.arc(s.x + parallaxX, s.y + parallaxY, s.size * s.z, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} />;
}
