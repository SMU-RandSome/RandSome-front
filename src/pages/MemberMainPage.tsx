import React, { useState, useMemo } from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { FeedCard } from '@/components/ui/FeedCard';
import { FeedSkeleton } from '@/components/ui/Skeleton';
import { OnboardingTour } from '@/components/ui/OnboardingTour';
import { useDisplayMode } from '@/store/displayModeStore';
import { useAuth } from '@/store/authStore';
import { useFeed } from '@/hooks/useFeed';
import { useDashboard } from '@/hooks/useDashboard';
import { Heart, Sparkles, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AnnouncementBanner } from '@/components/ui/AnnouncementBanner';
import { TiltCard } from '@/components/ui/TiltCard';

const MemberMainPage: React.FC = () => {
  const { isPWA } = useDisplayMode();
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { feed, isLoading } = useFeed();
  const { stats } = useDashboard();
  const { announcements } = useAnnouncements();

  const statsConfig = useMemo(() => [
    { label: '매칭 후보', value: stats?.candidateCount?.toLocaleString() ?? '-', unit: '명', gradient: 'from-slate-700 to-slate-900' },
    { label: '오늘의 매칭', value: stats?.todayMatchingCount?.toLocaleString() ?? '-', unit: '건', gradient: 'from-blue-500 to-indigo-600' },
    { label: '전체 매칭', value: stats?.totalMatchingCount?.toLocaleString() ?? '-', unit: '건', gradient: 'from-pink-500 to-rose-500' },
  ], [stats]);

  const feedContent = feed.length === 0 ? (
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
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, delay: i * 0.03 }}
        >
          <FeedCard item={item} />
        </motion.div>
      ))}
    </AnimatePresence>
  );

  // ── 웹 레이아웃 ────────────────────────────────────────────────────────────
  if (!isPWA) {
    return (
      <MobileLayout>
        <div>
          {/* 인사말 — stagger */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl text-slate-900 leading-tight">
              안녕하세요,<br /><span className="gradient-text">{user?.nickname}</span>님!
            </h1>
            <p className="text-slate-400 text-sm mt-3">오늘의 인연을 놓치지 마세요</p>
          </motion.div>

          {/* 통계 — glass */}
          <motion.div
            className="flex divide-x divide-slate-100/60 glass-subtle rounded-2xl border border-white/40 shadow-[0_2px_20px_rgba(0,0,0,0.04)] mb-8"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
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
            transition={{ duration: 0.5, delay: 0.1 }}
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
                <p className="font-display text-xl gradient-text">3,000원</p>
              </div>
            </TiltCard>
          </motion.div>

          {/* 공지사항 */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <AnnouncementBanner announcements={announcements} />
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
              ) : (
                feedContent
              )}
            </div>
          </motion.div>
        </div>
        {showOnboarding && user && (
          <OnboardingTour userId={user.id} onDone={() => setShowOnboarding(false)} />
        )}
      </MobileLayout>
    );
  }

  // ── PWA / 모바일 레이아웃 ────────────────────────────────────────────────
  return (
    <MobileLayout>
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
      </header>

      {/* 대시보드 */}
      <section className="relative px-5 pt-5 overflow-hidden">
        {/* 장식 오브 — transform 기반 float만 사용 (스크롤 성능 최적화) */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/8 to-indigo-500/5 rounded-full blur-2xl animate-float-slow pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-br from-pink-400/6 to-rose-500/4 rounded-full blur-xl animate-float pointer-events-none" />

        <motion.div
          className="mb-4 relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl text-slate-900 leading-tight">
            설레는 만남이
            <br />
            <span className="gradient-text">지금 기다리고 있어요!</span>
          </h2>
        </motion.div>

        {/* 통계 — glass */}
        <motion.div
          className="flex divide-x divide-slate-100/60 glass-subtle rounded-2xl border border-white/40 shadow-[0_2px_16px_rgba(0,0,0,0.03)] mb-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
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
      </section>

      {/* 공지사항 */}
      <div className="px-5 mb-3">
        <AnnouncementBanner announcements={announcements} />
      </div>

      {/* 피드 */}
      <section className="px-5 pb-24 flex-1 overflow-y-auto">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <h3 className="font-bold text-slate-900 text-sm">지금 일어나고 있어요</h3>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <>
              <FeedSkeleton />
              <FeedSkeleton />
              <FeedSkeleton />
            </>
          ) : (
            feedContent
          )}
        </div>
      </section>

      <BottomNav />
      {showOnboarding && user && (
        <OnboardingTour userId={user.id} onDone={() => setShowOnboarding(false)} />
      )}
    </MobileLayout>
  );
};

export default MemberMainPage;
