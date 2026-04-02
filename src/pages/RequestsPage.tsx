import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { useDisplayMode } from '@/store/displayModeStore';
import { getMatchingHistory, withdrawMatching } from '@/features/matching/api';
import { getApiErrorMessage } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import type { MatchingHistoryItem, MatchingApplicationStatus } from '@/types';
import { Heart, Dice5, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'PENDING' | 'APPROVED' | 'REJECTED';

const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState<TabType>('PENDING');
  const [items, setItems] = useState<MatchingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [withdrawTarget, setWithdrawTarget] = useState<MatchingHistoryItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);
    getMatchingHistory(currentTab as MatchingApplicationStatus)
      .then((res) => {
        if (cancelled) return;
        setItems(res.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        setItems([]);
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [currentTab, retryKey]);

  const handleWithdrawConfirm = (): void => {
    if (!withdrawTarget) return;
    const targetId = withdrawTarget.id;
    withdrawMatching(targetId)
      .then(() => {
        setItems((prev) => prev.filter((item) => item.id !== targetId));
        toast('신청이 취소되었습니다', 'success');
      })
      .catch((err: unknown) => {
        toast(getApiErrorMessage(err), 'error');
      })
      .finally(() => {
        setWithdrawTarget(null);
      });
  };

  const handleCloseSheet = (): void => {
    setWithdrawTarget(null);
  };

  const TABS: { id: TabType; label: string }[] = [
    { id: 'PENDING', label: '대기중' },
    { id: 'APPROVED', label: '완료' },
    { id: 'REJECTED', label: '거절' },
  ];

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
    const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} ${time}`;
  };

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-bold text-slate-900">내 신청 내역</h1>
        </header>
      )}

      {/* 탭 — motion layoutId 전환 */}
      <div className={`sticky z-40 glass border-b border-white/20 px-4 py-2.5 ${isPWA ? 'top-14' : 'top-0'}`}>
        <div className="bg-slate-100/70 rounded-xl p-0.5 flex relative">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className="relative flex-1 py-2 rounded-[10px] text-sm font-bold transition-colors duration-200 z-10"
            >
              {currentTab === tab.id && (
                <motion.div
                  layoutId="requestsTab"
                  className="absolute inset-0 bg-white rounded-[10px] shadow-sm"
                  transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${
                currentTab === tab.id ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 ${isPWA ? 'pb-24' : 'pb-8'}`}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-100/60 h-20 animate-shimmer-gradient" />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm font-semibold text-slate-700">내역을 불러오지 못했습니다</p>
            <p className="text-xs text-slate-400">네트워크 연결을 확인하고 다시 시도해주세요.</p>
            <button
              onClick={() => setRetryKey((k) => k + 1)}
              className="mt-1 px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
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
                items.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <MatchingHistoryCard
                      item={item}
                      onViewResult={() =>
                        navigate('/requests/detail', { state: { applicationId: item.id } })
                      }
                      onWithdraw={() => setWithdrawTarget(item)}
                      formatDate={formatDate}
                    />
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      <BottomNav />

      <AnimatePresence>
        {withdrawTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60]"
              onClick={handleCloseSheet}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl w-[calc(100%-2rem)] max-w-[360px]"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">신청 취소</h3>
                <p className="text-sm text-slate-500 mb-6">정말 신청을 취소하시겠어요?</p>
                <div className="flex gap-2.5">
                  <button
                    onClick={handleCloseSheet}
                    className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
                  >
                    닫기
                  </button>
                  <button
                    onClick={handleWithdrawConfirm}
                    className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:opacity-80 shadow-md shadow-rose-200/40 transition-all"
                  >
                    취소 확인
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
};

const MatchingHistoryCard: React.FC<{
  item: MatchingHistoryItem;
  onViewResult: () => void;
  onWithdraw: () => void;
  formatDate: (iso: string) => string;
}> = ({ item, onViewResult, onWithdraw, formatDate }) => {
  const isApproved = item.applicationStatus === 'APPROVED';
  const isRejected = item.applicationStatus === 'REJECTED';
  const isPending = item.applicationStatus === 'PENDING';
  const isIdeal = item.matchingTypeLabel.includes('이상형');

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`rounded-2xl shadow-[0_1px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] border relative overflow-hidden transition-shadow duration-300 ${
        isPending
          ? 'bg-orange-50/80 backdrop-blur-sm border-orange-200/80 border-l-4 border-l-orange-400'
          : isApproved
          ? 'bg-white/90 backdrop-blur-sm border-slate-100/80 border-l-4 border-l-green-400'
          : 'bg-white/70 backdrop-blur-sm border-red-100/80 opacity-70'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
              isPending
                ? isIdeal
                  ? 'bg-pink-100 text-pink-500'
                  : 'bg-orange-100 text-orange-500'
                : isApproved
                ? isIdeal
                  ? 'bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-md shadow-pink-200/40'
                  : 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white shadow-md shadow-blue-200/40'
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
            <div className="flex justify-between items-start mb-1.5">
              <h3 className="font-bold text-slate-900 text-sm truncate pr-2">
                {item.matchingTypeLabel}
              </h3>
              <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 bg-white/70 px-1.5 py-0.5 rounded-md">
                <Calendar size={10} /> {formatDate(item.appliedAt)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isPending && (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                      <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
                      관리자 승인 대기중
                    </span>
                    <span className="text-xs font-semibold text-orange-500">
                      {item.applicationCount}명
                    </span>
                  </>
                )}
                {isApproved && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={11} />
                    {item.applicationCount}명 매칭 완료
                  </span>
                )}
                {isRejected && (
                  <span className="text-xs text-red-500 font-medium">
                    {item.rejectedReason ?? '거절됨'}
                  </span>
                )}
              </div>

              {isPending && (
                <button
                  onClick={onWithdraw}
                  className="text-xs text-rose-400 font-medium shrink-0 hover:text-rose-500 transition-colors"
                >
                  취소하기
                </button>
              )}
            </div>
          </div>
        </div>

        {isApproved && (
          <button
            onClick={onViewResult}
            className={`w-full mt-3 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:opacity-80 hover:shadow-md ${
              isIdeal
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm shadow-pink-200/30 hover:shadow-pink-200/50'
                : 'bg-gradient-to-r from-indigo-500 to-blue-500 shadow-sm shadow-blue-200/30 hover:shadow-blue-200/50'
            }`}
          >
            매칭 결과 보기
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default RequestsPage;
