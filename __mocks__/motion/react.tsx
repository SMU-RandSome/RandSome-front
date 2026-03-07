import React from 'react';

type AnyProps = Record<string, unknown> & { children?: React.ReactNode };

// motion-specific props to strip out so they don't pollute DOM elements
const MOTION_PROPS = new Set([
  'initial', 'animate', 'exit', 'transition', 'variants', 'layout',
  'whileTap', 'whileHover', 'whileFocus', 'whileDrag', 'whileInView',
  'onAnimationStart', 'onAnimationComplete', 'onUpdate',
  'dragConstraints', 'dragElastic', 'drag',
]);

const createMotionComponent = (tag: string) =>
  React.forwardRef<HTMLElement, AnyProps>(({ children, ...props }, ref) => {
    const filtered: Record<string, unknown> = {};
    for (const key of Object.keys(props)) {
      if (!MOTION_PROPS.has(key)) filtered[key] = props[key];
    }
    return React.createElement(tag, { ...filtered, ref }, children);
  });

export const motion = new Proxy({} as Record<string, ReturnType<typeof createMotionComponent>>, {
  get: (_target, tag: string) => createMotionComponent(tag),
});

export const AnimatePresence = ({ children }: { children?: React.ReactNode }) => (
  <>{children}</>
);

export const useAnimation = () => ({
  start: () => Promise.resolve(),
  stop: () => {},
  set: () => {},
});

export const useMotionValue = (initial: number) => ({ get: () => initial, set: () => {} });
