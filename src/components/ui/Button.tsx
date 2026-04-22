import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
    'inline-flex items-center justify-center font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/50 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-2xl active:scale-[0.98] transition-transform';

  const variants = {
    primary:
      'relative overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:brightness-90 shadow-md shadow-blue-300/40 border-0',
    secondary:
      'bg-white text-slate-700 hover:bg-slate-50 border-2 border-slate-200 hover:border-slate-300 shadow-sm',
    outline:
      'bg-transparent text-slate-700 border-2 border-slate-300 hover:border-blue-400 hover:text-blue-600',
    ghost:
      'bg-transparent text-slate-500 hover:bg-slate-100/80 hover:text-slate-900',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-11 px-5 text-sm',
    lg: 'h-13 px-8 text-base',
  };

  const widthStyles = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyles} ${className}`}
      {...props}
    >
      {variant === 'primary' && (
        <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
          <span className="absolute top-0 h-full w-[55%] bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer" />
        </span>
      )}
      {children}
    </button>
  );
};
