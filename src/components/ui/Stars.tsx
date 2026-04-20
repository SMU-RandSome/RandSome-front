import React from 'react';

const STAR_CONFIG = [
  { top: '14%', left: '20%', s: 3, delay: '0s' },
  { top: '23%', left: '76%', s: 5, delay: '0.8s' },
  { top: '40%', left: '90%', s: 3, delay: '1.6s' },
  { top: '58%', left: '10%', s: 4, delay: '2.4s' },
  { top: '9%', left: '52%', s: 2, delay: '1.2s' },
];

/** 다크 배경용 반짝이는 별 장식 (디자인 v4) */
export const Stars: React.FC = () => (
  <>
    {STAR_CONFIG.map((st, i) => (
      <div
        key={i}
        className="absolute rounded-full bg-white pointer-events-none"
        style={{
          top: st.top,
          left: st.left,
          width: st.s,
          height: st.s,
          animation: `sparkle 2.8s ${st.delay} ease-in-out infinite`,
          boxShadow: '0 0 5px 2px rgba(255,255,255,.65)',
        }}
      />
    ))}
  </>
);
