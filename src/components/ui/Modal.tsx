import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black z-[60]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[2rem] p-6 max-w-[430px] mx-auto max-h-[80vh] overflow-y-auto"
          >
            <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6" />

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-slate-400 hover:text-slate-600"
                aria-label="닫기"
              >
                <X size={24} />
              </button>
            </div>

            <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
