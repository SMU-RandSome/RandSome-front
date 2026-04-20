import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  className?: string;
  id?: string;
}

interface DropdownRect {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
}

const DROPDOWN_MAX_HEIGHT = 240;

export const CustomSelect: React.FC<CustomSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = '선택해주세요',
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DropdownRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const selectedOption = options.find((opt) => opt.value === value);

  const calcRect = (): void => {
    if (!triggerRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    const openUpward = spaceBelow < DROPDOWN_MAX_HEIGHT + 8 && r.top > spaceBelow;
    setRect({
      top: openUpward ? r.top - 8 : r.bottom + 8,
      left: r.left,
      width: r.width,
      openUpward,
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    calcRect();

    const close = (): void => setIsOpen(false);
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const handleClickOutside = (e: MouseEvent): void => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node) &&
      !(e.target as Element).closest('[data-custom-select-dropdown]')
    ) {
      setIsOpen(false);
    }
  };

  const handleSelect = (optionValue: string): void => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const dropdown = isOpen && rect
    ? createPortal(
        <div
          data-custom-select-dropdown
          style={{
            position: 'fixed',
            top: rect.openUpward ? undefined : rect.top,
            bottom: rect.openUpward ? window.innerHeight - rect.top : undefined,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
          }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in duration-200"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option.value)}
                className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-150 ${
                  index !== options.length - 1 ? 'border-b border-slate-100' : ''
                } ${
                  isSelected
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold'
                    : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                } ${index === 0 ? 'rounded-t-xl' : ''} ${
                  index === options.length - 1 ? 'rounded-b-xl' : ''
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <span>{option.label}</span>
                {isSelected && (
                  <Check size={18} className="text-blue-600 animate-in zoom-in duration-200" />
                )}
              </button>
            );
          })}
        </div>,
        document.body,
      )
    : null;

  return (
    <div className={`w-full mb-4 ${className}`} ref={containerRef}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={selectId}
          onClick={() => setIsOpen((v) => !v)}
          className={`w-full px-4 py-3 rounded-xl border bg-white text-left flex items-center justify-between shadow-sm hover:shadow-md ${
            error
              ? 'border-red-500 focus:ring-red-200'
              : 'border-slate-200 focus:ring-blue-200 hover:border-blue-300'
          } focus:border-blue-500 focus:ring-4 focus:outline-none transition-all duration-200 ${
            value ? 'text-slate-900 font-medium' : 'text-slate-400'
          }`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span>{selectedOption?.label ?? placeholder}</span>
          <ChevronDown
            className={`transition-all duration-300 ${
              isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'
            }`}
            size={20}
          />
        </button>
      </div>
      {dropdown}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
