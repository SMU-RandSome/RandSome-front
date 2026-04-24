import React, { useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Orbs } from '@/components/ui/Orbs';
import { useToast } from '@/components/ui/Toast';
import { useDisplayMode } from '@/store/displayModeStore';
import { useAuth } from '@/store/authStore';
import { useTicketBalance } from '@/hooks/useTicketBalance';
import { useApplyMatching } from '@/features/matching/hooks/useApplyMatching';
import { useRegisterCandidate } from '@/features/candidate/hooks/useRegisterCandidate';
import { PERSONALITY_TAGS, FACE_TYPE_TAGS, DATING_STYLE_TAGS } from '@/constants/tags';
import type { PersonalityTag, FaceTypeTag, DatingStyleTag, MatchingApplicationResponse } from '@/types';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Heart, Ticket, AlertTriangle, Minus, Plus, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type MatchView = 'main' | 'register' | 'result' | 'loading';
type MatchType = 'ideal' | 'random';

const labelCss: React.CSSProperties = { fontSize: '11px', color: '#94a3b8', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase' as const };

const TAG_SELECTED_PERSONALITY: React.CSSProperties = { background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff', boxShadow: '0 2px 10px rgba(37,99,235,.3)' };
const TAG_SELECTED_FACE: React.CSSProperties = { background: 'linear-gradient(135deg, #ec4899, #f43f5e)', color: '#fff', boxShadow: '0 2px 10px rgba(236,72,153,.3)' };
const TAG_SELECTED_DATING: React.CSSProperties = { background: 'linear-gradient(135deg, #7c3aed, #a855f7)', color: '#fff', boxShadow: '0 2px 10px rgba(124,58,237,.3)' };
const TAG_UNSELECTED: React.CSSProperties = { background: 'rgba(255,255,255,.82)', color: '#475569', border: '1px solid rgba(219,234,254,.9)' };

const MatchPage: React.FC = () => {
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [view, setView] = useState<MatchView>(() => searchParams.get('view') === 'register' ? 'register' : 'main');
  const [activeTab, setActiveTab] = useState<MatchType>('ideal');
  const [count, setCount] = useState(1);
  const [personalityTag, setPersonalityTag] = useState<PersonalityTag | ''>('');
  const [faceTypeTag, setFaceTypeTag] = useState<FaceTypeTag | ''>('');
  const [datingStyleTag, setDatingStyleTag] = useState<DatingStyleTag | ''>('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmMode, setConfirmMode] = useState<'register' | 'match' | null>(null);
  const { balance: ticketBalance } = useTicketBalance();
  const [matchResult, setMatchResult] = useState<MatchingApplicationResponse | null>(null);
  const applyMutation = useApplyMatching();
  const registerMutation = useRegisterCandidate();

  const isAlreadyCandidate = user?.candidateRegistrationStatus === 'PENDING' || user?.candidateRegistrationStatus === 'APPROVED';

  const currentBalance = activeTab === 'random' ? ticketBalance?.randomTicketCount ?? 0 : ticketBalance?.idealTicketCount ?? 0;

  const reset = useCallback((): void => {
    setView('main'); setActiveTab('ideal'); setCount(1);
    setPersonalityTag(''); setFaceTypeTag(''); setDatingStyleTag(''); setMatchResult(null);
  }, []);

  const submitting = applyMutation.isPending || registerMutation.isPending;

  const handleConfirm = (): void => {
    if (submitting) return;
    if (confirmMode === 'register') {
      registerMutation.mutate(undefined, {
        onSuccess: () => {
          setShowConfirm(false); setConfirmMode(null); reset();
        },
      });
    } else if (confirmMode === 'match') {
      setShowConfirm(false); setConfirmMode(null);
      setView('loading');
      applyMutation.mutate({
        matchingType: activeTab === 'random' ? 'RANDOM' : 'IDEAL',
        applicationCount: count,
        ...(activeTab === 'ideal' && personalityTag && { preferredPersonalityTag: personalityTag as PersonalityTag }),
        ...(activeTab === 'ideal' && faceTypeTag && { preferredFaceTypeTag: faceTypeTag as FaceTypeTag }),
        ...(activeTab === 'ideal' && datingStyleTag && { preferredDatingStyleTag: datingStyleTag as DatingStyleTag }),
      }, {
        onSuccess: (res) => {
          if (res.data) {
            setMatchResult(res.data); setView('result');
          } else { toast('매칭 신청이 완료되었습니다!', 'success'); reset(); }
        },
        onError: () => { setView('main'); },
      });
    }
  };

  /* ── Loading View ── */
  const renderLoading = (): React.ReactNode => (
    <div className="relative flex flex-col min-h-screen items-center justify-center bg-member">
      <Orbs />
      <div className="flex flex-col items-center text-center px-6 relative z-10">
        <div
          className="w-[84px] h-[84px] rounded-full flex items-center justify-center mb-6 animate-[pulse-heart_1.2s_ease-in-out_infinite]"
          style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', boxShadow: '0 0 48px rgba(236,72,153,.4)' }}
        >
          <Heart size={36} className="text-white fill-white" />
        </div>
        <h2 className="font-display text-[28px] text-slate-900 mb-2">매칭 중이에요</h2>
        <p className="text-sm text-slate-500 mb-5">인연을 찾고 있어요, 잠시만 기다려 주세요</p>
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-[dot-pulse_1.2s_ease-in-out_infinite]"
              style={{ background: '#f472b6', animationDelay: `${i * 0.25}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  /* ── Register View ── */
  const renderRegister = (): React.ReactNode => (
    <div className="relative flex flex-col min-h-screen bg-member">
      <Orbs />
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
      <MobileHeader title="후보 등록" onBack={reset} />
      <div className="flex-1 p-5 flex flex-col">
        <div className="flex-1">
          <div className="mb-6">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2" style={{ background: 'rgba(59,130,246,.1)', color: '#2563eb' }}>후보 등록</span>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">매력적인 프로필로<br /><span className="text-blue-600">인기를 얻어보세요!</span></h2>
          </div>
          <div className="rounded-3xl p-6 mb-6" style={{ background: 'rgba(255,255,255,.82)', border: '1px solid rgba(219,234,254,.9)' }}>
            <ul className="space-y-3">
              {['내 프로필이 전체 매칭 풀에 등록됩니다.', '다른 사람이 나를 지목하거나 랜덤 매칭될 수 있습니다.', '인기 멤버가 되어보세요!'].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-600"><span className="text-blue-500 mt-0.5 shrink-0">&#10003;</span><span>{item}</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-4" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)' }}>
          <AlertTriangle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs font-medium text-red-500">허위 프로필 작성 시 신고 및 서비스 이용 제한을 받을 수 있습니다.</p>
        </div>
        <div className="space-y-3" style={{ paddingBottom: isPWA ? 'calc(env(safe-area-inset-bottom, 0px) + 5.5rem)' : '1.5rem' }}>
          <button onClick={() => { setConfirmMode('register'); setShowConfirm(true); }} className="relative w-full h-14 rounded-2xl text-white text-lg font-bold overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>
            <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none"><span className="absolute top-0 h-full w-[55%] bg-gradient-to-r from-transparent via-white/25 to-transparent animate-sheen" /></span>
            <span className="relative">등록 신청하기</span>
          </button>
          <Button fullWidth variant="ghost" onClick={reset} className="text-slate-400 hover:text-slate-600">다음에 할게요</Button>
        </div>
      </div>
      </div>
    </div>
  );

  /* ── Result View ── */
  const renderResult = (): React.ReactNode => {
    if (!matchResult) return null;
    const { requestedCount, matchedCount, refundedTickets, isPartialMatch } = matchResult;
    const remainingBalance = activeTab === 'random' ? ticketBalance?.randomTicketCount ?? 0 : ticketBalance?.idealTicketCount ?? 0;
    const isNoMatch = matchedCount === 0;

    const iconBg = isNoMatch
      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
      : isPartialMatch
        ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
        : 'linear-gradient(135deg, #ec4899, #f43f5e)';
    const iconShadow = isNoMatch
      ? '0 0 40px rgba(239,68,68,.35)'
      : isPartialMatch
        ? '0 0 40px rgba(245,158,11,.35)'
        : '0 0 40px rgba(236,72,153,.35)';
    const title = isNoMatch ? '아무도 매칭되지 않았어요' : isPartialMatch ? '부분 매칭 완료!' : '매칭 완료!';

    return (
      <div className="relative flex flex-col min-h-screen items-center justify-center bg-member">
        <Orbs />
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center text-center px-6 w-full max-w-sm">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }} className="w-[84px] h-[84px] rounded-full flex items-center justify-center mb-6" style={{ background: iconBg, boxShadow: iconShadow }}>
            {isNoMatch ? <XCircle size={36} className="text-white" /> : isPartialMatch ? <AlertTriangle size={36} className="text-white" /> : <Heart size={36} className="text-white fill-white" />}
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="font-display text-[30px] text-slate-900 mb-2">{title}</motion.h2>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mb-6">
            {isNoMatch ? (
              <p className="text-sm text-slate-500">요청한 <span className="font-display text-[26px] text-slate-900 leading-none">{requestedCount}</span>명과 매칭할 후보가 없었어요.</p>
            ) : isPartialMatch ? (
              <p className="text-sm text-slate-500">요청 <span className="font-display text-[26px] text-slate-900 leading-none">{requestedCount}</span>명 중 <span className="font-display text-[26px] text-orange-600 leading-none">{matchedCount}</span>명만 매칭되었습니다.</p>
            ) : (
              <p className="text-sm text-slate-500"><span className="font-display text-[26px] text-slate-900 leading-none">{matchedCount}</span>명의 인연이 매칭되었어요!</p>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="w-full rounded-2xl p-4 mb-8 flex items-center justify-center gap-2 text-sm font-semibold" style={{ background: 'rgba(255,255,255,.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(59,130,246,.1)', color: '#475569' }}>
            <Ticket size={16} className="text-blue-500" />
            {isNoMatch ? (
              <>티켓 <span className="font-display text-[18px] font-bold text-slate-700 leading-none">{refundedTickets}</span>장 전액 환불 · 남은 티켓 <span className="font-display text-[18px] font-bold text-slate-700 leading-none">{remainingBalance}</span>장</>
            ) : isPartialMatch ? (
              <>매칭되지 않은 <span className="font-display text-[18px] font-bold text-slate-700 leading-none">{refundedTickets}</span>장 환불 · 남은 티켓 <span className="font-display text-[18px] font-bold text-slate-700 leading-none">{remainingBalance}</span>장</>
            ) : (
              <>티켓 사용 완료 · 남은 티켓 <span className="font-display text-[18px] font-bold text-slate-700 leading-none">{remainingBalance}</span>장</>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }} className="w-full flex gap-3">
            <button onClick={() => { setMatchResult(null); reset(); }} className={`h-12 rounded-2xl text-sm font-bold ${isNoMatch ? 'flex-1' : 'flex-1'}`} style={{ background: 'rgba(255,255,255,.72)', border: '1px solid rgba(59,130,246,.15)', color: '#475569' }}>다시 신청</button>
            {!isNoMatch && (
              <button onClick={() => navigate('/requests/detail', { state: { applicationId: matchResult.matchingApplicationId } })} className="flex-1 h-12 rounded-2xl text-white text-sm font-bold" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}><span className="flex items-center justify-center gap-1.5"><Heart size={16} className="fill-white" /> 보러가기</span></button>
            )}
          </motion.div>
        </div>
        <div className="h-20" />
        </div>
        <BottomNav />
      </div>
    );
  };

  /* ── Ideal Content ── */
  const renderIdealContent = (): React.ReactNode => (
    <div className="space-y-6 pt-2">
      <div>
        <p className="mb-3" style={labelCss}>성격</p>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_TAGS.map(({ value, label }) => {
            const isSelected = personalityTag === value;
            return <button key={value} onClick={() => setPersonalityTag(personalityTag === value ? '' : value)} className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200" style={isSelected ? TAG_SELECTED_PERSONALITY : TAG_UNSELECTED}>{label}</button>;
          })}
        </div>
      </div>
      <div>
        <p className="mb-3" style={labelCss}>외모 스타일</p>
        <div className="flex flex-wrap gap-2">
          {FACE_TYPE_TAGS.map(({ value, label }) => {
            const isSelected = faceTypeTag === value;
            return <button key={value} onClick={() => setFaceTypeTag(faceTypeTag === value ? '' : value)} className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200" style={isSelected ? TAG_SELECTED_FACE : TAG_UNSELECTED}>{label}</button>;
          })}
        </div>
      </div>
      <div>
        <p className="mb-3" style={labelCss}>연애 스타일</p>
        <div className="flex flex-wrap gap-2">
          {DATING_STYLE_TAGS.map(({ value, label }) => {
            const isSelected = datingStyleTag === value;
            return <button key={value} onClick={() => setDatingStyleTag(datingStyleTag === value ? '' : value)} className="px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200" style={isSelected ? TAG_SELECTED_DATING : TAG_UNSELECTED}>{label}</button>;
          })}
        </div>
      </div>
      {!isAlreadyCandidate && (
        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,.72)', border: '1px solid rgba(59,130,246,.1)' }}>
          <div><p className="text-sm font-bold text-slate-700">후보로 등록하기</p><p className="text-xs text-slate-400 mt-0.5">다른 친구가 나를 찾을 수 있어요</p></div>
          <button onClick={() => setView('register')} className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600" style={{ background: 'rgba(59,130,246,.1)' }}>등록</button>
        </div>
      )}
    </div>
  );

  /* ── Random Content ── */
  const renderRandomContent = (): React.ReactNode => (
    <div className="flex flex-col items-center justify-center text-center pt-16 pb-8">
      <span className="text-[52px] mb-4">✨</span>
      <h3 className="font-display text-xl sm:text-2xl text-slate-900 mb-2">무작위로 인연을 만나요!</h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-[260px]">성별이 다른 후보자 중 랜덤으로<br />매칭해 드립니다. 운명에 맡겨보세요!</p>
      {!isAlreadyCandidate && (
        <div className="mt-8 w-full rounded-2xl p-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,.72)', border: '1px solid rgba(59,130,246,.1)' }}>
          <div className="text-left"><p className="text-sm font-bold text-slate-700">후보로 등록하기</p><p className="text-xs text-slate-400 mt-0.5">다른 친구가 나를 찾을 수 있어요</p></div>
          <button onClick={() => setView('register')} className="px-4 py-2 rounded-xl text-xs font-bold text-blue-600" style={{ background: 'rgba(59,130,246,.1)' }}>등록</button>
        </div>
      )}
    </div>
  );

  /* ── Main View ── */
  const renderMain = (): React.ReactNode => {
    const isInsufficient = ticketBalance !== null && currentBalance < count;
    return (
      <div className="relative flex flex-col min-h-screen bg-member">
        <Orbs />
        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <MobileHeader
          title="매칭 신청"
          onBack={() => navigate(-1)}
          right={
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.22)', color: '#2563eb' }}>
              <Ticket size={13} />티켓 <span className="font-display text-sm font-bold leading-none">{currentBalance}</span>장
            </div>
          }
        />

        {/* top: MobileHeader h-14(56px) / WebShell h-16(64px) */}
        <div className="sticky z-40 px-4 py-2.5" style={{ top: isPWA ? '56px' : '64px' }}>
          <div className="flex rounded-2xl p-[5px]" style={{ background: 'rgba(255,255,255,.6)' }}>
            {(['ideal', 'random'] as const).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button key={tab} onClick={() => setActiveTab(tab)} className="flex-1 py-2.5 rounded-[12px] text-sm font-bold transition-all duration-200" style={{ background: isActive ? (tab === 'ideal' ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'linear-gradient(135deg, #2563eb, #6366f1)') : 'transparent', color: isActive ? '#fff' : '#64748b' }}>
                  {tab === 'ideal' ? '이상형 매칭' : '무작위 매칭'}
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex-1 overflow-y-auto px-3.5 sm:px-4 pb-56 sm:pb-60">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, x: activeTab === 'ideal' ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: activeTab === 'ideal' ? 10 : -10 }} transition={{ duration: 0.2 }}>
              {activeTab === 'ideal' ? renderIdealContent() : renderRandomContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        </div>
        <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full ${isPWA ? 'max-w-[430px]' : 'max-w-2xl'} z-40 px-3.5 sm:px-4 pt-6`} style={{ paddingBottom: isPWA ? '84px' : '24px', background: 'linear-gradient(to top, rgba(237,243,255,1) 55%, rgba(237,243,255,0))' }}>
          <div className="flex items-center justify-between rounded-2xl px-4 py-3 mb-3" style={{ background: 'rgba(255,255,255,.82)', border: '1px solid rgba(219,234,254,.9)' }}>
            <span className="text-sm font-semibold text-slate-600">매칭 인원</span>
            <div className="flex items-center gap-4">
              <button onClick={() => setCount(Math.max(1, count - 1))} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors" style={{ background: 'rgba(255,255,255,.9)', border: '1px solid rgba(219,234,254,.9)' }} aria-label="인원 감소"><Minus size={14} /></button>
              <span className="font-display text-[26px] text-slate-900 leading-none text-center">{count}</span>
              <button onClick={() => setCount(Math.min(5, count + 1))} className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors" style={{ background: 'rgba(255,255,255,.9)', border: '1px solid rgba(219,234,254,.9)' }} aria-label="인원 증가"><Plus size={14} /></button>
            </div>
          </div>
          {isInsufficient && <div className="flex items-center gap-2 px-2 mb-2"><AlertTriangle size={13} className="text-red-400 shrink-0" /><p className="text-xs text-red-500 font-medium">티켓이 부족합니다.</p></div>}
          <button disabled={isInsufficient} onClick={() => { setConfirmMode('match'); setShowConfirm(true); }} className="relative w-full h-14 rounded-2xl text-white font-bold text-base overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>
            <span className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none"><span className="absolute top-0 h-full w-[55%] bg-gradient-to-r from-transparent via-white/25 to-transparent animate-sheen" /></span>
            <span className="relative flex items-center justify-center gap-2"><Heart size={18} className="fill-white" />매칭 신청하기 · 티켓 <span className="font-display text-[18px] font-bold leading-none">{count}</span>장</span>
          </button>
        </div>
        <BottomNav />
      </div>
    );
  };

  /* ── Confirm Modal ── */
  const confirmModal = (
    <AnimatePresence>
      {showConfirm && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[60]" onClick={() => setShowConfirm(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] rounded-3xl w-[calc(100%-2rem)] max-w-[380px] p-6" style={{ background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(24px)', border: '1px solid rgba(59,130,246,.1)' }}>
            <h3 className="text-xl font-bold text-slate-900 mb-2">{confirmMode === 'register' ? '후보 등록 신청' : '매칭 신청'}</h3>
            <p className="text-sm text-slate-600 mb-2">{confirmMode === 'register' ? '후보로 등록하시겠어요?' : `${count}명의 ${activeTab === 'random' ? '무작위' : '이상형'} 매칭을 신청하시겠어요?`}</p>
            {confirmMode === 'match' && <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5"><Ticket size={12} />{activeTab === 'random' ? '랜덤권' : '이상형권'} <span className="font-display text-sm font-bold text-slate-600 leading-none">{count}</span>장 차감</p>}
            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-3 rounded-2xl text-sm font-bold" style={{ background: 'rgba(255,255,255,.7)', border: '2px solid rgba(148,163,184,.2)', color: '#64748b' }}>취소</button>
              <button onClick={handleConfirm} disabled={submitting} className="flex-1 py-3 rounded-2xl text-white text-sm font-bold shadow-lg transition-all disabled:opacity-60" style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}>{submitting ? '처리 중...' : '확인'}</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (view === 'loading') return <MobileLayout>{renderLoading()}</MobileLayout>;
  if (view === 'result' && matchResult) return <MobileLayout>{renderResult()}{confirmModal}</MobileLayout>;
  if (view === 'register') return <MobileLayout>{renderRegister()}<BottomNav />{confirmModal}</MobileLayout>;
  return <MobileLayout>{renderMain()}{confirmModal}</MobileLayout>;
};

export default MatchPage;
