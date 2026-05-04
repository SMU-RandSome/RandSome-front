import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { ArrowLeft, Globe, Smartphone, Bell } from 'lucide-react';
import { motion } from 'motion/react';

interface Step {
  title: string;
  desc: string;
  badge?: string;
  badgeIcon?: string;
}

const IOS_STEPS: Step[] = [
  {
    title: 'Safari로 사이트 접속 후 오른쪽 하단에 · · · 클릭',
    desc: 'Chrome이 아닌 Safari 브라우저를 이용해 주세요',
    badge: 'www.randsome.online',
    badgeIcon: 'globe',
  },
  {
    title: '하단 공유 버튼 탭',
    desc: '화면 하단 가운데 □↑ 공유 버튼을 눌러요',
    badge: '공유 버튼 (하단 중앙)',
    badgeIcon: 'share',
  },
  {
    title: '더보기 클릭 후 "홈 화면에 추가" 선택',
    desc: '스크롤을 내려 홈 화면에 추가를 탭해요',
    badge: '홈 화면에 추가',
    badgeIcon: 'grid',
  },
  {
    title: '추가 → 완료!',
    desc: '우측 상단 추가를 누르면 앱처럼 설치 완료',
  },
  {
    title: '앱 실행 후 알림 허용',
    desc: '홈 화면에서 Randsome을 열고 알림 허용을 눌러요. 마이페이지에서 알림 설정을 변경할 수 있어요.',
    badge: '알림 허용',
    badgeIcon: 'bell',
  },
];

const ANDROID_STEPS: Step[] = [
  {
    title: 'Chrome으로 사이트 접속',
    desc: 'Chrome 브라우저로 접속해 주세요',
    badge: 'www.randsome.online',
    badgeIcon: 'globe',
  },
  {
    title: '오른쪽 상단 ⋮ 메뉴 탭',
    desc: '브라우저 우측 상단 ⋮ 아이콘을 탭해요',
    badge: '⋮ 메뉴 (우측 상단)',
    badgeIcon: 'menu',
  },
  {
    title: '"앱 설치" 선택',
    desc: '"앱 설치" 또는 "홈 화면에 추가"를 탭해요',
    badge: '앱 설치',
    badgeIcon: 'grid',
  },
  {
    title: '설치 → 완료!',
    desc: '설치를 탭하면 앱처럼 설치 완료',
  },
  {
    title: '앱 실행 후 알림 허용',
    desc: '홈 화면에서 Randsome을 열고 알림 허용을 눌러요. 마이페이지에서 알림 설정을 변경할 수 있어요.',
    badge: '알림 허용',
    badgeIcon: 'bell',
  },
];

const BadgeIcon: React.FC<{ type?: string }> = ({ type }) => {
  if (type === 'globe') return <Globe size={12} className="text-slate-500 shrink-0" />;
  if (type === 'share') return <span className="text-[11px] text-slate-500 shrink-0">□↑</span>;
  if (type === 'grid') return <span className="text-[11px] text-slate-500 shrink-0">⊞</span>;
  if (type === 'menu') return <span className="text-[11px] text-slate-500 shrink-0">⋮</span>;
  if (type === 'bell') return <Bell size={12} className="text-slate-500 shrink-0" />;
  return null;
};

const PwaGuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const [tab, setTab] = useState<'ios' | 'android'>('ios');

  const steps = tab === 'ios' ? IOS_STEPS : ANDROID_STEPS;
  const isIos = tab === 'ios';

  return (
    <MobileLayout className="bg-white">
      <div
        className={isPWA ? 'px-5' : 'mx-auto max-w-2xl px-5 py-5'}
        style={isPWA ? { paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' } : undefined}
      >
        <div className="pb-12">
          {/* 뒤로가기 */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="뒤로 가기"
              className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all"
            >
              <ArrowLeft size={18} />
            </button>
          </motion.div>

          {/* 탭 */}
          <motion.div
            className="flex gap-2 mb-8 bg-slate-100 rounded-xl p-1"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
          >
            {(['ios', 'android'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'
                }`}
              >
                {t === 'ios' ? 'iPhone (iOS)' : 'Android'}
              </button>
            ))}
          </motion.div>

          {/* 플랫폼 뱃지 + 타이틀 */}
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 border border-slate-200 rounded-full text-[12px] text-slate-500 font-medium mb-3">
              <Smartphone size={12} />
              {isIos ? 'iPhone (iOS)' : 'Android'}
            </span>
            <h1 className="text-[32px] font-black text-slate-900 leading-tight">
              {isIos ? '아이폰 설치 방법' : '안드로이드 설치 방법'}
            </h1>
          </motion.div>

          {/* 스텝 타임라인 */}
          <motion.div
            key={`steps-${tab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {steps.map(({ title, desc, badge, badgeIcon }, i) => (
              <motion.div
                key={title}
                className="flex gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                {/* 왼쪽 라인 + 번호 */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                    <span className="text-white text-[13px] font-black">{i + 1}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-0.5 flex-1 bg-indigo-200 my-1 min-h-[24px]" />
                  )}
                </div>

                {/* 콘텐츠 */}
                <div className={`flex-1 min-w-0 ${i < steps.length - 1 ? 'pb-7' : ''}`}>
                  <p className="font-bold text-slate-900 text-[15px] leading-snug mb-1">{title}</p>
                  <p className="text-[13px] text-slate-500 leading-relaxed mb-2">{desc}</p>
                  {badge && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[12px] text-slate-600 font-medium">
                      <BadgeIcon type={badgeIcon} />
                      {badge}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default PwaGuidePage;
