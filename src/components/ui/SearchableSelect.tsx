import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  id?: string;
}

interface DropdownRect {
  top: number;
  left: number;
  width: number;
  openUpward: boolean;
}

const DROPDOWN_MAX_HEIGHT = 300;

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  options,
  value,
  onChange,
  error,
  placeholder = '선택해주세요',
  searchPlaceholder = '검색...',
  className = '',
  id,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [rect, setRect] = useState<DropdownRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

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
    if (searchInputRef.current) searchInputRef.current.focus();

    const handleClickOutside = (e: MouseEvent): void => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('[data-searchable-select-dropdown]')
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

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

  const handleSelect = (optionValue: string): void => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (): void => {
    onChange('');
  };

  const dropdown = isOpen && rect
    ? createPortal(
        <div
          data-searchable-select-dropdown
          style={{
            position: 'fixed',
            top: rect.openUpward ? undefined : rect.top,
            bottom: rect.openUpward ? window.innerHeight - rect.top : undefined,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
            maxHeight: DROPDOWN_MAX_HEIGHT,
          }}
          className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-200 flex flex-col"
        >
          <div className="shrink-0 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 p-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm shadow-sm"
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-400 text-sm" role="status" aria-live="polite">
                검색 결과가 없습니다
              </div>
            ) : (
              filteredOptions.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-150 ${
                      index !== filteredOptions.length - 1 ? 'border-b border-slate-100' : ''
                    } ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold'
                        : 'text-slate-700 hover:bg-blue-50 hover:text-blue-600'
                    } ${index === filteredOptions.length - 1 ? 'rounded-b-xl' : ''}`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check size={18} className="text-blue-600 animate-in zoom-in duration-200" />
                    )}
                  </button>
                );
              })
            )}
          </div>
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
          <span className="flex-1 truncate">{selectedOption?.label ?? placeholder}</span>
          <div className="flex items-center gap-2">
            {value && (
              <X
                size={16}
                className="text-slate-400 hover:text-red-500 transition-colors duration-150"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
              />
            )}
            <ChevronDown
              className={`transition-all duration-300 ${
                isOpen ? 'rotate-180 text-blue-500' : 'text-slate-400'
              }`}
              size={20}
            />
          </div>
        </button>
      </div>
      {dropdown}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
