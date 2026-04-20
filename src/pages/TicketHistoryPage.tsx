import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { getTicketHistory } from '@/features/ticket/api';
import type { TicketHistoryItem, TicketActionType, TicketSource } from '@/types';
import { ChevronLeft, Ticket, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';
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
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchHistory = useCallback((nextCursor?: string): void => {
    if (nextCursor) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
      setLoadError(false);
    }

    getTicketHistory(nextCursor)
      .then((res) => {
        const page = res.data;
        if (!page) return;
        setItems((prev) => nextCursor ? [...prev, ...page.content] : page.content);
        setHasNext(page.hasNext);
        setCursor(page.cursor);
      })
      .catch(() => {
        if (!nextCursor) setLoadError(true);
      })
      .finally(() => {
        setIsLoading(false);
        setIsFetchingMore(false);
      });
  }, []);

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
    <MobileLayout>
      <header className="sticky top-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={22} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1">티켓 이력</h1>
      </header>

      <div className={`flex-1 overflow-y-auto p-4 ${isPWA ? 'pb-8' : 'pb-6'}`}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white/80 rounded-2xl p-4 border border-slate-100/60 h-16 animate-shimmer-gradient" />
            ))}
          </div>
        ) : loadError ? (
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
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Ticket size={40} className="text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">티켓 이력이 없습니다</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: Math.min(i * 0.06, 0.3), ease: [0.22, 1, 0.36, 1] }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-100/80 shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
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
                        item.actionType === 'USE' ? 'text-rose-500' : 'text-emerald-600'
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
    </MobileLayout>
  );
};

export default TicketHistoryPage;
