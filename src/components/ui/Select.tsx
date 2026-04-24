import React from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  placeholder = '선택해주세요',
  className = '',
  id,
  ...props
}) => {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full mb-4 relative">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={`w-full px-4 py-3 rounded-xl border appearance-none bg-white ${
            error
              ? 'border-red-500 focus:border-red-500'
              : 'border-slate-200 focus:border-blue-500'
          } focus:outline-none transition-all text-slate-900 ${className}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          size={20}
        />
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
