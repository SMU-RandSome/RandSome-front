import React from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}
    >
      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4">
        {icon ?? '📭'}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
};
