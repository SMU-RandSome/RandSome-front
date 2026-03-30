import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return <div className={`animate-shimmer-gradient rounded-xl ${className}`} />;
};

export const FeedSkeleton: React.FC = () => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/60 shadow-[0_1px_12px_rgba(0,0,0,0.03)] p-4 flex items-center gap-4">
      <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
      <div className="flex-1 space-y-2.5">
        <div className="flex justify-between">
          <Skeleton className="w-16 h-4 rounded-lg" />
          <Skeleton className="w-10 h-3 rounded-lg" />
        </div>
        <Skeleton className="w-full h-4 rounded-lg" />
      </div>
    </div>
  );
};
