import React from 'react';

interface OrbsProps {
  dark?: boolean;
}

/** 배경 장식 — 떠다니는 그라디언트 원 (디자인 v4) */
export const Orbs: React.FC<OrbsProps> = React.memo(({ dark = false }) => {
  if (dark) {
    return (
      <>
        <div
          className="absolute animate-float-a pointer-events-none"
          style={{
            top: -80,
            right: -80,
            width: 300,
            height: 300,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,.4), transparent 70%)',
            filter: 'blur(44px)',
          }}
        />
        <div
          className="absolute animate-float-b pointer-events-none"
          style={{
            bottom: 160,
            left: -90,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(236,72,153,.28), transparent 70%)',
            filter: 'blur(44px)',
          }}
        />
      </>
    );
  }

  return (
    <>
      <div
        className="absolute animate-float-a pointer-events-none"
        style={{
          top: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,.16), transparent 70%)',
          filter: 'blur(44px)',
        }}
      />
      <div
        className="absolute animate-float-b pointer-events-none"
        style={{
          bottom: 130,
          left: -70,
          width: 210,
          height: 210,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,.13), transparent 70%)',
          filter: 'blur(44px)',
        }}
      />
    </>
  );
});
