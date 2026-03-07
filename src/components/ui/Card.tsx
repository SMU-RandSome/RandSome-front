import React from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-[#141414] shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] p-5 ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};
