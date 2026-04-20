import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { useToast } from '@/components/ui/Toast';
import { getCouponEvent, claimCouponEvent } from '@/features/coupon/api';
import { getApiErrorMessage } from '@/lib/axios';
import type { CouponEventDetailItem } from '@/types';
import { ChevronLeft, Ticket, Clock, Gift, Lock } from 'lucide-react';
import { motion } from 'motion/react';

const EVENT_TYPE_LABELS = {
  HAPPY_HOUR: '해피 아워',
  SECRET_CODE: '시크릿 코드',
} as const;

const STATUS_LABELS = {
  DRAFT: '준비중',
  ACTIVE: '진행중',
  ENDED: '종료됨',
} as const;

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  });

const CouponEventPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { isPWA } = useDisplayMode();
  const { toast } = useToast();
  const [event, setEvent] = useState<CouponEventDetailItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [secretCode, setSecretCode] = useState('');
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    if (!id) return;
    const eventId = parseInt(id, 10);
    if (isNaN(eventId)) {
      setLoadError(true);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    getCouponEvent(eventId)
      .then((res) => {
        if (!cancelled) setEvent(res.data);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [id]);

  const handleClaim = (): void => {
    if (!id || !event) return;
    const eventId = parseInt(id, 10);
    setIsClaiming(true);
    claimCouponEvent(eventId, event.type === 'SECRET_CODE' ? secretCode : undefined)
      .then(() => {
        toast('쿠폰이 발급되었습니다! 쿠폰함을 확인해주세요 🎟️', 'success');
        navigate('/coupons');
      })
      .catch((err: unknown) => {
        toast(getApiErrorMessage(err), 'error');
      })
      .finally(() => {
        setIsClaiming(false);
      });
  };

  const isActive = event?.status === 'ACTIVE';
  const canClaim = isActive && (event?.type !== 'SECRET_CODE' || secretCode.trim().length > 0);

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
        <h1 className="text-lg font-bold text-slate-900 flex-1">쿠폰 이벤트</h1>
      </header>

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isPWA ? 'pb-8' : 'pb-6'}`}>
        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-white/80 rounded-3xl h-48 animate-shimmer-gradient" />
            <div className="bg-white/80 rounded-2xl h-24 animate-shimmer-gradient" />
          </div>
        ) : loadError || !event ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm font-semibold text-slate-700">이벤트를 불러오지 못했습니다</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-1 px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              돌아가기
            </button>
          </div>
        ) : (
          <>
            {/* 이벤트 정보 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={`rounded-3xl p-5 text-white shadow-lg relative overflow-hidden ${
                event.rewardTicketType === 'RANDOM'
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200/40'
                  : 'bg-gradient-to-br from-violet-500 to-purple-700 shadow-violet-200/40'
              }`}
            >
              {/* 배경 장식 */}
              <div className="absolute right-4 top-4 opacity-10">
                <Gift size={80} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                    isActive ? 'bg-white/30' : 'bg-black/20'
                  }`}>
                    {STATUS_LABELS[event.status]}
                  </span>
                  <span className="text-[11px] font-semibold opacity-70">
                    {EVENT_TYPE_LABELS[event.type]}
                  </span>
                </div>

                <h2 className="text-xl font-black mb-1">{event.name}</h2>
                <p className="text-sm opacity-80 mb-4">{event.description}</p>

                <div className="bg-white/20 rounded-xl p-3 flex items-center gap-3">
                  <Ticket size={20} />
                  <div>
                    <p className="text-xs opacity-70">지급 보상</p>
                    <p className="text-sm font-bold">
                      {event.rewardTicketType === 'RANDOM' ? '랜덤권' : '이상형권'} {event.rewardAmount}장
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 이벤트 기간 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-100/80 shadow-[0_1px_10px_rgba(0,0,0,0.04)] space-y-2.5"
            >
              <div className="flex items-center gap-2 text-slate-500">
                <Clock size={15} />
                <span className="text-xs font-semibold">이벤트 기간</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-[11px] text-slate-400 mb-0.5">시작</p>
                  <p className="font-semibold text-slate-800 text-xs">{formatDate(event.startsAt)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-slate-400 mb-0.5">종료</p>
                  <p className="font-semibold text-slate-800 text-xs">{formatDate(event.expiresAt)}</p>
                </div>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 mb-0.5">쿠폰 만료일</p>
                <p className="text-xs font-semibold text-slate-800">{formatDate(event.couponExpiresAt)}</p>
              </div>
            </motion.div>

            {/* 시크릿 코드 입력 (필요 시) */}
            {event.type === 'SECRET_CODE' && isActive && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-100/80 shadow-[0_1px_10px_rgba(0,0,0,0.04)]"
              >
                <label htmlFor="secretCode" className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2.5">
                  <Lock size={15} />
                  시크릿 코드 입력
                </label>
                <input
                  id="secretCode"
                  type="text"
                  value={secretCode}
                  onChange={(e) => setSecretCode(e.target.value)}
                  placeholder="이벤트 코드를 입력하세요"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
                />
              </motion.div>
            )}

            {/* 발급 버튼 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                onClick={handleClaim}
                disabled={!canClaim || isClaiming}
                className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 ${
                  canClaim && !isClaiming
                    ? event.rewardTicketType === 'RANDOM'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60 active:opacity-80'
                      : 'bg-gradient-to-r from-violet-500 to-purple-700 text-white shadow-lg shadow-violet-200/50 hover:shadow-violet-300/60 active:opacity-80'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isClaiming ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    처리중...
                  </span>
                ) : !isActive ? (
                  `이벤트 ${STATUS_LABELS[event.status]}`
                ) : (
                  '쿠폰 발급받기'
                )}
              </button>
            </motion.div>
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default CouponEventPage;
