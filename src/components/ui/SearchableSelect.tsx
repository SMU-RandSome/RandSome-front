import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) =>
      option.label.toLowerCase().includes(query)
    );
  }, [options, searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // max-h-60 + search bar

      // 아래 공간이 부족하고 위 공간이 충분하면 위로 열기
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className={`w-full mb-4 ${className}`} ref={containerRef}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={selectId}
          onClick={() => setIsOpen(!isOpen)}
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

        {isOpen && (
          <div 
            ref={dropdownRef}
            className={`absolute z-50 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-200 ${
              dropdownPosition === 'top' 
                ? 'bottom-full mb-2 slide-in-from-bottom-2' 
                : 'top-full mt-2 slide-in-from-top-2'
            }`}
          >
            <div className="sticky top-0 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200 p-3">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all text-sm shadow-sm"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div 
                  className="px-4 py-8 text-center text-slate-400 text-sm"
                  role="status"
                  aria-live="polite"
                >
                  검색 결과가 없습니다
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between transition-all duration-150 ${
                        index !== filteredOptions.length - 1 ? 'border-b border-slate-100' : ''
                      } ${
                        isSelected 
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold' 
                          : 'text-slate-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent hover:text-blue-600'
                      } ${
                        index === filteredOptions.length - 1 ? 'rounded-b-xl' : ''
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span className="transition-transform duration-150">
                        {option.label}
                      </span>
                      {isSelected && (
                        <Check 
                          size={18} 
                          className="text-blue-600 animate-in zoom-in duration-200" 
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
