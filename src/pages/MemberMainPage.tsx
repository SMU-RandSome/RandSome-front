import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { FeedCard } from '@/components/ui/FeedCard';
import { FeedSkeleton } from '@/components/ui/Skeleton';
import { Orbs } from '@/components/ui/Orbs';
import { OnboardingTour } from '@/components/ui/OnboardingTour';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { useFeed } from '@/hooks/useFeed';
import { useDashboard } from '@/hooks/useDashboard';
import { useTicketBalance } from '@/hooks/useTicketBalance';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { Heart, Sparkles, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { AnnouncementBanner } from '@/components/ui/AnnouncementBanner';

const MemberMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPWA } = useDisplayMode();
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { feed, isLoading } = useFeed();
  const { stats } = useDashboard();
  const { balance: ticketBalance } = useTicketBalance();
  const { announcements } = useAnnouncements();

  const totalTickets = (ticketBalance?.randomTicketCount ?? 0) + (ticketBalance?.idealTicketCount ?? 0);

  const statsConfig = useMemo(() => [
    { label: '매칭 후보', value: stats?.candidateCount?.toLocaleString() ?? '-', unit: '명', cls: 'gt' },
    { label: '오늘의 매칭', value: stats?.todayMatchingCount?.toLocaleString() ?? '-', unit: '건', cls: 'gt' },
    { label: '전체 매칭', value: stats?.totalMatchingCount?.toLocaleString() ?? '-', unit: '건', cls: 'wt' },
  ], [stats]);

  const feedContent = useMemo(() => {
    if (feed.length === 0) {
      return (
        <div className="py-12 flex flex-col items-center gap-3 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Sparkles size={24} className="text-slate-300" />
          </div>
          <p className="text-sm font-medium">아직 매칭 소식이 없어요</p>
          <p className="text-xs">첫 번째 주인공이 되어보세요!</p>
        </div>
      );
    }
    return (
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
  }, [feed]);

  const content = (
    <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
      <Orbs />

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
      <MobileHeader
        brand
        right={
          <div
            className="w-9 h-9 rounded-[13px] flex items-center justify-center font-display text-[15px] text-slate-700"
            style={{ background: 'linear-gradient(135deg, #c7d2fe, #fbcfe8)' }}
          >
            {(user?.nickname ?? '?')[0]}
          </div>
        }
      />

      {/* Dashboard */}
      <section className="relative px-5 pt-5">
        <motion.div
          className="mb-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-[27px] leading-[1.2] text-slate-900">
            설레는 만남이<br />
            <span className="gt">지금 기다려요!</span>
          </h2>
          <p className="text-[12.5px] text-slate-500 mt-1.5">
            안녕하세요, {user?.nickname}님 · 오늘도 인연이 쌓이고 있어요
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="flex py-4 rounded-[20px] shadow-[0_2px_20px_rgba(0,0,0,0.06)] mb-5"
          style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,.65)' }}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
        >
          {statsConfig.map(({ label, value, unit, cls }, i) => (
            <div key={label} className="flex-1 text-center px-2" style={{ borderRight: i < 2 ? '1px solid rgba(226,232,240,.8)' : 'none' }}>
              <p className="font-display text-[26px] leading-none">
                <span className={cls}>{value}</span>
                <span className="text-[10px] font-normal text-slate-400 ml-0.5">{unit}</span>
              </p>
              <p className="text-[10.5px] text-slate-400 mt-1 font-medium">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* 공지사항 */}
      {announcements.length > 0 && (
        <div className="px-5 mb-3">
          <AnnouncementBanner announcements={announcements} />
        </div>
      )}

      {/* Match CTA — dark full-width tile */}
      <motion.div
        onClick={() => navigate('/match')}
        className="mx-5 mb-2.5 rounded-3xl p-[22px] cursor-pointer relative overflow-hidden"
        style={{
          background: '#0c1535',
          boxShadow: '0 8px 32px rgba(12,21,53,.4)',
          minHeight: 140,
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/30 to-pink-500/22 pointer-events-none" />
        <div className="absolute -right-6 -bottom-6 opacity-[0.08]">
          <Heart size={120} fill="currentColor" className="text-white" />
        </div>
        <div className="relative flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-pink-500/30 flex items-center justify-center">
                <Heart size={16} className="text-pink-400" fill="currentColor" />
              </div>
              <span className="text-[11px] font-bold text-white/50 tracking-wide">TODAY'S MATCH</span>
            </div>
            <p className="font-extrabold text-xl text-white mb-1">매칭 신청하기</p>
            <p className="text-[12.5px] text-white/50 leading-[1.5]">무작위 또는 이상형으로 인연을 찾아요</p>
          </div>
          <div className="text-right shrink-0">
            <p className="font-display text-[26px] text-white leading-none">{totalTickets}</p>
            <p className="text-[11px] text-white/45">남은 티켓</p>
          </div>
        </div>
      </motion.div>

      {/* Candidate Registration tile */}
      <motion.div
        onClick={() => navigate('/match?view=register')}
        className="mx-5 rounded-[20px] p-4 cursor-pointer flex items-center gap-3.5 shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
        style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,.65)' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-11 h-11 rounded-[15px] flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,.15), rgba(99,102,241,.15))' }}
        >
          <UserPlus size={20} className="text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-slate-900">후보 등록하기</p>
          <p className="text-xs text-slate-500 mt-0.5">프로필 등록하고 매칭 기회를 높여요</p>
        </div>
        <span className="font-display text-base gt">무료</span>
      </motion.div>

      {/* Feed */}
      <section className={`px-5 pt-5 flex-1 overflow-y-auto ${isPWA ? 'pb-24' : 'pb-8'}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-[7px] h-[7px] rounded-full bg-green-500 animate-pulse-dot" />
          <h3 className="text-[13px] font-bold text-slate-900">지금 일어나고 있어요</h3>
        </div>
        <div className="space-y-2.5">
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

      </div>

      <BottomNav />
      {showOnboarding && user && (
        <OnboardingTour userId={user.id} onDone={() => setShowOnboarding(false)} />
      )}
    </div>
  );

  return <MobileLayout className="!bg-transparent">{content}</MobileLayout>;
};

export default MemberMainPage;
