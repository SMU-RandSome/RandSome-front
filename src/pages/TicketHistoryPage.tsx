import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Orbs } from '@/components/ui/Orbs';
import { useDisplayMode } from '@/store/displayModeStore';
import { getTicketHistory } from '@/features/ticket/api';
import type { TicketHistoryItem, TicketActionType, TicketSource, TicketType } from '@/types';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Ticket, TrendingUp, TrendingDown, RotateCcw, ArrowUpDown } from 'lucide-react';

const TICKET_TYPE_TABS: { value: TicketType | 'ALL'; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'RANDOM', label: '랜덤권' },
  { value: 'IDEAL', label: '이상형권' },
];
import { motion, AnimatePresence } from 'motion/react';

const ACTION_TYPE_LABELS: Record<TicketActionType, string> = {
  EARN: '획득',
  USE: '사용',
  REFUND: '환불',
};

const SOURCE_LABELS: Record<TicketSource, string> = {
  JOIN: '회원가입',
  ATTENDANCE: '출석 체크',
  COUPON: '쿠폰 사용',
  MATCHING: '매칭 신청',
  PARTIAL_MATCH_REFUND: '부분 매칭 환불',
  NO_MATCH_REFUND: '미매칭 환불',
  ADMIN: '관리자 지급',
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' }) +
    ' ' + d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
};

const TicketHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const [items, setItems] = useState<TicketHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);
  const [ticketTypeFilter, setTicketTypeFilter] = useState<TicketType | 'ALL'>('ALL');
  const [sortType, setSortType] = useState<'LATEST' | 'OLDEST'>('LATEST');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchHistory = useCallback((nextCursor?: number): void => {
    if (nextCursor) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
      setLoadError(false);
    }

    getTicketHistory({
      ticketType: ticketTypeFilter === 'ALL' ? undefined : ticketTypeFilter,
      sortType,
      cursor: nextCursor,
      size: 20,
    })
      .then((res) => {
        const page = res.data;
        if (page) {
          setItems((prev) => nextCursor ? [...prev, ...page.items] : page.items);
          setHasNext(page.hasNext);
          setCursor(page.nextCursor ?? undefined);
        }
        setIsLoading(false);
        setIsFetchingMore(false);
      })
      .catch(() => {
        if (!nextCursor) setLoadError(true);
        setIsLoading(false);
        setIsFetchingMore(false);
      });
  }, [ticketTypeFilter, sortType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // 무한 스크롤 sentinel
  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isFetchingMore) {
          fetchHistory(cursor);
        }
      },
      { rootMargin: '80px' }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasNext, isFetchingMore, cursor, fetchHistory]);

  return (
    <MobileLayout className="!bg-transparent">
      <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
      <Orbs />

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
      <MobileHeader title="티켓 이력" onBack={() => navigate(-1)} />

      {/* 필터 + 정렬 */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid rgba(59,130,246,.08)' }}>
        <div className="flex gap-2">
          {TICKET_TYPE_TABS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setTicketTypeFilter(value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
                ticketTypeFilter === value
                  ? 'bg-[#0c1535] text-white shadow-sm'
                  : 'bg-white/60 text-slate-500 hover:bg-white/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setSortType((s) => s === 'LATEST' ? 'OLDEST' : 'LATEST')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white/60 text-slate-500 hover:bg-white/80 transition-colors whitespace-nowrap shrink-0"
        >
          <ArrowUpDown size={11} />
          {sortType === 'LATEST' ? '최신순' : '오래된순'}
        </button>
      </div>

      <div className={`flex-1 overflow-y-auto p-4 relative z-10 ${isPWA ? 'pb-8' : 'pb-6'}`}>
        {isLoading && items.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-2xl p-4 h-16 animate-shimmer-gradient" style={{ background: 'rgba(255,255,255,.82)', border: '1px solid rgba(255,255,255,.65)' }} />
            ))}
          </div>
        ) : loadError && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm font-semibold text-slate-700">이력을 불러오지 못했습니다</p>
            <button
              onClick={() => fetchHistory()}
              className="mt-1 px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : !isLoading && items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Ticket size={40} className="text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">티켓 이력이 없습니다</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2.5" style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.15s' }}>
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-2xl p-4 flex items-center gap-3"
                  style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,.65)' }}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    item.actionType === 'EARN'
                      ? 'bg-emerald-100 text-emerald-600'
                      : item.actionType === 'REFUND'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-rose-100 text-rose-500'
                  }`}>
                    {item.actionType === 'EARN' ? (
                      <TrendingUp size={18} />
                    ) : item.actionType === 'REFUND' ? (
                      <RotateCcw size={18} />
                    ) : (
                      <TrendingDown size={18} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold text-slate-900 truncate pr-2">
                        {SOURCE_LABELS[item.source]}
                      </span>
                      <span className={`text-sm font-bold shrink-0 ${
                        item.actionType === 'EARN'
                          ? 'text-emerald-600'
                          : item.actionType === 'REFUND'
                          ? 'text-blue-600'
                          : 'text-rose-500'
                      }`}>
                        {item.actionType === 'USE' ? '-' : '+'}{item.amount}장
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {item.ticketType === 'RANDOM' ? '랜덤권' : '이상형권'} · {ACTION_TYPE_LABELS[item.actionType]}
                      </span>
                      <span className="text-[11px] text-slate-300">{formatDate(item.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* 무한 스크롤 sentinel */}
              <div ref={sentinelRef} className="h-1" />

              {isFetchingMore && (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
          </AnimatePresence>
        )}
      </div>
      </div>
      </div>
    </MobileLayout>
  );
};

export default TicketHistoryPage;
