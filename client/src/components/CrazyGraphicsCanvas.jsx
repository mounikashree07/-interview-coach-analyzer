import { useEffect, useRef } from 'react';

export default function CrazyGraphicsCanvas({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;
    let animationId = 0;
    let pointer = { x: 0.5, y: 0.5 };
    let ripples = [];

    const palette = ['#ff5f6d', '#ffd166', '#06d6a0', '#4cc9f0', '#a78bfa', '#ff4ecd', '#ff8a5b'];

    const blobs = Array.from({ length: 9 }, (_, i) => ({
      radius: 150 + Math.random() * 250,
      speed: 0.25 + Math.random() * 0.6,
      offset: Math.random() * Math.PI * 2,
      hue: palette[i % palette.length],
      xBias: Math.random() * 0.8 + 0.1,
      yBias: Math.random() * 0.8 + 0.1,
    }));

    const particles = Array.from({ length: 220 }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.008,
      vy: (Math.random() - 0.5) * 0.008,
      r: Math.random() * 2.6 + 0.8,
      hue: palette[Math.floor(Math.random() * palette.length)],
      alpha: Math.random() * 0.8 + 0.2,
    }));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = (event.clientX - rect.left) / rect.width;
      pointer.y = (event.clientY - rect.top) / rect.height;
      if (Math.random() > 0.72) {
        ripples.push({
          x: pointer.x * width,
          y: pointer.y * height,
          radius: 20,
          life: 1,
          hue: palette[Math.floor(Math.random() * palette.length)],
        });
      }
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onMove);

    let time = 0;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        40,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.8
      );
      bg.addColorStop(0, 'rgba(23, 12, 35, 0.96)');
      bg.addColorStop(0.28, 'rgba(13, 18, 32, 0.88)');
      bg.addColorStop(0.6, 'rgba(8, 12, 25, 0.86)');
      bg.addColorStop(1, 'rgba(2, 6, 16, 1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      for (let y = 0; y < height; y += 4) {
        ctx.fillStyle = y % 8 === 0 ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.01)';
        ctx.fillRect(0, y, width, 1);
      }

      const px = (pointer.x - 0.5) * width * 0.38;
      const py = (pointer.y - 0.5) * height * 0.38;

      blobs.forEach((blob, index) => {
        const cx = width * blob.xBias + Math.sin(time * blob.speed + index) * (width * 0.15);
        const cy = height * blob.yBias + Math.cos(time * blob.speed * 1.2 + index * 2) * (height * 0.14);
        const r = blob.radius + Math.sin(time * 2.3 + index * 1.7) * 60;

        const grad = ctx.createRadialGradient(cx + px, cy + py, 0, cx + px, cy + py, r);
        grad.addColorStop(0, `${blob.hue}ee`);
        grad.addColorStop(0.26, `${blob.hue}99`);
        grad.addColorStop(0.45, `${blob.hue}55`);
        grad.addColorStop(0.7, `${blob.hue}22`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx + px, cy + py, r, 0, Math.PI * 2);
        ctx.fill();
      });

      ripples = ripples.filter((ripple) => ripple.life > 0);
      ripples.forEach((ripple) => {
        const alpha = ripple.life * 0.35;
        ctx.beginPath();
        ctx.strokeStyle = ripple.hue + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2.5;
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();

        const glow = ctx.createRadialGradient(ripple.x, ripple.y, 0, ripple.x, ripple.y, ripple.radius * 2.6);
        glow.addColorStop(0, ripple.hue + '66');
        glow.addColorStop(0.35, ripple.hue + '22');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius * 2.6, 0, Math.PI * 2);
        ctx.fill();

        ripple.radius += 2.6;
        ripple.life -= 0.012;
      });

      particles.forEach((particle, i) => {
        const driftX = Math.sin(time * 0.8 + particle.x * 28 + i) * 0.38;
        const driftY = Math.cos(time * 0.95 + particle.y * 30 + i) * 0.38;

        particle.x += particle.vx + driftX * 0.0025;
        particle.y += particle.vy + driftY * 0.0025;

        if (particle.x < 0 || particle.x > 1) particle.vx *= -1;
        if (particle.y < 0 || particle.y > 1) particle.vy *= -1;

        const px2 = particle.x * width + (pointer.x - 0.5) * width * 0.32;
        const py2 = particle.y * height + (pointer.y - 0.5) * height * 0.32;

        ctx.beginPath();
        ctx.fillStyle = particle.hue + 'cc';
        ctx.globalAlpha = particle.alpha;
        ctx.arc(px2, py2, particle.r, 0, Math.PI * 2);
        ctx.fill();

        if (i % 6 === 0) {
          const next = particles[(i + 1) % particles.length];
          const nx = next.x * width + (pointer.x - 0.5) * width * 0.32;
          const ny = next.y * height + (pointer.y - 0.5) * height * 0.32;
          ctx.beginPath();
          ctx.strokeStyle = particle.hue + '66';
          ctx.lineWidth = 0.85;
          ctx.moveTo(px2, py2);
          ctx.lineTo(nx, ny);
          ctx.stroke();
        }
      });

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return <canvas ref={canvasRef} className={`block w-full h-full ${className}`} aria-hidden="true" />;
}
