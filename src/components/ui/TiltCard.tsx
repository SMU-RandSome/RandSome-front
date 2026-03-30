import React, { useRef } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  useMotionTemplate,
} from 'motion/react';
import { useDisplayMode } from '@/store/displayModeStore';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  gloss?: boolean;
  intensity?: number;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  gloss = true,
  intensity = 10,
}) => {
  const { isPWA } = useDisplayMode();
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rafId = useRef<number | null>(null);

  const rotateX = useTransform(mouseY, [0, 1], [intensity, -intensity]);
  const rotateY = useTransform(mouseX, [0, 1], [-intensity, intensity]);
  const springX = useSpring(rotateX, { stiffness: 200, damping: 25 });
  const springY = useSpring(rotateY, { stiffness: 200, damping: 25 });

  const glX = useTransform(mouseX, [0, 1], [20, 80]);
  const glY = useTransform(mouseY, [0, 1], [20, 80]);
  const glossBg = useMotionTemplate`radial-gradient(circle at ${glX}% ${glY}%, rgba(255,255,255,0.18) 0%, transparent 65%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (rafId.current !== null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = e.clientX;
    const clientY = e.clientY;
    rafId.current = requestAnimationFrame(() => {
      mouseX.set((clientX - rect.left) / rect.width);
      mouseY.set((clientY - rect.top) / rect.height);
      rafId.current = null;
    });
  };

  const handleMouseLeave = (): void => {
    if (rafId.current !== null) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  if (isPWA) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 900 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.03 }}
      transition={{ scale: { type: 'spring', stiffness: 300, damping: 25 } }}
      className={`relative ${className}`}
    >
      {children}
      {gloss && (
        <motion.div
          style={{ background: glossBg, borderRadius: 'inherit' }}
          className="absolute inset-0 pointer-events-none z-10"
        />
      )}
    </motion.div>
  );
};
