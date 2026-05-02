import React, { useEffect } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Logo } from '@/components/ui/Logo';
import { Orbs } from '@/components/ui/Orbs';
import { Stars } from '@/components/ui/Stars';
import { useDisplayMode } from '@/store/displayModeStore';
import { Heart, Sparkles, MessageCircle, Clock } from 'lucide-react';
import { motion } from 'motion/react';

const INFO_BADGES = [
  { text: '21학번+', bg: 'rgba(99,102,241,.25)', color: '#a5b4fc', borderColor: 'rgba(99,102,241,.4)' },
  { text: '@sangmyung.kr', bg: 'rgba(59,130,246,.22)', color: '#93c5fd', borderColor: 'rgba(59,130,246,.4)' },
  { text: '무료', bg: 'rgba(34,197,94,.18)', color: '#86efac', borderColor: 'rgba(34,197,94,.3)' },
] as const;

const GuestMainPage: React.FC = () => {
  const { isPWA, isStandalone } = useDisplayMode();

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const prev = meta?.getAttribute('content') ?? '#edf3ff';
    meta?.setAttribute('content', '#020c1e');
    document.documentElement.style.background = '#020c1e';
    return () => {
      meta?.setAttribute('content', prev);
      document.documentElement.style.background = '';
    };
  }, []);

  return (
    <MobileLayout className="!bg-transparent" outerClassName="!bg-guest-dark">
      <div className="flex-1 flex flex-col bg-guest-dark relative overflow-hidden min-h-screen">
        <Orbs dark />
        <Stars />

        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
          {/* Header — PWA 전용 */}
          {isPWA && (
            <header className="relative z-10 px-5 pb-0 flex items-center gap-2.5"
              style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}>
              <Logo />
              <h1 className="font-display text-[26px] tracking-tight">
                <span className="text-blue-400">Rand</span><span className="text-pink-400">some</span>
              </h1>
              <span className="ml-auto text-[10px] font-bold text-white/40 px-3 py-1 border border-white/12 rounded-full">
                GUEST
              </span>
            </header>
          )}

          {/* Hero */}
          <motion.section
            className={`relative px-5 pb-4 ${isPWA ? 'pt-7' : 'pt-10'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600/22 border border-blue-600/45 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{ boxShadow: '0 0 7px #60a5fa' }} />
              <span className="text-[10.5px] font-bold text-blue-300 tracking-wide">
                2026 SMU FESTIVAL · COMING SOON
              </span>
            </div>

            <Logo hero />

            <h2 className="font-display text-[28px] sm:text-[34px] md:text-[38px] leading-[1.14] text-white mt-4 sm:mt-5 mb-3 sm:mb-3.5">
              축제의 설렘,<br />
              <span className="gt">새로운 인연을</span><br />
              지금 만나요
            </h2>
            <p className="text-[12px] sm:text-[13px] text-white/50 leading-[1.7]">
              복잡한 부스 없이, 온라인으로 간편하게.
            </p>
          </motion.section>

          {/* Info card */}
          <motion.div
            className="mx-4 sm:mx-5 mb-4 sm:mb-5 p-[16px_18px] sm:p-[18px_20px] rounded-[20px] border border-white/10"
            style={{ background: 'rgba(255,255,255,.07)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)' }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            <p className="font-bold text-sm text-white mb-1.5">상명대 학생만 가입할 수 있어요</p>
            <p className="text-[12.5px] text-white/50 leading-[1.65]">
              @sangmyung.kr 이메일로 인증하고, 21학번 이상이면 매칭에 참여할 수 있어요.
            </p>
            <div className="flex gap-1.5 mt-3 flex-wrap">
              {INFO_BADGES.map(({ text, bg, color, borderColor }) => (
                <span
                  key={text}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ background: bg, color, border: `1px solid ${borderColor}` }}
                >
                  {text}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            className={`px-4 sm:px-5 ${isPWA ? 'pb-28 sm:pb-32' : 'pb-6 sm:pb-8'}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
          >
            <div
              className="w-full py-[15px] rounded-[18px] flex items-center justify-center gap-2 border border-white/15"
              style={{ background: 'rgba(255,255,255,.06)' }}
            >
              <Clock size={16} className="text-white/40" />
              <span className="text-white/50 text-[15px] font-bold">서비스 준비 중이에요</span>
            </div>
            <div className="flex items-center justify-center mt-4">
              <a
                href="https://open.kakao.com/o/sRE2cosi"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 py-2 text-white/35 text-xs font-medium underline underline-offset-2 decoration-white/20"
              >
                <MessageCircle size={11} />
                카카오톡 문의
              </a>
            </div>
          </motion.div>
        </div>

        {/* Guest Bottom Nav (visual only) */}
        {isPWA && (
          <nav className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full glass-dark px-6 flex items-center justify-around z-50 ${isStandalone ? 'max-w-[430px]' : ''}`} style={{ height: 'calc(76px + env(safe-area-inset-bottom, 0px))', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="flex flex-col items-center gap-1">
              <Heart size={21} className="text-pink-500" fill="currentColor" />
              <span className="text-[10px] font-bold text-pink-500">홈</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-white/30">
              <Sparkles size={21} />
              <span className="text-[10px] font-medium">매칭</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-white/30">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" strokeLinecap="round" strokeLinejoin="round" /><polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              <span className="text-[10px] font-medium">신청내역</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-white/30">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="7" r="4" /></svg>
              <span className="text-[10px] font-medium">마이</span>
            </div>
          </nav>
        )}
      </div>
    </MobileLayout>
  );
};

export default GuestMainPage;
