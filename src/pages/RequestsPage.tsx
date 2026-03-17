import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDisplayMode } from '@/store/displayModeStore';
import { getMatchingHistory } from '@/features/matching/api';
import type { MatchingHistoryItem, MatchingApplicationStatus } from '@/types';
import { Heart, Dice5, Calendar, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'PENDING' | 'APPROVED' | 'REJECTED';

const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const [currentTab, setCurrentTab] = useState<TabType>('PENDING');
  const [items, setItems] = useState<MatchingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getMatchingHistory(currentTab as MatchingApplicationStatus)
      .then((res) => {
        if (res.data) setItems(res.data);
        else setItems([]);
      })
      .catch(() => setItems([]))
      .finally(() => setIsLoading(false));
  }, [currentTab]);

  const TABS: { id: TabType; label: string }[] = [
    { id: 'PENDING', label: '대기중' },
    { id: 'APPROVED', label: '완료' },
    { id: 'REJECTED', label: '거절' },
  ];

  const formatDate = (iso: string): string =>
    new Date(iso).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-bold text-slate-900">내 신청 내역</h1>
        </header>
      )}

      <div className={`sticky z-40 bg-white border-b border-slate-200 flex ${isPWA ? 'top-14' : 'top-0'}`}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${
              currentTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={`flex-1 overflow-y-auto p-4 ${isPWA ? 'pb-24' : 'pb-8'}`}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 h-20 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-3"
            >
              {items.length === 0 ? (
                <EmptyState
                  icon={<span>{currentTab === 'PENDING' ? '⏳' : currentTab === 'APPROVED' ? '💌' : '✅'}</span>}
                  title={
                    currentTab === 'PENDING'
                      ? '대기중인 신청이 없어요'
                      : currentTab === 'APPROVED'
                      ? '완료된 신청이 없어요'
                      : '거절된 신청이 없어요'
                  }
                  description={
                    currentTab === 'PENDING'
                      ? '새로운 매칭을 신청해보세요!'
                      : currentTab === 'APPROVED'
                      ? '설레는 인연이 곧 찾아올 거예요!'
                      : '모든 신청이 순조롭게 진행되고 있어요!'
                  }
                />
              ) : (
                items.map((item) => (
                  <MatchingHistoryCard
                    key={item.id}
                    item={item}
                    onViewResult={() =>
                      navigate('/requests/detail', { state: { applicationId: item.id } })
                    }
                    formatDate={formatDate}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

const MatchingHistoryCard: React.FC<{
  item: MatchingHistoryItem;
  onViewResult: () => void;
  formatDate: (iso: string) => string;
}> = ({ item, onViewResult, formatDate }) => {
  const isApproved = item.applicationStatus === 'APPROVED';
  const isRejected = item.applicationStatus === 'REJECTED';
  const isPending = item.applicationStatus === 'PENDING';
  const isIdeal = item.matchingTypeLabel.includes('이상형');

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={isApproved ? onViewResult : undefined}
      className={`bg-white rounded-2xl p-4 shadow-sm border relative overflow-hidden ${
        isRejected ? 'border-red-100 opacity-70' : 'border-slate-100'
      } ${isApproved ? 'cursor-pointer group' : ''}`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
            isPending
              ? isIdeal
                ? 'bg-pink-50 text-pink-500'
                : 'bg-indigo-50 text-indigo-500'
              : isApproved
              ? isIdeal
                ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white'
                : 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white'
              : 'bg-red-50 text-red-400'
          }`}
        >
          {isRejected ? (
            <XCircle size={20} />
          ) : isApproved && !isIdeal ? (
            <CheckCircle2 size={20} />
          ) : isIdeal ? (
            <Heart size={20} fill={isApproved ? 'currentColor' : 'none'} />
          ) : (
            <Dice5 size={20} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-slate-900 text-sm truncate pr-2">
              {item.matchingTypeLabel}
            </h3>
            <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-md">
              <Calendar size={10} /> {formatDate(item.appliedAt)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            {isPending && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                승인 대기중
              </span>
            )}
            {isApproved && (
              <span className="text-xs font-bold text-green-600">
                {item.applicationCount}명 매칭 완료
              </span>
            )}
            {isRejected && (
              <span className="text-xs text-red-500 font-medium">
                {item.rejectedReason ?? '거절됨'}
              </span>
            )}
            {isApproved && (
              <div className="flex items-center text-xs font-bold text-slate-400 group-hover:text-slate-900 transition-colors">
                결과 보기 <ChevronRight size={14} />
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default RequestsPage;
