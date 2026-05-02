import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { ArrowLeft, Share, MoreVertical, Plus, Download } from 'lucide-react';
import { motion } from 'motion/react';

const IOS_STEPS = [
  {
    icon: Share,
    title: '하단 공유 버튼 탭',
    desc: 'Safari 하단 가운데의 □↑ 아이콘을 탭해요.',
  },
  {
    icon: Plus,
    title: '홈 화면에 추가 선택',
    desc: '스크롤을 내려 "홈 화면에 추가"를 탭해요.',
  },
  {
    icon: Download,
    title: '추가 버튼 탭',
    desc: '우측 상단 "추가"를 탭하면 설치 완료예요.',
  },
];

const ANDROID_STEPS = [
  {
    icon: MoreVertical,
    title: '우측 상단 메뉴 탭',
    desc: 'Chrome 우측 상단의 ⋮ 아이콘을 탭해요.',
  },
  {
    icon: Download,
    title: '앱 설치 선택',
    desc: '"앱 설치" 또는 "홈 화면에 추가"를 탭해요.',
  },
  {
    icon: Plus,
    title: '설치 버튼 탭',
    desc: '"설치"를 탭하면 홈 화면에 추가돼요.',
  },
];

const PwaGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const [tab, setTab] = useState<'ios' | 'android'>('ios');

  const steps = tab === 'ios' ? IOS_STEPS : ANDROID_STEPS;

  return (
    <MobileLayout className="bg-[#F8FAFF]">
      <div
        className={isPWA ? 'px-5' : 'mx-auto max-w-2xl px-5 py-5'}
        style={isPWA ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' } : undefined}
      >
        <div className="pb-10">
          {/* 헤더 */}
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="뒤로 가기"
              className="w-9 h-9 rounded-xl bg-white/70 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-all"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="font-display text-2xl text-slate-900">앱 설치 방법</h1>
          </motion.div>

          {/* 설명 */}
          <motion.p
            className="text-sm text-slate-500 leading-relaxed mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
          >
            Randsome을 홈 화면에 추가하면 앱처럼 빠르게 실행할 수 있어요.
          </motion.p>

          {/* 탭 */}
          <motion.div
            className="flex gap-2 mb-6 bg-slate-100/80 rounded-xl p-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {(['ios', 'android'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-400'
                }`}
              >
                {t === 'ios' ? 'iPhone (Safari)' : 'Android (Chrome)'}
              </button>
            ))}
          </motion.div>

          {/* 스텝 */}
          <div className="space-y-3">
            {steps.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                className="flex items-start gap-4 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.07 }}
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full">
                      {i + 1}단계
                    </span>
                    <p className="font-bold text-slate-800 text-sm">{title}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 안내 */}
          <motion.div
            className="mt-6 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.38 }}
          >
            <p className="text-xs text-amber-700 leading-relaxed">
              {tab === 'ios'
                ? 'iPhone에서는 반드시 Safari 브라우저로 접속해야 설치할 수 있어요.'
                : 'Android에서는 Chrome 브라우저로 접속해야 설치할 수 있어요.'}
            </p>
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PwaGuidePage;
