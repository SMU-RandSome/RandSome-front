import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { getMatchingResult } from '@/features/matching/api';
import type { MatchingResultDetailItem } from '@/types';
import { ArrowLeft, User, Heart, Instagram, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CLAMP_LIMIT = 80;
const VALID_INSTAGRAM_ID = /^[a-zA-Z0-9._]{1,30}$/;

const ClampedText: React.FC<{ text: string }> = ({ text }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > CLAMP_LIMIT;
  const display = isLong && !expanded ? text.slice(0, CLAMP_LIMIT) + '…' : text;

  return (
    <div>
      <p className="text-slate-700 text-xs leading-relaxed">&ldquo;{display}&rdquo;</p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 flex items-center gap-0.5 text-[10px] text-slate-400 hover:text-slate-600"
        >
          {expanded ? <><ChevronUp size={10} />접기</> : <><ChevronDown size={10} />더 보기</>}
        </button>
      )}
    </div>
  );
};

interface LocationState {
  applicationId: number;
}

// 방향 기반 슬라이드 variants
const cardVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '72%' : '-72%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '-14%' : '14%',
    opacity: 0,
    scale: 0.96,
  }),
};

const CARD_TRANSITION = {
  duration: 0.42,
  ease: [0.4, 0, 0.2, 1] as const,
};

const MatchRequestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPWA } = useDisplayMode();
  const { applicationId } = (location.state as LocationState) ?? {};

  const [results, setResults] = useState<MatchingResultDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!applicationId) {
      navigate('/requests', { replace: true });
      return;
    }
    let cancelled = false;
    getMatchingResult(applicationId)
      .then((res) => {
        if (cancelled) return;
        if (res.data) setResults(res.data);
      })
      .catch(() => {
        if (cancelled) return;
        navigate('/requests', { replace: true });
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [applicationId, navigate]);

  const goNext = useCallback((): void => {
    if (currentIndex < results.length - 1) {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  }, [currentIndex, results.length]);

  const goPrev = useCallback((): void => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex((i) => i - 1);
    }
  }, [currentIndex]);

  const goTo = useCallback((index: number): void => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  }, [currentIndex]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  if (!applicationId) return null;

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === results.length - 1;

  const cardStack = (height: string) => (
    <div className={`relative w-full ${height}`}>
      {!isLast && results[currentIndex + 2] && (
        <div className="absolute inset-x-6 bottom-0 rounded-3xl bg-slate-200" style={{ top: 10, zIndex: 0 }} />
      )}
      {!isLast && results[currentIndex + 1] && (
        <div className="absolute inset-x-3 bottom-0 rounded-3xl bg-slate-100 shadow-sm" style={{ top: 5, zIndex: 1 }} />
      )}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={cardVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={CARD_TRANSITION}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60 || info.velocity.x < -400) goNext();
            else if (info.offset.x > 60 || info.velocity.x > 400) goPrev();
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing select-none"
          style={{ touchAction: 'pan-y', zIndex: 2 }}
        >
          <ProfileSwipeCard result={results[currentIndex]} />
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const dotNav = (
    <div className="flex justify-center items-center gap-1.5">
      {results.map((_, i) => (
        <button
          key={i}
          onClick={() => goTo(i)}
          aria-label={`${i + 1}번 카드`}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === currentIndex ? 'w-6 bg-slate-700' : 'w-1.5 bg-slate-300 hover:bg-slate-400'
          }`}
        />
      ))}
    </div>
  );

  // ── 웹 레이아웃 ────────────────────────────────────────────────
  if (!isPWA) {
    return (
      <MobileLayout>
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">매칭 결과</h1>
            {!isLoading && results.length > 0 && (
              <p className="text-sm text-slate-400">{results.length}명의 인연이 기다리고 있어요</p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-md h-[560px] rounded-3xl bg-slate-200 animate-pulse" />
            <p className="text-slate-400 text-sm animate-pulse">인연을 불러오는 중...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Heart size={32} className="text-slate-300" />
            </div>
            <p className="text-slate-500 font-semibold">아직 매칭 결과가 없어요</p>
            <p className="text-slate-400 text-sm mt-1">조금만 기다려주세요</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* 캐러셀 — 사이드 버튼 + 카드 */}
            <div className="flex items-center justify-center gap-6 w-full">
              <button
                onClick={goPrev}
                disabled={isFirst}
                className="shrink-0 w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                aria-label="이전 카드"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex-1 max-w-md">
                {cardStack('h-[560px]')}
              </div>

              <button
                onClick={goNext}
                disabled={isLast}
                className="shrink-0 w-14 h-14 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                aria-label="다음 카드"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* 도트 + 카운터 */}
            <div className="mt-5 space-y-2 text-center">
              {results.length > 1 && dotNav}
              <p className="text-slate-400 text-sm tabular-nums">
                {currentIndex + 1}
                <span className="text-slate-300 mx-1.5">/</span>
                {results.length}
              </p>
              {results.length > 1 && (
                <p className="text-slate-400 text-xs">좌우 버튼 또는 키보드 방향키로 넘겨보세요</p>
              )}
            </div>

            <p className="mt-6 text-slate-300 text-xs">
              불쾌감을 주는 언행은 제재 대상입니다. 매너 있는 대화를 부탁드려요.
            </p>
          </div>
        )}
      </MobileLayout>
    );
  }

  // ── PWA 레이아웃 ───────────────────────────────────────────────
  return (
    <MobileLayout className="bg-slate-50">
      <header className="shrink-0 h-14 flex items-center justify-between px-4 bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 [will-change:transform]">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          aria-label="뒤로 가기"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-sm font-bold text-slate-900">매칭 결과</h1>
          {!isLoading && results.length > 0 && (
            <p className="text-[11px] text-slate-400">{results.length}명의 인연</p>
          )}
        </div>
        <div className="w-10" />
      </header>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
          <div className="w-full h-[420px] rounded-3xl bg-slate-200 animate-pulse" />
          <p className="text-slate-400 text-xs animate-pulse">인연을 불러오는 중...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
          <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <Heart size={32} className="text-slate-300" />
          </div>
          <p className="text-slate-500 font-semibold">아직 매칭 결과가 없어요</p>
          <p className="text-slate-400 text-sm mt-1">조금만 기다려주세요</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 px-5 pt-5 pb-6">
          {cardStack('flex-1 min-h-0')}

          <div className="shrink-0 mt-5 space-y-3">
            {results.length > 1 && dotNav}

            <div className="flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={isFirst}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="이전 카드"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-slate-400 text-sm font-medium tabular-nums">
                {currentIndex + 1}
                <span className="text-slate-300 mx-1.5">/</span>
                {results.length}
              </span>

              <button
                onClick={goNext}
                disabled={isLast}
                className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all shadow-sm"
                aria-label="다음 카드"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {results.length > 1 && (
              <p className="text-center text-slate-400 text-[11px]">좌우로 스와이프하거나 버튼을 눌러보세요</p>
            )}
          </div>

          <p className="shrink-0 text-center text-slate-300 text-[10px] mt-4">
            불쾌감을 주는 언행은 제재 대상입니다. 매너 있는 대화를 부탁드려요.
          </p>
        </div>
      )}
    </MobileLayout>
  );
};

const ProfileSwipeCard: React.FC<{ result: MatchingResultDetailItem }> = ({ result }) => {
  const isMale = result.gender === 'MALE';
  const instagramId =
    result.instagramId && VALID_INSTAGRAM_ID.test(result.instagramId)
      ? result.instagramId
      : null;

  return (
    <div className="absolute inset-0 bg-white rounded-3xl shadow-md border border-slate-100 overflow-hidden flex flex-col">
      {/* 히어로 배너 */}
      <div
        className={`relative shrink-0 h-44 overflow-hidden ${
          isMale
            ? 'bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600'
            : 'bg-gradient-to-br from-pink-400 via-rose-400 to-red-500'
        }`}
      >
        {/* 장식 */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/10" />
        <div className="absolute -bottom-4 -left-4 w-24 h-24 rounded-full bg-white/10" />

        {/* 아바타 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[70px] h-[70px] rounded-2xl bg-white/25 border-2 border-white/50 shadow-lg flex items-center justify-center">
            <span className="text-3xl font-black text-white select-none">
              {result.nickname[0]}
            </span>
          </div>
        </div>

        {/* 배지 */}
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full border border-white/30">
            {isMale ? '♂ 남성' : '♀ 여성'}
          </span>
          <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-full border border-white/30">
            {result.mbti}
          </span>
        </div>
      </div>

      {/* 프로필 정보 */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <h2 className="text-lg font-black text-slate-900 mb-3">{result.nickname}</h2>

        {instagramId && (
          <a
            href={`https://instagram.com/${instagramId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2.5 px-3.5 mb-4 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-2xl border border-pink-100 hover:shadow-sm transition-shadow"
          >
            <Instagram size={14} className="text-pink-500 shrink-0" />
            <span className="font-bold text-slate-800 text-sm">@{instagramId}</span>
          </a>
        )}

        <div className="space-y-3">
          <div className="bg-slate-50 rounded-2xl p-3.5">
            <p className="text-[10px] font-bold text-slate-400 mb-1.5 flex items-center gap-1">
              <User size={10} /> 자기 소개
            </p>
            {result.selfIntroduction
              ? <ClampedText text={result.selfIntroduction} />
              : <p className="text-slate-400 text-xs italic">작성된 내용이 없어요</p>
            }
          </div>

          <div className="bg-pink-50 rounded-2xl p-3.5">
            <p className="text-[10px] font-bold text-pink-400 mb-1.5 flex items-center gap-1">
              <Heart size={10} fill="currentColor" /> 이상형
            </p>
            {result.idealDescription
              ? <ClampedText text={result.idealDescription} />
              : <p className="text-pink-300 text-xs italic">작성된 내용이 없어요</p>
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchRequestDetailPage;
