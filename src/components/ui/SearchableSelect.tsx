import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  const searchInputRef = useRef<HTMLInputElement>(null);
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.label.toLowerCase().includes(query));
  }, [options, searchQuery]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleSelect = (optionValue: string): void => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClose = (): void => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (): void => {
    onChange('');
  };

  const overlay = createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[80]"
            onClick={handleClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-[80] bg-white rounded-t-3xl flex flex-col"
            style={{ maxHeight: '70vh' }}
          >
            <div className="pt-3 pb-2 flex justify-center shrink-0">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            <div className="px-5 pb-3 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-bold text-slate-900">
                {label || placeholder}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 pb-3 shrink-0">
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all bg-slate-50"
                  style={{ fontSize: 16 }}
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-2" style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}>
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-8 text-center text-slate-400 text-sm" role="status" aria-live="polite">
                  검색 결과가 없습니다
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = option.value === value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`w-full px-4 py-3.5 text-left flex items-center justify-between rounded-xl transition-colors duration-150 ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 font-semibold'
                          : 'text-slate-700 active:bg-slate-100'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span>{option.label}</span>
                      {isSelected && <Check size={18} className="text-blue-600" />}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );

  return (
    <div className={`w-full mb-4 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          id={selectId}
          onClick={() => setIsOpen(true)}
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
      {overlay}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
};
