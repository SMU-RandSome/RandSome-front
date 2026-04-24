import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full mb-4">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-3 rounded-xl border ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-slate-200 focus:border-blue-500'
        } focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 min-h-[120px] resize-none ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
