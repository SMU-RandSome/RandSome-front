import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { Orbs } from '@/components/ui/Orbs';
import { useDisplayMode } from '@/store/displayModeStore';
import { getMatchingHistory, withdrawMatching } from '@/features/matching/api';
import { getApiErrorMessage } from '@/lib/axios';
import { useToast } from '@/components/ui/Toast';
import type { MatchingHistoryItem, MatchingType } from '@/types';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Heart, Sparkles, X, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const getMatchingTypeLabel = (type: MatchingType): string =>
  type === 'RANDOM' ? '랜덤 매칭' : '이상형 매칭';

type StatusKey = 'SUCCESS' | 'PENDING' | 'CANCELLED';

const STATUS_BADGE: Record<StatusKey, { bg: string; color: string; border: string; label: string }> = {
  SUCCESS: {
    bg: 'rgba(34,197,94,.12)',
    color: '#15803d',
    border: 'rgba(34,197,94,.25)',
    label: '매칭 성공',
  },
  PENDING: {
    bg: 'rgba(251,191,36,.14)',
    color: '#b45309',
    border: 'rgba(251,191,36,.3)',
    label: '22시 공개',
  },
  CANCELLED: {
    bg: 'rgba(148,163,184,.1)',
    color: '#64748b',
    border: 'rgba(148,163,184,.22)',
    label: '미매칭',
  },
};

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,.82)',
  backdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,.65)',
};


const RequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const { toast } = useToast();
  const [items, setItems] = useState<MatchingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [withdrawTarget, setWithdrawTarget] = useState<MatchingHistoryItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(false);
    getMatchingHistory()
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
  }, [retryKey]);

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

  const formatDate = (iso: string): string => {
    const d = new Date(iso);
    const date = d.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
    const time = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${date} ${time}`;
  };

  return (
    <MobileLayout className="!bg-transparent">
      <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
        <Orbs />

        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <MobileHeader title="신청내역" />

        <div className={`flex-1 overflow-y-auto p-4 ${isPWA ? 'pb-24' : 'pb-8'}`}>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-2xl p-4 h-20 animate-shimmer-gradient"
                  style={glassCard}
                />
              ))}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
              <p className="text-2xl">&#9888;&#65039;</p>
              <p className="text-sm font-semibold text-slate-700">내역을 불러오지 못했습니다</p>
              <p className="text-xs text-slate-400">네트워크 연결을 확인하고 다시 시도해주세요.</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="mt-1 px-5 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : items.length === 0 ? (
            <EmptyState
              icon={<span>&#128140;</span>}
              title="아직 신청 내역이 없어요"
              description="매칭을 신청하면 여기서 확인할 수 있어요!"
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {items.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
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
              ))}
            </motion.div>
          )}
        </div>

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
                onClick={() => setWithdrawTarget(null)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] rounded-3xl w-[calc(100%-2rem)] max-w-[380px] p-6"
                style={{ background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(59,130,246,.1)' }}
              >
                <h3 className="text-xl font-bold text-slate-900 mb-2">신청 취소</h3>
                <p className="text-sm text-slate-600 mb-6">정말 신청을 취소하시겠어요?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setWithdrawTarget(null)}
                    className="flex-1 py-3 rounded-2xl text-sm font-bold"
                    style={{ background: 'rgba(255,255,255,.7)', border: '2px solid rgba(148,163,184,.2)', color: '#64748b' }}
                  >
                    닫기
                  </button>
                  <button
                    onClick={handleWithdrawConfirm}
                    className="flex-1 py-3 rounded-2xl text-white text-sm font-bold"
                    style={{ background: 'linear-gradient(135deg, #f43f5e, #ef4444)' }}
                  >
                    취소 확인
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </MobileLayout>
  );
};

const MatchingHistoryCard: React.FC<{
  item: MatchingHistoryItem;
  onViewResult: () => void;
  onWithdraw: () => void;
  formatDate: (iso: string) => string;
}> = ({ item, onViewResult, formatDate }) => {
  const isSuccess = item.applicationStatus === 'SUCCESS';
  const isCancelled = item.applicationStatus === 'CANCELLED';
  const isIdeal = item.matchingType === 'IDEAL';

  const badge = STATUS_BADGE[item.applicationStatus as StatusKey];

  const iconConfig = {
    SUCCESS: {
      bg: isIdeal
        ? 'linear-gradient(135deg,#ec4899,#f43f5e)'
        : 'linear-gradient(135deg,#2563eb,#6366f1)',
      shadow: isIdeal
        ? '0 4px 14px rgba(236,72,153,.3)'
        : '0 4px 14px rgba(59,130,246,.28)',
    },
    PENDING: {
      bg: 'linear-gradient(135deg,#2563eb,#6366f1)',
      shadow: '0 4px 14px rgba(59,130,246,.28)',
    },
    CANCELLED: {
      bg: 'rgba(226,232,240,.8)',
      shadow: 'none',
    },
  }[item.applicationStatus as StatusKey];

  return (
    <motion.div
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="rounded-[20px] p-4 cursor-default"
      style={{
        ...glassCard,
        cursor: isSuccess ? 'pointer' : 'default',
        boxShadow: '0 2px 16px rgba(0,0,0,.05)',
      }}
      onClick={isSuccess ? onViewResult : undefined}
    >
      {/* Main row */}
      <div className="flex items-center gap-2.5">
        <div
          className="w-[42px] h-[42px] rounded-[14px] flex items-center justify-center shrink-0"
          style={{ background: iconConfig.bg, boxShadow: iconConfig.shadow !== 'none' ? iconConfig.shadow : undefined }}
        >
          {isCancelled ? (
            <X size={19} className="text-slate-500" />
          ) : isIdeal ? (
            <Heart size={19} fill="white" className="text-white" />
          ) : (
            <Sparkles size={19} className="text-white" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-[14px] text-slate-900">{getMatchingTypeLabel(item.matchingType)}</p>
          <p className="text-[11.5px] text-slate-400 mt-0.5 flex items-center gap-1">
            <Calendar size={10} /> {formatDate(item.appliedAt)}
          </p>
        </div>

        <span
          className="shrink-0 text-[11px] font-semibold px-[11px] py-1 rounded-full"
          style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
        >
          {badge.label}
        </span>
      </div>

      {/* Success inner card */}
      {isSuccess && (
        <div
          className="mt-2.5 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
          style={{
            background: 'linear-gradient(135deg,rgba(239,246,255,.8),rgba(252,231,243,.7))',
            border: '1px solid rgba(255,255,255,.8)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'linear-gradient(135deg,#c7d2fe,#fbcfe8)' }}
          >
            <Heart size={14} fill="#334155" className="text-slate-700" />
          </div>
          <div className="flex-1">
            <p className="text-[13px] font-semibold text-slate-900">
              {item.applicationCount}명 매칭 완료
            </p>
            <p className="text-[11.5px] text-slate-500">{getMatchingTypeLabel(item.matchingType)}</p>
          </div>
          <span className="text-[11.5px] text-blue-600 font-semibold">결과 보기 →</span>
        </div>
      )}

      {/* Cancelled reason */}
      {isCancelled && (
        <p
          className="mt-2.5 pt-2.5 text-[12px] text-slate-400 leading-relaxed"
          style={{ borderTop: '1px dashed rgba(226,232,240,.8)' }}
        >
          조건에 맞는 후보가 부족했어요. 조건을 넓혀 다시 신청해볼까요?
        </p>
      )}
    </motion.div>
  );
};

export default RequestsPage;
