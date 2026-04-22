import React from 'react';
import { Card } from '@/components/ui/Card';
import { Heart, UserPlus } from 'lucide-react';
import type { FeedItem } from '@/types';

const formatTime = (createdAt: string): string => {
  const diff = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  return `${Math.floor(hours / 24)}일 전`;
};

export const FeedCard: React.FC<{ item: FeedItem }> = React.memo(({ item }) => {
  const isCandidate = item.eventType === 'CANDIDATE_REGISTERED';

  return (
    <Card className="!py-3.5 !px-4 flex items-center gap-4 border-none !shadow-[0_1px_12px_rgba(0,0,0,0.04)] hover:!shadow-[0_4px_20px_rgba(0,0,0,0.08)] group">
      <div
        className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 ${
          isCandidate
            ? 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white shadow-md shadow-blue-200/40'
            : 'bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-md shadow-pink-200/40'
        }`}
      >
        {isCandidate ? (
          <UserPlus size={18} strokeWidth={2.5} />
        ) : (
          <Heart size={18} fill="currentColor" strokeWidth={0} />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-0.5">
          <span className="font-bold text-slate-900 text-sm">{item.nickname}</span>
          <span className="text-[11px] text-slate-400 shrink-0">{formatTime(item.createdAt)}</span>
        </div>
        <p className="text-xs text-slate-500 leading-snug">
          {isCandidate ? (
            <>
              매칭 후보로 <span className="text-blue-600 font-semibold">등록</span>되었어요
            </>
          ) : (
            <>
              <span className="font-display text-[16px] text-rose-500 leading-none">{item.requestCount}</span>명의 인연을 기다리고 있어요
            </>
          )}
        </p>
      </div>
    </Card>
  );
});
