import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  id,
  ...props
}) => {
  // React.useId()로 인스턴스마다 고유 id 보장 — 동일 label 중복 시 htmlFor/id 연결 파괴 방지
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  return (
    <div className="w-full mb-4">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-4 py-3.5 bg-white/80 backdrop-blur-sm border ${
          error ? 'border-red-400 focus:border-red-400' : 'border-slate-200/80 focus:border-blue-400'
        } focus:outline-none transition-all duration-200 text-slate-900 placeholder:text-slate-300/80 text-sm rounded-2xl ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-400">{helperText}</p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};
