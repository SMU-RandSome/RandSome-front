import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { verifyQrCode } from '@/features/admin/api';
import { getApiErrorMessage } from '@/lib/axios';
import type { TicketType } from '@/types';
import {
  ChevronLeft,
  Camera,
  Keyboard,
  QrCode,
  Dice5,
  Heart,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

type InputMode = 'camera' | 'manual';

const AdminQrPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [mode, setMode] = useState<InputMode>('camera');
  const [ticketType, setTicketType] = useState<TicketType>('RANDOM');
  const [manualToken, setManualToken] = useState('');
  const [scannedToken, setScannedToken] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const isScannerRunning = useRef(false);

  // ── 스캐너 시작/정지 ─────────────────────────────────────────
  const stopScanner = useCallback(async (): Promise<void> => {
    if (scannerRef.current && isScannerRunning.current) {
      try {
        await scannerRef.current.stop();
      } catch {
        // 이미 정지된 상태일 수 있음
      }
      isScannerRunning.current = false;
    }
  }, []);

  const startScanner = useCallback(async (): Promise<void> => {
    if (!scannerContainerRef.current) return;
    if (isScannerRunning.current) return;

    const containerId = 'admin-qr-reader';
    scannerContainerRef.current.id = containerId;

    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode(containerId);
    }

    try {
      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decodedText) => {
          setScannedToken(decodedText);
          setIsConfirmOpen(true);
          stopScanner();
        },
        () => {
          // 스캔 실패 시 무시 (계속 스캔 중)
        },
      );
      isScannerRunning.current = true;
    } catch (err) {
      console.error('카메라 시작 실패:', err);
      toast('카메라를 시작할 수 없습니다. 권한을 확인해주세요.', 'error');
      setMode('manual');
    }
  }, [toast, stopScanner]);

  // 모드 변경 시 스캐너 시작/정지
  useEffect(() => {
    if (mode === 'camera' && !isConfirmOpen) {
      startScanner();
    } else {
      stopScanner();
    }
  }, [mode, isConfirmOpen, startScanner, stopScanner]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (scannerRef.current && isScannerRunning.current) {
        scannerRef.current.stop().catch(() => {});
        isScannerRunning.current = false;
      }
    };
  }, []);

  // ── QR 인증 요청 ─────────────────────────────────────────────
  const handleVerify = async (): Promise<void> => {
    const token = scannedToken ?? manualToken.trim();
    if (!token) return;

    setIsVerifying(true);
    try {
      await verifyQrCode({ qrToken: token, ticketType });
      toast(
        `${ticketType === 'RANDOM' ? '랜덤권' : '이상형권'} 티켓이 발급되었습니다!`,
        'success',
      );
      // 초기화
      setScannedToken(null);
      setManualToken('');
      setIsConfirmOpen(false);
      // 카메라 모드면 다시 스캐너 시작
      if (mode === 'camera') {
        // 약간의 딜레이 후 재시작 (UI 전환용)
        setTimeout(() => startScanner(), 500);
      }
    } catch (err) {
      toast(getApiErrorMessage(err, '인증에 실패했습니다.'), 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancelConfirm = (): void => {
    setScannedToken(null);
    setIsConfirmOpen(false);
  };

  const handleManualSubmit = (): void => {
    if (!manualToken.trim()) return;
    setIsConfirmOpen(true);
  };

  const activeToken = scannedToken ?? manualToken.trim();
  const ticketLabel = ticketType === 'RANDOM' ? '랜덤권' : '이상형권';

  return (
    <MobileLayout className="bg-white">
      {/* 헤더 */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-white border-b border-slate-100 px-5 h-14 flex items-center gap-3"
      >
        <button
          onClick={() => navigate('/admin')}
          className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={22} className="text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          <QrCode size={18} className="text-slate-700" />
          <h1 className="text-base font-bold text-slate-900">QR 인증</h1>
        </div>
      </motion.header>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {/* 티켓 타입 선택 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="pt-5 mb-4"
        >
          <p className="text-[10px] font-bold text-slate-400 mb-2.5">지급할 티켓 종류</p>
          <div className="flex gap-2">
            <button
              onClick={() => setTicketType('RANDOM')}
              className={`flex-1 h-12 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                ticketType === 'RANDOM'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              <Dice5 size={16} />
              랜덤권
            </button>
            <button
              onClick={() => setTicketType('IDEAL')}
              className={`flex-1 h-12 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                ticketType === 'IDEAL'
                  ? 'bg-pink-50 border-pink-200 text-pink-700'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
              }`}
            >
              <Heart size={16} />
              이상형권
            </button>
          </div>
        </motion.div>

        {/* 입력 모드 토글 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="mb-4"
        >
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => setMode('camera')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'camera'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <Camera size={14} />
              카메라 스캔
            </button>
            <button
              onClick={() => setMode('manual')}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                mode === 'manual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400'
              }`}
            >
              <Keyboard size={14} />
              직접 입력
            </button>
          </div>
        </motion.div>

        {/* 카메라 스캔 모드 */}
        <AnimatePresence mode="wait">
          {mode === 'camera' ? (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-slate-900 rounded-2xl overflow-hidden relative">
                <div
                  ref={scannerContainerRef}
                  className="w-full aspect-square [&_video]:!w-full [&_video]:!h-full [&_video]:!object-cover [&_#qr-shaded-region]:!border-[3px] [&_#qr-shaded-region]:!border-blue-400 [&_img]:hidden"
                />
                {!isScannerRunning.current && !isConfirmOpen && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-900/80">
                    <div className="w-8 h-8 border-3 border-slate-600 border-t-white rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">카메라 로딩 중...</p>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-400 text-center mt-3">
                QR 코드를 카메라에 비춰주세요
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <p className="text-xs font-bold text-slate-500 mb-3">QR 토큰 직접 입력</p>
                <input
                  type="text"
                  placeholder="QR 토큰을 입력하세요"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleManualSubmit();
                  }}
                  className="w-full h-11 px-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualToken.trim()}
                  className="w-full h-11 mt-3 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  인증 요청
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 안내 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="mt-5 bg-slate-50 border border-slate-100 rounded-2xl p-4"
        >
          <p className="text-xs font-bold text-slate-500 mb-2">사용 방법</p>
          <ul className="space-y-1.5">
            {[
              '회원의 QR 코드를 카메라로 스캔하거나 토큰을 직접 입력합니다',
              '지급할 티켓 종류(랜덤권/이상형권)를 선택합니다',
              '확인 후 티켓이 즉시 지급됩니다',
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-2 text-[11px] text-slate-400">
                <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {text}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* 확인 모달 */}
      <AnimatePresence>
        {isConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={isVerifying ? undefined : handleCancelConfirm}
            />
            <motion.div
              className="relative w-full max-w-[360px] bg-white rounded-3xl p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="flex flex-col items-center text-center mb-6">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
                  ticketType === 'RANDOM'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-pink-100 text-pink-600'
                }`}>
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">티켓 발급 확인</h3>
                <p className="text-sm text-slate-500">
                  <span className="font-semibold">{ticketLabel}</span>을 발급하시겠습니까?
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl p-3.5 mb-5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">토큰</span>
                  <span className="text-slate-700 font-mono text-[11px] max-w-[180px] truncate">
                    {activeToken}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-400 font-medium">티켓 종류</span>
                  <span className={`font-semibold ${
                    ticketType === 'RANDOM' ? 'text-blue-600' : 'text-pink-600'
                  }`}>
                    {ticketLabel}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleCancelConfirm}
                  disabled={isVerifying}
                  className="flex-1 h-11 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-40 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className={`flex-1 h-11 rounded-2xl text-sm font-semibold text-white transition-colors flex items-center justify-center gap-2 ${
                    ticketType === 'RANDOM'
                      ? 'bg-blue-600 hover:bg-blue-500'
                      : 'bg-pink-600 hover:bg-pink-500'
                  } disabled:opacity-60`}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      처리 중...
                    </>
                  ) : (
                    '발급'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
};

export default AdminQrPage;
