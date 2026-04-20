import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Orbs } from '@/components/ui/Orbs';
import { useDisplayMode } from '@/store/displayModeStore';
import { useToast } from '@/components/ui/Toast';
import { getCoupons, useCoupon } from '@/features/coupon/api';
import { getApiErrorMessage } from '@/lib/axios';
import type { CouponItem, CouponStatus } from '@/types';

type CouponFilter = 'ALL' | 'AVAILABLE' | 'USED_OR_EXPIRED';

const FILTER_TABS: { value: CouponFilter; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'AVAILABLE', label: '사용 가능' },
  { value: 'USED_OR_EXPIRED', label: '사용·만료' },
];
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Ticket, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const STATUS_LABELS: Record<CouponStatus, string> = {
  AVAILABLE: '사용 가능',
  USED: '사용 완료',
  EXPIRED: '만료됨',
};

const formatExpiry = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
};

const CouponsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const { toast } = useToast();
  const [items, setItems] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [cursor, setCursor] = useState<number | undefined>(undefined);
  const [loadError, setLoadError] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<CouponItem | null>(null);
  const [isUsing, setIsUsing] = useState(false);
  const [filter, setFilter] = useState<CouponFilter>('ALL');
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const fetchCoupons = useCallback((nextCursor?: number): void => {
    if (nextCursor) {
      setIsFetchingMore(true);
    } else {
      setIsLoading(true);
      setLoadError(false);
    }

    getCoupons({ filter, lastCouponId: nextCursor, size: 20 })
      .then((res) => {
        const page = res.data;
        if (!page) return;
        setItems((prev) => nextCursor ? [...prev, ...page.items] : page.items);
        setHasNext(page.hasNext);
        setCursor(page.nextCursor ?? undefined);
      })
      .catch(() => {
        if (!nextCursor) setLoadError(true);
      })
      .finally(() => {
        setIsLoading(false);
        setIsFetchingMore(false);
      });
  }, [filter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    if (!sentinelRef.current) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNext && !isFetchingMore) {
          fetchCoupons(cursor);
        }
      },
      { rootMargin: '80px' }
    );
    observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [hasNext, isFetchingMore, cursor, fetchCoupons]);

  const handleUseConfirm = (): void => {
    if (!confirmTarget) return;
    const targetId = confirmTarget.id;
    setIsUsing(true);
    useCoupon(targetId)
      .then(() => {
        setItems((prev) =>
          prev.map((c) => (c.id === targetId ? { ...c, status: 'USED' as CouponStatus } : c))
        );
        toast('쿠폰이 사용되었습니다! 티켓이 지급됩니다 🎟️', 'success');
      })
      .catch((err: unknown) => {
        toast(getApiErrorMessage(err), 'error');
      })
      .finally(() => {
        setIsUsing(false);
        setConfirmTarget(null);
      });
  };

  return (
    <MobileLayout className="!bg-transparent">
      <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
      <Orbs />

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
      <MobileHeader title="내 쿠폰" onBack={() => navigate(-1)} />

      {/* 필터 탭 */}
      <div className="px-4 py-2.5 flex gap-2" style={{ borderBottom: '1px solid rgba(59,130,246,.08)' }}>
        {FILTER_TABS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${
              filter === value
                ? 'text-white shadow-sm'
                : 'bg-white/60 text-slate-500 hover:bg-white/80'
            }`}
            style={filter === value ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)' } : undefined}
          >
            {label}
          </button>
        ))}
      </div>

      <div className={`flex-1 overflow-y-auto p-4 relative z-10 ${isPWA ? 'pb-8' : 'pb-6'}`}>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl p-4 h-24 animate-shimmer-gradient" style={{ background: 'rgba(255,255,255,.82)', border: '1px solid rgba(255,255,255,.65)' }} />
            ))}
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm font-semibold text-slate-700">쿠폰을 불러오지 못했습니다</p>
            <button
              onClick={() => fetchCoupons()}
              className="mt-1 px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Ticket size={40} className="text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">보유한 쿠폰이 없습니다</p>
            <p className="text-xs text-slate-400">쿠폰 이벤트에 참여해 쿠폰을 받아보세요!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: Math.min(i * 0.07, 0.35), ease: [0.22, 1, 0.36, 1] }}
                className={`rounded-2xl overflow-hidden transition-opacity ${
                  item.status !== 'AVAILABLE' ? 'opacity-60' : ''
                }`}
                style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,.65)' }}
              >
                {/* 쿠폰 상단 색띠 */}
                <div
                  className="h-1.5"
                  style={item.status === 'AVAILABLE' ? { background: 'linear-gradient(135deg, #7c3aed, #a855f7)' } : { background: '#e2e8f0' }}
                />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'AVAILABLE'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.status === 'USED'
                            ? 'bg-slate-100 text-slate-500'
                            : 'bg-rose-100 text-rose-500'
                        }`}>
                          {item.status === 'AVAILABLE' ? (
                            <CheckCircle2 size={10} />
                          ) : item.status === 'USED' ? (
                            <CheckCircle2 size={10} />
                          ) : (
                            <XCircle size={10} />
                          )}
                          {STATUS_LABELS[item.status]}
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate">{item.eventName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        티켓 {item.rewardTicketAmount}장
                      </p>
                    </div>

                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-violet-100 text-violet-600">
                      <Ticket size={22} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={11} />
                      {formatExpiry(item.eventExpiresAt)} 만료
                    </span>

                    {item.status === 'AVAILABLE' && (
                      <button
                        onClick={() => setConfirmTarget(item)}
                        className="px-4 py-1.5 text-white text-xs font-bold rounded-xl shadow-sm shadow-violet-200/40 hover:shadow-violet-300/50 active:opacity-80 transition-all"
                        style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                      >
                        사용하기
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            <div ref={sentinelRef} className="h-1" />

            {isFetchingMore && (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* 쿠폰 사용 확인 모달 */}
      <AnimatePresence>
        {confirmTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60]"
              onClick={() => !isUsing && setConfirmTarget(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] rounded-2xl w-[calc(100%-2rem)] max-w-[360px]"
              style={{ background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(20px) saturate(180%)' }}
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">쿠폰 사용</h3>
                <p className="text-sm text-slate-500 mb-1">
                  <span className="font-semibold text-slate-800">{confirmTarget.eventName}</span>
                </p>
                <p className="text-sm text-slate-500 mb-6">
                  티켓 {confirmTarget.rewardTicketAmount}장이 지급됩니다.
                  사용 후에는 취소할 수 없습니다.
                </p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setConfirmTarget(null)}
                    disabled={isUsing}
                    className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleUseConfirm}
                    disabled={isUsing}
                    className="flex-1 py-3.5 rounded-2xl text-white text-sm font-bold active:opacity-80 shadow-md shadow-violet-200/40 transition-all disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
                  >
                    {isUsing ? '처리중...' : '사용 확인'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </div>
    </MobileLayout>
  );
};

export default CouponsPage;
