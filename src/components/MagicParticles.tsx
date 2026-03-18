'use client';

import { useMemo } from 'react';

interface Props {
  count?: number;
  color?: string;
  area?: 'full' | 'book';
}

export default function MagicParticles({ count = 12, color = 'rgba(201, 168, 76, 0.4)', area = 'full' }: Props) {
  const particles = useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${60 + Math.random() * 40}%`,
      size: 2 + Math.random() * 3,
      duration: `${2.5 + Math.random() * 3}s`,
      delay: `${Math.random() * 3}s`,
      driftX: `${-30 + Math.random() * 60}px`,
    })),
    [count]
  );

  return (
    <div className={`pointer-events-none absolute inset-0 ${area === 'full' ? '' : 'overflow-hidden'}`}>
      {particles.map(p => (
        <div
          key={p.id}
          className="particle absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            boxShadow: `0 0 ${p.size * 2}px ${color}`,
            '--duration': p.duration,
            '--delay': p.delay,
            '--drift-x': p.driftX,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
