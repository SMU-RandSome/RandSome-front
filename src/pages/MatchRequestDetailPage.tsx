import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Orbs } from '@/components/ui/Orbs';
import { Stars } from '@/components/ui/Stars';
import { useToast } from '@/components/ui/Toast';
import { getMatchingResult } from '@/features/matching/api';
import { createReport } from '@/features/report/api';
import { getApiErrorMessage } from '@/lib/axios';
import type { MatchingResultDetailItem, ReportReason } from '@/types';
import { Heart, Instagram, ChevronLeft, Flag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const VALID_INSTAGRAM_ID = /^[a-zA-Z0-9._]{1,30}$/;

const PERSONALITY_TAG_LABELS: Record<string, string> = {
  ACTIVE: '활발한', QUIET: '조용한', AFFECTIONATE: '다정한', INDEPENDENT: '독립적인',
  FUNNY: '유머있는', SERIOUS: '진지한', OPTIMISTIC: '긍정적인', CAREFUL: '신중한',
};

const FACE_TYPE_TAG_LABELS: Record<string, string> = {
  PUPPY: '강아지상', CAT: '고양이상', BEAR: '곰상', FOX: '여우상',
  RABBIT: '토끼상', PURE: '청순한', CHIC: '시크한', WARM: '훈훈한',
};

const DATING_STYLE_TAG_LABELS: Record<string, string> = {
  FREQUENT_CONTACT: '자주 연락', MODERATE_CONTACT: '적당한 연락',
  PLANNED_DATE: '계획형 데이트', SPONTANEOUS_DATE: '즉흥형 데이트',
  SKINSHIP_LOVER: '스킨십 많은', RESPECTFUL_SPACE: '각자 시간 존중',
  EXPRESSIVE: '감정 표현 잘함', GROW_TOGETHER: '함께 성장',
};

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  INAPPROPRIATE_CONTENT: '부적절한 내용',
  PLAGIARIZED_PROFILE: '프로필 도용',
  FAKE_PROFILE: '허위 프로필',
  HARASSMENT: '괴롭힘/욕설',
  SCAM: '사기 행위',
  OTHER: '기타',
};

const AVATAR_GRADIENTS = [
  ['#c7d2fe', '#fbcfe8'],
  ['#d1fae5', '#bfdbfe'],
  ['#ede9fe', '#fce7f3'],
  ['#fef3c7', '#dbeafe'],
  ['#cffafe', '#e9d5ff'],
];

interface LocationState {
  applicationId: number;
}

const MatchRequestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { applicationId } = (location.state as LocationState) ?? {};

  const [results, setResults] = useState<MatchingResultDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [reportTarget, setReportTarget] = useState<MatchingResultDetailItem | null>(null);

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

  const go = useCallback((dir: number): void => {
    const ni = idx + dir;
    if (ni >= 0 && ni < results.length) setIdx(ni);
  }, [idx, results.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [go]);

  // html 배경을 다크로 오버라이드 — 어떤 레이어가 화면을 덮지 못해도 흰색 노출 방지
  useEffect(() => {
    const el = document.documentElement;
    const prev = el.style.background;
    el.style.background = 'linear-gradient(160deg, #020c1e 0%, #071132 50%, #0d1e50 100%)';
    return () => { el.style.background = prev; };
  }, []);

  if (!applicationId) return null;

  const p = results[idx];
  const isFirst = idx === 0;
  const isLast = idx === results.length - 1;

  return (
    <MobileLayout className="!bg-transparent" outerClassName="bg-guest-dark">
      <div className="flex flex-col bg-guest-dark relative min-h-screen" style={{ minHeight: '100dvh' }}>
        {/* Orbs/Stars 장식: flex 레이아웃에 영향 없이 독립적으로 overflow-hidden 처리 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Orbs dark />
          <Stars />
        </div>

        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10 min-h-0">
        {/* Header */}
        <div
          className="sticky top-0 z-10 px-5 pb-4 border-b border-white/8"
          style={{ background: 'rgba(4,13,30,.88)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate(-1)}
                className="w-[34px] h-[34px] rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.15)' }}
                aria-label="뒤로 가기"
              >
                <ChevronLeft size={16} className="text-white/80" />
              </button>
              <div>
                <p className="font-bold text-base text-white">매칭 결과</p>
                {!isLoading && results.length > 0 && (
                  <p className="text-[11px] text-white/45 mt-0.5">
                    오늘의 인연 {results.length}명을 만났어요
                  </p>
                )}
              </div>
            </div>
            {results.length > 1 && (
              <div className="flex gap-1.5 items-center">
                {results.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdx(i)}
                    className="rounded-full transition-all duration-300 cursor-pointer"
                    style={{
                      width: i === idx ? 22 : 7,
                      height: 7,
                      background: i === idx ? '#fff' : 'rgba(255,255,255,.25)',
                    }}
                    aria-label={`${i + 1}번 카드`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
            <div className="w-full h-80 rounded-[20px] bg-white/10 animate-pulse" />
            <p className="text-white/40 text-sm animate-pulse">인연을 불러오는 중...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-5 text-center">
            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mb-4">
              <Heart size={32} className="text-white/30" />
            </div>
            <p className="text-white/60 font-semibold">아직 매칭 결과가 없어요</p>
            <p className="text-white/40 text-sm mt-1">조금만 기다려주세요</p>
          </div>
        ) : (
          <div
            className="flex-1 overflow-y-auto px-5 py-5"
            onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStart !== null) {
                const dx = e.changedTouches[0].clientX - touchStart;
                if (dx < -40) go(1);
                else if (dx > 40) go(-1);
                setTouchStart(null);
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                {/* Counter + MBTI */}
                <div className="flex items-center justify-between mb-5">
                  <span className="text-xs font-semibold text-white/40">
                    {idx + 1} / {results.length}
                  </span>
                  <span
                    className="px-3.5 py-1 rounded-full text-xs font-bold text-blue-300"
                    style={{ background: 'rgba(59,130,246,.22)', border: '1px solid rgba(59,130,246,.4)' }}
                  >
                    {p.mbti}
                  </span>
                </div>

                {/* Avatar */}
                <div className="flex flex-col items-center mb-6">
                  <div
                    className="w-[92px] h-[92px] rounded-[30px] flex items-center justify-center font-display text-[26px] text-slate-700 mb-3.5"
                    style={{
                      background: `linear-gradient(135deg, ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length][0]}, ${AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length][1]})`,
                      boxShadow: '0 16px 48px rgba(0,0,0,.35)',
                    }}
                  >
                    {p.nickname[0]}
                  </div>
                  <p className="font-display text-[26px] text-white mb-1">{p.nickname}</p>
                  <p className="text-[13px] text-white/50">
                    {p.gender === 'MALE' ? '남성' : '여성'}
                  </p>
                </div>

                {/* Self intro */}
                {p.selfIntroduction && (
                  <div
                    className="rounded-[20px] p-[18px_20px] mb-3"
                    style={{ background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.1)' }}
                  >
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <div className="w-[22px] h-[22px] rounded-[7px] bg-blue-500/30 flex items-center justify-center">
                        <span className="text-xs">👋</span>
                      </div>
                      <span className="text-[11px] font-bold text-white/45 tracking-wide uppercase">자기소개</span>
                    </div>
                    <p className="text-[13.5px] text-white/82 leading-[1.78]">{p.selfIntroduction}</p>
                  </div>
                )}

                {/* Ideal type */}
                <div
                  className="rounded-[20px] p-[18px_20px] mb-4"
                  style={{ background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,.1)' }}
                >
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <div className="w-[22px] h-[22px] rounded-[7px] bg-pink-500/30 flex items-center justify-center">
                      <span className="text-xs">💝</span>
                    </div>
                    <span className="text-[11px] font-bold text-white/45 tracking-wide uppercase">이상형 소개</span>
                  </div>
                  {p.idealDescription ? (
                    <p className="text-[13.5px] text-white/82 leading-[1.78] mb-3.5">{p.idealDescription}</p>
                  ) : (
                    <p className="text-[13px] text-white/30 italic mb-3.5">작성된 내용이 없어요</p>
                  )}
                  {(p.personalityTag || p.faceTypeTag || p.datingStyleTag) && (
                    <div className="flex flex-wrap gap-1.5">
                      {p.personalityTag && (
                        <span
                          className="px-3 py-1 rounded-full text-[11.5px] font-semibold text-white/75"
                          style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)' }}
                        >
                          {PERSONALITY_TAG_LABELS[p.personalityTag] ?? p.personalityTag}
                        </span>
                      )}
                      {p.faceTypeTag && (
                        <span
                          className="px-3 py-1 rounded-full text-[11.5px] font-semibold text-white/75"
                          style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)' }}
                        >
                          {FACE_TYPE_TAG_LABELS[p.faceTypeTag] ?? p.faceTypeTag}
                        </span>
                      )}
                      {p.datingStyleTag && (
                        <span
                          className="px-3 py-1 rounded-full text-[11.5px] font-semibold text-white/75"
                          style={{ background: 'rgba(255,255,255,.1)', border: '1px solid rgba(255,255,255,.18)' }}
                        >
                          {DATING_STYLE_TAG_LABELS[p.datingStyleTag] ?? p.datingStyleTag}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Instagram CTA */}
                {p.instagramId && VALID_INSTAGRAM_ID.test(p.instagramId) && (
                  <a
                    href={`https://instagram.com/${p.instagramId}`}
                    rel="noopener noreferrer"
                    className="w-full py-[15px] rounded-[18px] text-white text-[15px] font-bold flex items-center justify-center gap-2 relative overflow-hidden mb-3"
                    style={{
                      background: 'linear-gradient(135deg, #ec4899, #f43f5e)',
                      boxShadow: '0 8px 32px rgba(236,72,153,.35)',
                    }}
                  >
                    <div
                      className="absolute top-0 bottom-0 w-[40%]"
                      style={{
                        left: '-60%',
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)',
                        animation: 'sheen 2.8s ease-in-out infinite',
                      }}
                    />
                    <Instagram size={17} />
                    @{p.instagramId}
                  </a>
                )}

                {/* Prev/Next */}
                {results.length > 1 && (
                  <div className="flex gap-2.5 mt-1">
                    <button
                      onClick={() => go(-1)}
                      className="flex-1 py-3 rounded-[14px] border border-white/13 bg-transparent text-[13px] font-semibold transition-all"
                      style={{ color: isFirst ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.65)' }}
                      disabled={isFirst}
                    >
                      ← 이전
                    </button>
                    <button
                      onClick={() => go(1)}
                      className="flex-1 py-3 rounded-[14px] border border-white/13 bg-transparent text-[13px] font-semibold transition-all"
                      style={{ color: isLast ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.65)' }}
                      disabled={isLast}
                    >
                      다음 →
                    </button>
                  </div>
                )}

                {/* Report */}
                <button
                  onClick={() => setReportTarget(results[idx])}
                  className="mt-4 flex items-center gap-1 text-[11px] text-white/25 hover:text-rose-400 transition-colors mx-auto"
                >
                  <Flag size={11} />
                  신고하기
                </button>
              </motion.div>
            </AnimatePresence>
          </div>
        )}
        </div>
      </div>

      <AnimatePresence>
        {reportTarget && (
          <ReportModal
            target={reportTarget}
            onClose={() => setReportTarget(null)}
            onSuccess={() => setReportTarget(null)}
          />
        )}
      </AnimatePresence>
    </MobileLayout>
  );
};

interface ReportModalProps {
  target: MatchingResultDetailItem;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportModal: React.FC<ReportModalProps> = ({ target, onClose, onSuccess }) => {
  const { toast } = useToast();
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (): void => {
    if (!reason || !description.trim()) return;
    setIsSubmitting(true);
    createReport({ matchingResultId: target.id, reason, description })
      .then(() => {
        toast('신고가 접수되었습니다', 'success');
        onSuccess();
      })
      .catch((err: unknown) => {
        toast(getApiErrorMessage(err), 'error');
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[60]"
        onClick={() => !isSubmitting && onClose()}
      />
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 32 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[70] bg-white rounded-t-3xl w-full max-w-[430px] max-h-[80vh] overflow-y-auto"
      >
        <div className="p-6">
          <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5" />
          <h3 className="text-lg font-bold text-slate-900 mb-0.5">신고하기</h3>
          <p className="text-sm text-slate-400 mb-5">
            <span className="font-semibold text-slate-600">{target.nickname}</span>님을 신고합니다
          </p>
          <p className="text-xs font-bold text-slate-500 mb-2.5">신고 사유</p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {(Object.entries(REPORT_REASON_LABELS) as [ReportReason, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setReason(key)}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold text-left transition-all ${
                  reason === key
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs font-bold text-slate-500 mb-2">상세 설명 (필수)</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="신고 내용을 자세히 적어주세요"
            rows={3}
            className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-transparent resize-none transition-all mb-5"
          />
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={reason === null || !description.trim() || isSubmitting}
              className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 shadow-md shadow-rose-200/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '처리중...' : '신고 제출'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default MatchRequestDetailPage;
