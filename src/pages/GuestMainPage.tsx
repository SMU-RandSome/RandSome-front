import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import { FeedCard } from '@/components/ui/FeedCard';
import { FeedSkeleton } from '@/components/ui/Skeleton';
import { useDisplayMode } from '@/store/displayModeStore';
import { useFeed } from '@/hooks/useFeed';
import { useDashboard } from '@/hooks/useDashboard';
import { Heart, Sparkles, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AnnouncementBanner } from '@/components/ui/AnnouncementBanner';
import { TiltCard } from '@/components/ui/TiltCard';

const GuestMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const { feed, isLoading } = useFeed();
  const { stats } = useDashboard();
  const { announcements } = useAnnouncements();

  const statsConfig = useMemo(() => [
    { label: '등록 후보', value: stats?.candidateCount?.toLocaleString() ?? '-', unit: '명', gradient: 'from-slate-700 to-slate-900' },
    { label: '오늘의 매칭', value: stats?.todayMatchingCount?.toLocaleString() ?? '-', unit: '건', gradient: 'from-blue-500 to-indigo-600' },
    { label: '전체 매칭', value: stats?.totalMatchingCount?.toLocaleString() ?? '-', unit: '건', gradient: 'from-pink-500 to-rose-500' },
  ], [stats]);

  // ── 웹 레이아웃 ────────────────────────────────────────────────────────────
  if (!isPWA) {
    return (
      <MobileLayout className="bg-[#F8FAFF]">
        <div>
          {/* 인사말 — stagger 애니메이션 */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl text-slate-900 leading-tight">
              설레는 축제,<br />
              <span className="gradient-text">새로운 인연</span>을 만나보세요!
            </h1>
            <p className="text-slate-400 text-sm mt-3">복잡한 부스 방문 없이, 온라인으로 간편하게.</p>
          </motion.div>

          {/* 공지사항 */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <AnnouncementBanner announcements={announcements} />
          </motion.div>

          {/* 통계 — glass 효과 */}
          <motion.div
            className="flex divide-x divide-slate-100/60 glass-subtle rounded-2xl border border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {statsConfig.map(({ label, value, unit, gradient }) => (
              <div key={label} className="flex-1 py-5 text-center">
                <p className={`font-display text-3xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
                  {value}<span className="text-xs font-normal text-slate-400 ml-0.5">{unit}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </motion.div>

          {/* 위젯 카드 */}
          <motion.div
            className="grid grid-cols-2 gap-3 mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <TiltCard className="rounded-2xl">
              <div className="bg-slate-900 rounded-2xl p-5 text-white relative overflow-hidden h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 to-pink-600/20" />
                <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
                  <span className="absolute top-0 h-full w-[55%] bg-gradient-to-r from-transparent via-white/8 to-transparent animate-shimmer" />
                </div>
                <div className="absolute -right-3 -bottom-3 opacity-[0.07]">
                  <Heart size={80} fill="currentColor" />
                </div>
                <div className="relative">
                  <Heart size={18} className="text-pink-400 mb-3" fill="currentColor" />
                  <h3 className="font-bold text-sm mb-1">매칭 신청하기</h3>
                  <p className="text-slate-400 text-xs mb-3 leading-relaxed">무작위 또는 이상형으로 인연을 찾아요</p>
                  <p className="text-[10px] text-slate-500">무작위 1,000원/명</p>
                  <p className="text-[10px] text-slate-500">이상형 1,500원/명</p>
                </div>
              </div>
            </TiltCard>
            <TiltCard className="rounded-2xl">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 border border-slate-100/80 relative overflow-hidden h-full">
                <div className="absolute -right-3 -bottom-3 opacity-[0.05]">
                  <UserPlus size={80} />
                </div>
                <UserPlus size={18} className="text-blue-500 mb-3" />
                <h3 className="font-bold text-sm text-slate-900 mb-1">후보 등록하기</h3>
                <p className="text-slate-400 text-xs mb-3 leading-relaxed">프로필을 등록하고 매칭 기회를 높여요</p>
                <p className="font-display text-xl gradient-text">2,000원</p>
              </div>
            </TiltCard>
          </motion.div>

          {/* 피드 */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <h2 className="font-bold text-slate-900 text-sm">지금 일어나고 있어요</h2>
            </div>
            <div className="space-y-3">
              {isLoading ? (
                <>
                  <FeedSkeleton />
                  <FeedSkeleton />
                  <FeedSkeleton />
                </>
              ) : feed.length === 0 ? (
                <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Sparkles size={24} className="text-slate-300" />
                  </div>
                  <p className="text-sm font-medium">아직 매칭 소식이 없어요</p>
                  <p className="text-xs">첫 번째 주인공이 되어보세요!</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {feed.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -16, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: i * 0.03 }}
                    >
                      <FeedCard item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </div>
      </MobileLayout>
    );
  }

  // ── PWA / 모바일 레이아웃 ────────────────────────────────────────────────
  return (
    <MobileLayout className="bg-[#F8FAFF]">
      {/* Glass Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-300/30">
            <Heart size={18} fill="currentColor" />
          </div>
          <h1 className="font-display text-2xl tracking-tight">
            <span className="text-blue-600">Rand</span><span className="text-pink-500">some</span>
          </h1>
        </div>
        <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => navigate('/login')}>
          로그인
        </Button>
      </header>

      {/* Hero — animated morphing orbs */}
      <section className="relative px-5 pt-8 pb-7 overflow-hidden">
        {/* Morphing gradient orbs */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-gradient-to-br from-blue-400/15 to-indigo-500/10 rounded-full blur-3xl animate-morph pointer-events-none" />
        <div
          className="absolute bottom-0 left-0 w-36 h-36 bg-gradient-to-br from-pink-400/12 to-rose-500/8 rounded-full blur-3xl animate-morph pointer-events-none"
          style={{ animationDelay: '-3s' }}
        />
        <div
          className="absolute top-1/2 right-1/4 w-24 h-24 bg-gradient-to-br from-violet-400/10 to-purple-500/8 rounded-full blur-2xl animate-morph pointer-events-none"
          style={{ animationDelay: '-5s' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 text-blue-700 text-xs font-bold rounded-full mb-4 border border-blue-200/50 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            2026 상명대 축제
          </span>
          <h2 className="font-display text-[2.1rem] text-slate-900 leading-[1.15] mb-3">
            설레는 축제,
            <br />
            <span className="gradient-text">새로운 인연</span>을
            <br />
            만나보세요!
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            복잡한 부스 방문 없이, 온라인으로 간편하게.
            <br />
            지금 바로 매칭 후보로 등록하거나 이상형을 찾아보세요.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <Button fullWidth onClick={() => navigate('/signup')}>
            회원가입하고 시작하기
          </Button>
        </motion.div>
      </section>

      {/* 공지사항 */}
      <div className="px-5 mb-3">
        <AnnouncementBanner announcements={announcements} />
      </div>

      {/* 통계 미니 바 */}
      <motion.div
        className="mx-5 mb-4 flex divide-x divide-slate-100/60 glass-subtle rounded-2xl border border-white/40 shadow-[0_2px_16px_rgba(0,0,0,0.03)]"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {statsConfig.map(({ label, value, unit, gradient }) => (
          <div key={label} className="flex-1 py-4 text-center">
            <p className={`font-display text-2xl bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
              {value}<span className="text-[10px] font-normal text-slate-400 ml-0.5">{unit}</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{label}</p>
          </div>
        ))}
      </motion.div>

      {/* Live Feed */}
      <section className="px-5 pb-20 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            실시간 매칭 현황
          </h3>
          <span className="text-xs text-slate-400">실시간 업데이트 중</span>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <>
              <FeedSkeleton />
              <FeedSkeleton />
              <FeedSkeleton />
            </>
          ) : (
            <AnimatePresence initial={false}>
              {feed.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <FeedCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* Guest Bottom Nav (visual only) */}
      <nav className="fixed bottom-0 w-full max-w-[430px] glass border-t border-white/30 shadow-[0_-1px_3px_rgba(0,0,0,0.03)] h-16 px-6 flex items-center justify-between z-50">
        <div className="flex flex-col items-center gap-1 text-blue-600">
          <Sparkles size={24} fill="currentColor" />
          <span className="text-[10px] font-semibold">홈</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-300">
          <Heart size={24} />
          <span className="text-[10px] font-medium">매칭</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-300">
          <div className="w-6 h-6 rounded-sm bg-slate-200" />
          <span className="text-[10px] font-medium">내 신청</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-slate-300">
          <div className="w-6 h-6 rounded-full bg-slate-200" />
          <span className="text-[10px] font-medium">MY</span>
        </div>
      </nav>
    </MobileLayout>
  );
};

export default GuestMainPage;
