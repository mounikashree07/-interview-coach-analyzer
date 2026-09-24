import { useRef, useState } from 'react';

// A 3D tilt-on-hover wrapper — the card rotates toward the cursor,
// giving a "physical, glossy panel" feel without any 3D library.
export default function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setStyle({
      transform: `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`,
    });
  };

  const handleLeave = () => {
    setStyle({ transform: 'perspective(900px) rotateY(0deg) rotateX(0deg) scale(1)' });
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ ...style, transition: 'transform 0.2s ease-out' }}
      className={className}
    >
      {children}
    </div>
  );
}
