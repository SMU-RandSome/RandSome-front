import React from 'react';
import { Heart } from 'lucide-react';

interface LogoProps {
  hero?: boolean;
}

/** 액체 블롭 morphing 로고 + 하트 아이콘 (디자인 v4) */
export const Logo: React.FC<LogoProps> = ({ hero = false }) => {
  const sz = hero ? 76 : 40;
  const icz = hero ? 36 : 20;

  const sparkles = hero
    ? [
        { top: -8, left: 14, delay: '0s', s: 5 },
        { top: 8, right: -9, delay: '0.7s', s: 4 },
        { bottom: -6, left: 30, delay: '1.4s', s: 6 },
        { top: -5, right: 20, delay: '2.1s', s: 3 },
      ]
    : [];

  return (
    <div
      className="flex items-center justify-center shrink-0 animate-morph"
      style={{
        width: sz,
        height: sz,
        background: 'linear-gradient(135deg, #2563eb, #6366f1)',
        animation: 'morph 4s ease-in-out infinite, glow-blue 3s ease-in-out infinite',
        position: 'relative',
      }}
    >
      {sparkles.map((st, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-sparkle"
          style={{
            top: st.top,
            bottom: st.bottom,
            left: st.left,
            right: st.right,
            width: st.s,
            height: st.s,
            animationDelay: st.delay,
            animationDuration: '2.4s',
            boxShadow: '0 0 5px 2px rgba(255,255,255,.8)',
          }}
        />
      ))}
      <Heart size={icz} className="text-white" fill="currentColor" />
    </div>
  );
};
