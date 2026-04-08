import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { PaymentModal } from '@/components/ui/PaymentModal';
import { useToast } from '@/components/ui/Toast';
import { useDisplayMode } from '@/store/displayModeStore';
import { useAuth } from '@/store/authStore';
import { registerCandidate } from '@/features/candidate/api';
import { applyMatching } from '@/features/matching/api';
import { getApiErrorMessage } from '@/lib/axios';
import { Heart, UserPlus, ArrowRight, Check, Zap, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type MatchView = 'hub' | 'register' | 'find';
type MatchStep = 'select-type' | 'select-count';
type MatchType = 'random' | 'ideal';

const PRICE_PER_PERSON: Record<MatchType, number> = {
  random: 1000,
  ideal: 1500,
};

const MatchPage: React.FC = () => {
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();
  const { user } = useAuth();
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
  const [showPayment, setShowPayment] = useState(false);
  const [showRegisterPayment, setShowRegisterPayment] = useState(false);

  const reset = (): void => {
    setView('hub');
    setStep('select-type');
    setMatchType(null);
    setCount(1);
  };

  const handleRegisterConfirm = async (): Promise<void> => {
    try {
      await registerCandidate();
      toast('후보 등록 신청이 완료되었습니다! 관리자 승인을 기다려주세요.', 'success');
      setShowRegisterPayment(false);
      reset();
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    }
  };

  const handlePaymentConfirm = async (): Promise<void> => {
    if (!matchType) return;
    try {
      await applyMatching({
        matchingType: matchType === 'random' ? 'RANDOM' : 'IDEAL',
        applicationCount: count,
      });
      toast('매칭 신청이 완료되었습니다! 설레는 만남을 기다려주세요.', 'success');
      setShowPayment(false);
      reset();
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
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-xl">
              📢
            </div>
            <div>
              <p className="font-bold text-slate-900">등록비 2,000원</p>
              <p className="text-xs text-slate-500">축제 기간 동안 유지됩니다</p>
            </div>
          </div>
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
          onClick={() => setShowRegisterPayment(true)}
          className="rounded-2xl h-14 text-lg shadow-lg shadow-blue-500/20"
        >
          2,000원 결제하고 등록하기
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

      <PaymentModal
        isOpen={showRegisterPayment}
        onClose={() => setShowRegisterPayment(false)}
        onConfirm={handleRegisterConfirm}
        amount={2000}
      />
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
                <div className="text-right">
                  <span
                    className={`block font-bold ${type === 'random' ? 'text-blue-600' : 'text-pink-600'}`}
                  >
                    {PRICE_PER_PERSON[type].toLocaleString()}원/명
                  </span>
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
          onClick={() => setStep('select-count')}
        >
          다음으로
        </Button>
      </div>
    </div>
  );

  const renderFindStep2 = (): React.ReactNode => {
    if (!matchType) return null;
    const pricePerPerson = PRICE_PER_PERSON[matchType];
    const totalPrice = pricePerPerson * count;

    return (
      <div className="p-5 h-full flex flex-col bg-white">
        <div className="flex-1">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-2">
              Step 2
            </span>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">
              몇 명을
              <br />
              <span className="text-blue-500">소개받을까요?</span>
            </h2>
          </div>

          <div className="bg-slate-50 rounded-[2rem] p-8 mb-6 flex flex-col items-center justify-center">
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

            <div className="w-full h-px bg-slate-200 mb-6" />

            <div className="flex justify-between items-center w-full px-4">
              <span className="text-slate-500 font-medium">총 결제 금액</span>
              <span className="text-2xl font-bold text-blue-600">
                {totalPrice.toLocaleString()}원
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <Button
            variant="ghost"
            className="flex-1 h-14 rounded-2xl text-slate-500"
            onClick={() => setStep('select-type')}
          >
            이전
          </Button>
          <Button
            className="flex-[2] h-14 rounded-2xl text-lg shadow-lg shadow-blue-500/20 bg-blue-500 hover:bg-blue-600"
            onClick={() => setShowPayment(true)}
          >
            <Zap size={18} className="mr-2 fill-white" />
            결제하기
          </Button>
        </div>

        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          onConfirm={handlePaymentConfirm}
          amount={totalPrice}
        />
      </div>
    );
  };

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 h-14 flex items-center justify-center">
          <h1 className="text-lg font-bold text-slate-900">
            {view === 'hub' ? '매칭' : view === 'register' ? '후보 등록' : '매칭 찾기'}
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
            {view === 'find' && step === 'select-count' && renderFindStep2()}
          </motion.div>
        </AnimatePresence>
      </div>

      <BottomNav />
    </MobileLayout>
  );
};

export default MatchPage;
