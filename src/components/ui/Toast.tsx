import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutIds = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const ids = timeoutIds.current;
    return () => { ids.forEach((tid) => clearTimeout(tid)); };
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info'): void => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    const tid = setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      timeoutIds.current.delete(id);
    }, 3000);
    timeoutIds.current.set(id, tid);
  }, []);

  const removeToast = useCallback((id: string): void => {
    const tid = timeoutIds.current.get(id);
    if (tid !== undefined) {
      clearTimeout(tid);
      timeoutIds.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="pointer-events-auto min-w-[300px] max-w-[90%] bg-white rounded-full shadow-lg border border-slate-100 p-1 pr-2 flex items-center gap-3"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  t.type === 'success'
                    ? 'bg-green-100 text-green-600'
                    : t.type === 'error'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-blue-100 text-blue-600'
                }`}
              >
                {t.type === 'success' && <CheckCircle2 size={16} />}
                {t.type === 'error' && <XCircle size={16} />}
                {t.type === 'info' && <Info size={16} />}
              </div>
              <p className="text-sm font-medium text-slate-800 flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
                aria-label="닫기"
              >
                <X size={14} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
