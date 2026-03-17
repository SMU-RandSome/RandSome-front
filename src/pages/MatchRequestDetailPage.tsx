import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { getMatchingResult } from '@/features/matching/api';
import type { MatchingResultDetailItem } from '@/types';
import { ArrowLeft, User, Heart, Instagram, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from 'motion/react';

const CLAMP_LIMIT = 80;

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

const MatchRequestDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isPWA } = useDisplayMode();
  const { applicationId } = (location.state as LocationState) ?? {};

  const [results, setResults] = useState<MatchingResultDetailItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!applicationId) {
      navigate('/requests', { replace: true });
      return;
    }
    getMatchingResult(applicationId)
      .then((res) => {
        if (res.data) setResults(res.data);
      })
      .catch(() => {
        navigate('/requests', { replace: true });
      })
      .finally(() => setIsLoading(false));
  }, [applicationId, navigate]);

  if (!applicationId) return null;

  return (
    <MobileLayout className="bg-slate-50">
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full"
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900">
            {isLoading ? '불러오는 중...' : `매칭 결과 (${results.length}명)`}
          </h1>
          <div className="w-10" />
        </header>
      )}

      {!isPWA && (
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-slate-900">
            {isLoading ? '불러오는 중...' : `매칭 결과 (${results.length}명)`}
          </h1>
        </div>
      )}

      <div className={`flex-1 overflow-y-auto p-5 space-y-8 ${isPWA ? 'pb-24' : 'pb-8'}`}>
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-48 border border-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          results.map((result, index) => (
            <ProfileCard key={result.id} result={result} index={index} />
          ))
        )}

        {!isLoading && (
          <div className="text-center text-xs text-slate-400 mt-8">
            상대방에게 불쾌감을 주는 언행은 제재 대상이 될 수 있습니다.
            <br />
            매너 있는 대화를 부탁드려요!
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

const VALID_INSTAGRAM_ID = /^[a-zA-Z0-9._]{1,30}$/;

const ProfileCard: React.FC<{ result: MatchingResultDetailItem; index: number }> = ({ result, index }) => {
  const isMale = result.gender === 'MALE';
  const instagramId = result.instagramId && VALID_INSTAGRAM_ID.test(result.instagramId)
    ? result.instagramId
    : null;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 260, damping: 22 }}
      className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden"
    >
      {/* 헤더 배너 */}
      <div
        className={`relative h-14 ${
          isMale
            ? 'bg-gradient-to-r from-blue-400 to-indigo-500'
            : 'bg-gradient-to-r from-pink-400 to-rose-500'
        }`}
      >
        <div
          className={`absolute -bottom-6 left-4 w-12 h-12 rounded-xl border-4 border-white shadow-md flex items-center justify-center text-lg font-bold text-white ${
            isMale ? 'bg-blue-500' : 'bg-pink-500'
          }`}
        >
          {result.nickname[0]}
        </div>
      </div>

      {/* 프로필 정보 */}
      <div className="pt-8 px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900">{result.nickname}</h2>
          <div className="flex items-center gap-1">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isMale ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'
              }`}
            >
              {isMale ? '남성' : '여성'}
            </span>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">
              {result.mbti}
            </span>
          </div>
        </div>

        {/* 인스타그램 */}
        {instagramId && (
          <a
            href={`https://instagram.com/${instagramId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 py-2 px-3 mb-3 bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-xl border border-pink-100 hover:shadow-sm transition-shadow"
          >
            <Instagram size={12} className="text-pink-500 shrink-0" />
            <span className="font-bold text-slate-800 text-xs">@{instagramId}</span>
          </a>
        )}

        <div className="space-y-2">
          {result.selfIntroduction && (
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-slate-400 mb-1 flex items-center gap-1">
                <User size={10} /> 자기 소개
              </p>
              <ClampedText text={result.selfIntroduction} />
            </div>
          )}

          {result.idealDescription && (
            <div className="bg-pink-50 rounded-xl p-3">
              <p className="text-[10px] font-bold text-pink-400 mb-1 flex items-center gap-1">
                <Heart size={10} fill="currentColor" /> 이상형
              </p>
              <ClampedText text={result.idealDescription} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MatchRequestDetailPage;
