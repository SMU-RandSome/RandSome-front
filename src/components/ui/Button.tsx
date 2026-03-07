import React from 'react';
import { motion } from 'motion/react';

// motion.button은 onDragStart, onAnimationStart 등의 타입이 HTML 이벤트와 충돌하므로 제외
type SafeButtonHTMLProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  | 'onDragStart'
  | 'onDrag'
  | 'onDragEnd'
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
>;

interface ButtonProps extends SafeButtonHTMLProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all focus:outline-none disabled:opacity-50 disabled:pointer-events-none rounded-xl active:translate-y-0.5';

  const variants = {
    primary:
      'bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 shadow-sm',
    secondary:
      'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
    outline:
      'bg-transparent text-slate-700 border border-slate-300 hover:border-blue-400 hover:text-blue-600',
    ghost:
      'bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-13 px-8 text-base',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};
