import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useDisplayMode } from '@/store/displayModeStore';
import { useAuth } from '@/store/authStore';
import { registerCandidate } from '@/features/candidate/api';
import { applyMatching } from '@/features/matching/api';
import { getTicketBalance } from '@/features/ticket/api';
import { getApiErrorMessage } from '@/lib/axios';
import type { PersonalityTag, FaceTypeTag, DatingStyleTag, TicketBalanceResponse, MatchingApplicationResponse } from '@/types';
import { Heart, UserPlus, ArrowRight, Check, Sparkles, Ticket, Home, PartyPopper, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type MatchView = 'hub' | 'register' | 'find' | 'result';
type MatchStep = 'select-type' | 'select-count' | 'select-tags';
type MatchType = 'random' | 'ideal';

const MatchPage: React.FC = () => {
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAlreadyCandidate =
    user?.candidateRegistrationStatus === 'PENDING' ||
    user?.candidateRegistrationStatus === 'APPROVED';
  const [searchParams] = useSearchParams();

  const [view, setView] = useState<MatchView>(() => {
    const v = searchParams.get('view');
    if (v === 'register' || v === 'find') return v;
    return 'hub';
  });
  const [step, setStep] = useState<MatchStep>('select-type');
  const [matchType, setMatchType] = useState<MatchType | null>(null);
  const [count, setCount] = useState(1);
  const [personalityTag, setPersonalityTag] = useState<PersonalityTag | ''>('');
  const [faceTypeTag, setFaceTypeTag] = useState<FaceTypeTag | ''>('');
  const [datingStyleTag, setDatingStyleTag] = useState<DatingStyleTag | ''>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'register' | 'match' | null>(null);
  const [ticketBalance, setTicketBalance] = useState<TicketBalanceResponse | null>(null);
  const [matchResult, setMatchResult] = useState<MatchingApplicationResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTicketBalance()
      .then((res) => {
        if (cancelled) return;
        if (res.data) setTicketBalance(res.data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const reset = (): void => {
    setView('hub');
    setStep('select-type');
    setMatchType(null);
    setCount(1);
    setPersonalityTag('');
    setFaceTypeTag('');
    setDatingStyleTag('');
  };

  const handleConfirm = async (): Promise<void> => {
    try {
      if (confirmMode === 'register') {
        await registerCandidate();
        toast('후보 등록 신청이 완료되었습니다! 관리자 승인을 기다려주세요.', 'success');
        setShowConfirm(false);
        setConfirmMode(null);
        reset();
      } else if (confirmMode === 'match' && matchType) {
        const res = await applyMatching({
          matchingType: matchType === 'random' ? 'RANDOM' : 'IDEAL',
          applicationCount: count,
          ...(matchType === 'ideal' && personalityTag && {
            preferredPersonalityTag: personalityTag as PersonalityTag,
          }),
          ...(matchType === 'ideal' && faceTypeTag && {
            preferredFaceTypeTag: faceTypeTag as FaceTypeTag,
          }),
          ...(matchType === 'ideal' && datingStyleTag && {
            preferredDatingStyleTag: datingStyleTag as DatingStyleTag,
          }),
        });
        setShowConfirm(false);
        setConfirmMode(null);
        if (res.data) {
          setMatchResult(res.data);
          setView('result');
        } else {
          toast('매칭 신청이 완료되었습니다!', 'success');
          reset();
        }
      }
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    }
  };

  const renderHub = (): React.ReactNode => (
    <div className={`p-5 ${isPWA ? 'pb-32' : 'pb-8'}`}>
      <div className="py-2 mb-4">
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">
          새로운 인연,
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">
            여기서 시작해보세요.
          </span>
        </h2>
      </div>

      <div className="grid gap-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('find')}
          className="w-full relative overflow-hidden bg-slate-900 rounded-[2rem] p-6 text-left shadow-xl shadow-slate-200 group h-64 flex flex-col justify-between"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-pink-600/20 z-0" />
          <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-30 transition-opacity duration-500 transform group-hover:scale-110 group-hover:rotate-12">
            <Heart size={140} className="text-pink-500 fill-pink-500" />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium mb-3">
              <Sparkles size={12} className="text-yellow-300" />
              <span>인기 매칭</span>
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">운명의 상대 찾기</h3>
            <p className="text-white/60 text-sm font-medium">
              랜덤 또는 이상형 매칭으로
              <br />
              설레는 만남을 시작하세요.
            </p>
          </div>

          <div className="relative z-10 flex items-center justify-between w-full mt-auto">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-xs text-white"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] text-white font-bold">
                +99
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <ArrowRight size={20} />
            </div>
          </div>
        </motion.button>

        <motion.button
          whileTap={isAlreadyCandidate ? undefined : { scale: 0.98 }}
          onClick={isAlreadyCandidate ? undefined : () => setView('register')}
          disabled={isAlreadyCandidate}
          className={`w-full relative overflow-hidden rounded-[2rem] p-6 text-left shadow-lg border ${
            isAlreadyCandidate
              ? 'bg-slate-100 shadow-slate-50 border-slate-200 cursor-not-allowed'
              : 'bg-white shadow-slate-100 border-slate-100 group'
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${
                isAlreadyCandidate ? 'bg-slate-200 text-slate-400' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors'
              }`}>
                <UserPlus size={20} />
              </div>
              <h3 className={`text-lg font-bold ${isAlreadyCandidate ? 'text-slate-400' : 'text-slate-900'}`}>
                매칭 후보 등록하기
              </h3>
              <p className="text-slate-400 text-sm mt-1">
                {isAlreadyCandidate
                  ? user?.candidateRegistrationStatus === 'PENDING'
                    ? '후보 등록 승인 대기 중입니다.'
                    : '이미 후보로 등록되어 있습니다.'
                  : <>다른 친구들이 나를 찾을 수 있도록<br />후보 리스트에 등록해보세요!</>}
              </p>
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isAlreadyCandidate
                ? 'bg-slate-200 text-slate-300'
                : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors'
            }`}>
              <ArrowRight size={16} />
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );

  const renderRegister = (): React.ReactNode => (
    <div className="p-5 flex flex-col h-full bg-white">
      <div className="flex-1">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2">
            후보 등록
          </span>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">
            매력적인 프로필로
            <br />
            <span className="text-blue-600">인기를 얻어보세요!</span>
          </h2>
        </div>

        <div className="bg-slate-50 rounded-3xl p-6 mb-6">
          <ul className="space-y-3">
            {[
              '내 프로필이 전체 매칭 풀에 등록됩니다.',
              '다른 사람이 나를 지목하거나 랜덤 매칭될 수 있습니다.',
              '인기 멤버가 되어보세요!',
            ].map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                <Check size={16} className="text-blue-500 mt-0.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-3 pb-6">
        <Button
          fullWidth
          size="lg"
          onClick={() => {
            setConfirmMode('register');
            setShowConfirm(true);
          }}
          className="rounded-2xl h-14 text-lg shadow-lg shadow-blue-500/20"
        >
          등록 신청하기
        </Button>
        <Button
          fullWidth
          variant="ghost"
          onClick={reset}
          className="text-slate-400 hover:text-slate-600"
        >
          다음에 할게요
        </Button>
      </div>
    </div>
  );

  const renderFindStep1 = (): React.ReactNode => (
    <div className="p-5 h-full flex flex-col bg-white">
      <div className="flex-1">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold mb-2">
            Step 1
          </span>
          <h2 className="text-2xl font-bold text-slate-900 leading-tight">
            어떤 방식으로
            <br />
            <span className="text-pink-500">매칭할까요?</span>
          </h2>
        </div>

        <div className="space-y-4">
          {(['random', 'ideal'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setMatchType(type)}
              className={`w-full p-5 rounded-3xl border transition-all duration-300 relative overflow-hidden group ${
                matchType === type
                  ? type === 'random'
                    ? 'border-blue-500 bg-blue-50/50 shadow-lg shadow-blue-500/10'
                    : 'border-pink-500 bg-pink-50/50 shadow-lg shadow-pink-500/10'
                  : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-colors ${
                    matchType === type
                      ? type === 'random'
                        ? 'bg-blue-100'
                        : 'bg-pink-100'
                      : 'bg-slate-50 group-hover:bg-slate-100'
                  }`}
                >
                  {type === 'random' ? '🎲' : '💘'}
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-bold text-slate-900 text-lg">
                    {type === 'random' ? '무작위 매칭' : '이상형 매칭'}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {type === 'random' ? '운명에 맡겨보세요!' : '취향저격 상대를 찾아드려요'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3 pb-6">
        <Button variant="ghost" className="flex-1 h-14 rounded-2xl text-slate-500" onClick={reset}>
          취소
        </Button>
        <Button
          className="flex-[2] h-14 rounded-2xl text-lg shadow-lg shadow-slate-200"
          disabled={!matchType}
          onClick={() => setStep(matchType === 'ideal' ? 'select-tags' : 'select-count')}
        >
          다음으로
        </Button>
      </div>
    </div>
  );

  const renderFindStep2 = (): React.ReactNode => {
    if (!matchType) return null;
    const stepNum = matchType === 'ideal' ? 'Step 3' : 'Step 2';
    const currentBalance = matchType === 'random'
      ? ticketBalance?.randomTicketCount ?? 0
      : ticketBalance?.idealTicketCount ?? 0;
    const ticketLabel = matchType === 'random' ? '랜덤권' : '이상형권';
    const isInsufficient = currentBalance < count;

    return (
      <div className="p-5 h-full flex flex-col bg-white">
        <div className="flex-1">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2">
              {stepNum}
            </span>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              몇 명을
              <br />
              <span className="text-blue-500">소개받을까요?</span>
            </h2>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-8 mb-4 flex flex-col items-center justify-center">
            <div className="flex items-center gap-8 mb-8">
              <button
                onClick={() => setCount(Math.max(1, count - 1))}
                className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-105 transition-all text-2xl"
                aria-label="인원 감소"
              >
                -
              </button>
              <div className="text-center w-20">
                <span className="text-6xl font-bold text-slate-900 tracking-tighter">{count}</span>
                <span className="block text-slate-400 text-sm font-medium mt-1">명</span>
              </div>
              <button
                onClick={() => setCount(Math.min(5, count + 1))}
                className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:scale-105 transition-all text-2xl"
                aria-label="인원 증가"
              >
                +
              </button>
            </div>
          </div>

          {/* 티켓 잔고 안내 */}
          {ticketBalance && (
            <div className={`rounded-2xl p-4 mb-4 flex items-center justify-between ${
              isInsufficient
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-100'
            }`}>
              <div className="flex items-center gap-2">
                <Ticket size={16} className={isInsufficient ? 'text-red-500' : 'text-blue-500'} />
                <span className={`text-sm font-semibold ${isInsufficient ? 'text-red-700' : 'text-blue-700'}`}>
                  {ticketLabel} {currentBalance}장 보유
                </span>
              </div>
              <span className={`text-sm font-bold ${isInsufficient ? 'text-red-500' : 'text-slate-500'}`}>
                {count}장 필요
              </span>
            </div>
          )}
          {isInsufficient && ticketBalance && (
            <div className="flex items-center gap-2 px-1 mb-2">
              <AlertTriangle size={14} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-500 font-medium">티켓이 부족합니다. 출석 체크나 쿠폰으로 티켓을 획득해보세요!</p>
            </div>
          )}
        </div>

        <div className="flex gap-3 pb-6">
          <Button
            variant="ghost"
            className="flex-1 h-14 rounded-2xl text-slate-500"
            onClick={() => setStep(matchType === 'ideal' ? 'select-tags' : 'select-type')}
          >
            이전
          </Button>
          <Button
            className="flex-[2] h-14 rounded-2xl text-lg shadow-lg shadow-blue-500/20 bg-blue-500 hover:bg-blue-600"
            disabled={isInsufficient && !!ticketBalance}
            onClick={() => {
              setConfirmMode('match');
              setShowConfirm(true);
            }}
          >
            신청하기
          </Button>
        </div>
      </div>
    );
  };

  const renderFindStep3 = (): React.ReactNode => {
    if (!matchType || matchType !== 'ideal') return null;

    const PERSONALITY_TAGS = [
      { value: 'ACTIVE' as const, label: '활발한' },
      { value: 'QUIET' as const, label: '조용한' },
      { value: 'AFFECTIONATE' as const, label: '다정한' },
      { value: 'INDEPENDENT' as const, label: '독립적인' },
      { value: 'FUNNY' as const, label: '유머있는' },
      { value: 'SERIOUS' as const, label: '진지한' },
      { value: 'OPTIMISTIC' as const, label: '긍정적인' },
      { value: 'CAREFUL' as const, label: '신중한' },
    ];

    const FACE_TYPE_TAGS = [
      { value: 'PUPPY' as const, label: '강아지상' },
      { value: 'CAT' as const, label: '고양이상' },
      { value: 'BEAR' as const, label: '곰상' },
      { value: 'FOX' as const, label: '여우상' },
      { value: 'RABBIT' as const, label: '토끼상' },
      { value: 'PURE' as const, label: '청순한' },
      { value: 'CHIC' as const, label: '시크한' },
      { value: 'WARM' as const, label: '훈훈한' },
    ];

    const DATING_STYLE_TAGS = [
      { value: 'FREQUENT_CONTACT' as const, label: '자주 연락' },
      { value: 'MODERATE_CONTACT' as const, label: '적당한 연락' },
      { value: 'PLANNED_DATE' as const, label: '계획형 데이트' },
      { value: 'SPONTANEOUS_DATE' as const, label: '즉흥형 데이트' },
      { value: 'SKINSHIP_LOVER' as const, label: '스킨십 많은' },
      { value: 'RESPECTFUL_SPACE' as const, label: '각자 시간 존중' },
      { value: 'EXPRESSIVE' as const, label: '감정 표현 잘함' },
      { value: 'GROW_TOGETHER' as const, label: '함께 성장' },
    ];

    return (
      <div className="p-5 h-full flex flex-col bg-white overflow-y-auto">
        <div className="flex-1">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-bold mb-2">
              Step 2
            </span>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              선호 스타일을
              <br />
              <span className="text-pink-500">알려주세요!</span>
            </h2>
            <p className="text-sm text-slate-500 mt-2">이상형 매칭에 활용됩니다 (선택사항)</p>
          </div>

          <div className="space-y-6">
            {/* 성격 */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">성격</p>
              <div className="flex flex-wrap gap-1.5">
                {PERSONALITY_TAGS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPersonalityTag(personalityTag === value ? '' : value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      personalityTag === value
                        ? 'bg-blue-500 text-white'
                        : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 외모 */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">외모 스타일</p>
              <div className="flex flex-wrap gap-1.5">
                {FACE_TYPE_TAGS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFaceTypeTag(faceTypeTag === value ? '' : value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      faceTypeTag === value
                        ? 'bg-violet-500 text-white'
                        : 'bg-violet-50 text-violet-500 hover:bg-violet-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 연애 스타일 */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">연애 스타일</p>
              <div className="flex flex-wrap gap-1.5">
                {DATING_STYLE_TAGS.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDatingStyleTag(datingStyleTag === value ? '' : value)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      datingStyleTag === value
                        ? 'bg-pink-500 text-white'
                        : 'bg-pink-50 text-pink-500 hover:bg-pink-100'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-6 pt-4">
          <Button
            variant="ghost"
            className="flex-1 h-14 rounded-2xl text-slate-500"
            onClick={() => setStep('select-type')}
          >
            이전
          </Button>
          <Button
            className="flex-[2] h-14 rounded-2xl text-lg shadow-lg shadow-pink-500/20 bg-pink-500 hover:bg-pink-600"
            onClick={() => setStep('select-count')}
          >
            다음으로
          </Button>
        </div>
      </div>
    );
  };

  const renderResult = (): React.ReactNode => {
    if (!matchResult) return null;
    const { requestedCount, matchedCount, refundedTickets, isPartialMatch } = matchResult;

    return (
      <div className="p-5 h-full flex flex-col bg-white items-center justify-center text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="flex flex-col items-center"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
            isPartialMatch ? 'bg-orange-100' : 'bg-green-100'
          }`}>
            {isPartialMatch
              ? <AlertTriangle size={36} className="text-orange-500" />
              : <PartyPopper size={36} className="text-green-500" />
            }
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {isPartialMatch ? '부분 매칭 완료!' : `${matchedCount}명 매칭 완료!`}
          </h2>

          {isPartialMatch ? (
            <div className="space-y-2 mb-8">
              <p className="text-sm text-slate-600">
                요청 {requestedCount}명 중 <span className="font-bold text-orange-600">{matchedCount}명</span>만 매칭되었습니다.
              </p>
              <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                <Ticket size={12} />
                매칭되지 않은 {refundedTickets}장은 자동 환불되었습니다.
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 mb-8">
              설레는 인연이 기다리고 있어요!
            </p>
          )}

          <div className="w-full space-y-3">
            <Button
              fullWidth
              size="lg"
              className="rounded-2xl h-14 text-lg shadow-lg shadow-blue-500/20"
              onClick={() => navigate('/requests')}
            >
              매칭 결과 보기
            </Button>
            <Button
              fullWidth
              variant="ghost"
              className="text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2"
              onClick={() => {
                setMatchResult(null);
                reset();
              }}
            >
              <Home size={16} /> 홈으로
            </Button>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-bold text-slate-900">
            {view === 'hub' ? '매칭' : view === 'register' ? '후보 등록' : view === 'result' ? '매칭 결과' : '매칭 찾기'}
          </h1>
        </header>
      )}

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view + step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === 'hub' && renderHub()}
            {view === 'register' && renderRegister()}
            {view === 'find' && step === 'select-type' && renderFindStep1()}
            {view === 'find' && step === 'select-tags' && renderFindStep3()}
            {view === 'find' && step === 'select-count' && renderFindStep2()}
            {view === 'result' && renderResult()}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />

      {/* 확인 모달 */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60]"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-3xl w-[calc(100%-2rem)] max-w-[380px] p-6"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {confirmMode === 'register' ? '후보 등록 신청' : '매칭 신청'}
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                {confirmMode === 'register'
                  ? '후보로 등록하시겠어요?'
                  : `${count}명의 ${matchType === 'random' ? '무작위' : '이상형'} 매칭을 신청하시겠어요?`}
              </p>
              {confirmMode === 'match' && (
                <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
                  <Ticket size={12} />
                  {matchType === 'random' ? '랜덤권' : '이상형권'} {count}장 차감
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  취소
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  확인
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
};

export default MatchPage;
