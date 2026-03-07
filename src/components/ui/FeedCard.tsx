import React from 'react';
import { Card } from '@/components/ui/Card';
import { Heart, UserPlus } from 'lucide-react';
import type { FeedItem } from '@/hooks/useFeed';

export const FeedCard: React.FC<{ item: FeedItem }> = ({ item }) => (
  <Card className="py-4 px-5 flex items-start gap-4 border-none shadow-sm hover:shadow-md transition-shadow">
    <div
      className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
        item.type === 'register' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
      }`}
    >
      {item.type === 'register' ? (
        <UserPlus size={20} />
      ) : (
        <Heart size={20} fill="currentColor" />
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-1">
        <span className="font-bold text-slate-900 text-sm">{item.name}</span>
        <span className="text-xs text-slate-400">{item.time}</span>
      </div>
      <p className="text-sm text-slate-600 leading-snug">
        {item.type === 'register' ? (
          <>
            매칭 후보로 <span className="text-blue-600 font-medium">등록</span>되었습니다!
          </>
        ) : (
          <>
            사랑을 찾기 위해{' '}
            <span className="text-pink-600 font-medium">{item.count}명</span>을 요청하였습니다!
          </>
        )}
      </p>
    </div>
  </Card>
);
