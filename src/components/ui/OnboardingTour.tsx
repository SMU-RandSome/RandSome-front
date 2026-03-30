import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface OnboardingStep {
  emoji: string;
  title: string;
  description: string;
  highlight: string;
}

const STEPS: OnboardingStep[] = [
  {
    emoji: '👋',
    title: '먼저 후보로 등록해보세요',
    description: '프로필을 등록하면 다른 회원의\n매칭 신청 대상이 될 수 있어요.',
    highlight: '홈 → 후보 등록하기 → 계좌 송금',
  },
  {
    emoji: '💘',
    title: '인연을 직접 찾아보세요',
    description: '무작위 또는 이상형 기반으로\n1~5명의 인연을 신청할 수 있어요.',
    highlight: '하단 탭 → 매칭 → 방식·인원 선택',
  },
  {
    emoji: '💌',
    title: '결과는 신청 내역에서 확인',
    description: '관리자 승인 후 매칭 결과가 열려요.\n상대방의 인스타그램으로 먼저 연락해보세요!',
    highlight: '하단 탭 → 신청내역 → 완료된 신청',
  },
];

interface OnboardingTourProps {
  userId: number;
  onDone: () => void;
}

const STORAGE_KEY_PREFIX = 'randsome_onboarding_';

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ userId, onDone }) => {
  const storageKey = `${STORAGE_KEY_PREFIX}${userId}`;
  const alreadySeen = localStorage.getItem(storageKey) === '1';

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  if (alreadySeen) return null;

  const step = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  const finish = (): void => {
    localStorage.setItem(storageKey, '1');
    onDone();
  };

  const handleNext = (): void => {
    if (isLastStep) {
      finish();
      return;
    }
    setDirection(1);
    setStepIndex((prev) => prev + 1);
  };

  const handleSkip = (): void => {
    finish();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
      <div className="w-full mx-6 max-w-[380px]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={stepIndex}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-white rounded-3xl p-7 shadow-2xl"
          >
            <div className="flex justify-center gap-2 mb-6">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`rounded-full transition-all duration-300 ${
                    i === stepIndex ? 'w-5 h-2 bg-blue-500' : 'w-2 h-2 bg-slate-200'
                  }`}
                />
              ))}
            </div>

            <div className="relative flex items-center justify-center mx-auto mb-5 w-20 h-20">
              <span className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-300/40 to-pink-300/40 animate-pulse-ring" />
              <div className="relative flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-pink-100 shadow-md">
                <span className="text-4xl">{step.emoji}</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 text-center mb-3">{step.title}</h2>

            <p className="text-sm text-slate-500 leading-relaxed whitespace-pre-line text-center mb-4">
              {step.description}
            </p>

            <div className="flex justify-center mb-6">
              <span className="inline-block bg-slate-100 text-slate-500 text-xs font-medium px-3 py-1.5 rounded-full">
                {step.highlight}
              </span>
            </div>

            {isLastStep ? (
              <button
                onClick={handleNext}
                className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-pink-500 active:opacity-90 transition-opacity"
              >
                시작하기
              </button>
            ) : (
              <>
                <button
                  onClick={handleNext}
                  className="w-full py-3.5 rounded-2xl text-sm font-bold text-white bg-blue-500 active:opacity-90 transition-opacity mb-3"
                >
                  다음
                </button>
                <div className="flex justify-center">
                  <button
                    onClick={handleSkip}
                    className="text-xs text-slate-400"
                  >
                    건너뛰기
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
