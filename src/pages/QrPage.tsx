import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { getQrCode } from '@/features/qr/api';
import { ChevronLeft, QrCode, Ticket, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

const EXPIRE_SECONDS = 30;

const QrPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [countdown, setCountdown] = useState(EXPIRE_SECONDS);
  const objectUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = (): void => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const fetchQr = (isRefresh = false): void => {
    clearTimer();
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
      setLoadError(false);
    }
    getQrCode()
      .then((blob) => {
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setQrUrl(url);
        setCountdown(EXPIRE_SECONDS);
      })
      .catch(() => {
        if (!isRefresh) setLoadError(true);
      })
      .finally(() => {
        setIsLoading(false);
        setIsRefreshing(false);
      });
  };

  // 카운트다운 타이머
  useEffect(() => {
    if (!qrUrl) return;
    clearTimer();
    timerRef.current = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return clearTimer;
  }, [qrUrl]);

  useEffect(() => {
    fetchQr();
    return () => {
      clearTimer();
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const isUrgent = countdown <= 10;
  const mm = String(Math.floor(countdown / 60)).padStart(2, '0');
  const ss = String(countdown % 60).padStart(2, '0');

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
        <h1 className="text-lg font-bold text-slate-900 flex-1">QR 코드</h1>
        {qrUrl && (
          <button
            onClick={() => fetchQr(true)}
            disabled={isRefreshing}
            className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50"
            aria-label="새로고침"
          >
            <RefreshCw size={18} className={`text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </header>

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isPWA ? 'pb-8' : 'pb-6'}`}>
        {isLoading ? (
          <div className="space-y-4">
            <div className="bg-white/80 rounded-3xl h-80 animate-shimmer-gradient" />
            <div className="bg-white/80 rounded-2xl h-28 animate-shimmer-gradient" />
            <div className="bg-white/80 rounded-2xl h-40 animate-shimmer-gradient" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
            <p className="text-2xl">⚠️</p>
            <p className="text-sm font-semibold text-slate-700">QR 코드를 불러오지 못했습니다</p>
            <button
              onClick={() => fetchQr()}
              className="mt-1 px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        ) : qrUrl ? (
          <>
            {/* QR 카드 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white rounded-3xl p-6 border border-slate-100/80 shadow-[0_1px_20px_rgba(0,0,0,0.06)] flex flex-col items-center gap-5"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <QrCode size={16} className="text-slate-500" />
                  <span className="text-sm font-bold text-slate-700">내 QR 코드</span>
                </div>
                <span className={`text-xs font-bold tabular-nums px-2 py-0.5 rounded-lg transition-colors duration-300 ${
                  isUrgent ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'
                }`}>
                  {mm}:{ss}
                </span>
              </div>

              {/* QR 이미지 */}
              {isRefreshing ? (
                <div className="w-52 h-52 rounded-xl bg-slate-50 flex items-center justify-center">
                  <div className="w-7 h-7 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : (
                <img
                  src={qrUrl}
                  alt="QR 코드"
                  className="w-52 h-52 object-contain rounded-xl"
                />
              )}

              <p className="text-[11px] text-slate-400 text-center">
                이 QR 코드는 본인 인증용입니다
              </p>
            </motion.div>

            {/* 티켓 지급 안내 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-lg shadow-blue-200/40"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                  <Ticket size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold mb-1">부스 방문 시 티켓 지급</p>
                  <p className="text-xs opacity-80 leading-relaxed">
                    축제 부스에서 이 QR 코드를 스캔하면 티켓을 받을 수 있어요!
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 이용 안내 */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 border border-slate-100/80 shadow-[0_1px_10px_rgba(0,0,0,0.04)]"
            >
              <p className="text-xs font-bold text-slate-700 mb-2.5">이용 안내</p>
              <ul className="space-y-2">
                {[
                  'QR 코드는 부스 운영 직원에게 보여주세요',
                  '스캔 1회당 티켓 1장이 지급됩니다',
                  'QR 코드는 본인에게 고유하게 발급됩니다',
                  '타인에게 QR 코드를 양도하지 마세요',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                    <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {text}
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        ) : null}
      </div>
    </MobileLayout>
  );
};

export default QrPage;
