import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { FeedCard } from '@/components/ui/FeedCard';
import { FeedSkeleton } from '@/components/ui/Skeleton';
import { useDisplayMode } from '@/store/displayModeStore';
import { useAuth } from '@/store/authStore';
import { useFeed } from '@/hooks/useFeed';
import { useDashboard } from '@/hooks/useDashboard';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MemberMainPage: React.FC = () => {
  const { isPWA } = useDisplayMode();
  const { user } = useAuth();
  const { feed, isLoading } = useFeed();
  const { stats } = useDashboard();

  const statsConfig = [
    { label: '매칭 후보', value: stats?.candidateCount?.toLocaleString() ?? '-', unit: '명', color: 'text-slate-900' },
    { label: '오늘의 매칭', value: stats?.todayMatchingCount?.toLocaleString() ?? '-', unit: '건', color: 'text-blue-600' },
    { label: '전체 매칭', value: stats?.totalMatchingCount?.toLocaleString() ?? '-', unit: '건', color: 'text-pink-500' },
  ];

  const feedContent = feed.length === 0 ? (
    <div className="py-10 flex flex-col items-center gap-2 text-slate-400">
      <span className="text-3xl">💤</span>
      <p className="text-sm font-medium">아직 매칭 소식이 없어요</p>
      <p className="text-xs">첫 번째 주인공이 되어보세요!</p>
    </div>
  ) : (
    <AnimatePresence initial={false}>
      {feed.map((item) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
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
          {/* 인사말 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              안녕하세요, <span className="text-blue-600">{user?.nickname}</span>님!
            </h1>
            <p className="text-slate-500 mt-1">오늘의 인연을 놓치지 마세요</p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {statsConfig.map(({ label, value, unit, color }) => (
              <div
                key={label}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 text-center"
              >
                <p className="text-sm text-slate-500 font-medium mb-2">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>
                  {value}
                  <span className="text-base font-normal text-slate-400 ml-0.5">{unit}</span>
                </p>
              </div>
            ))}
          </div>

          {/* 위젯 카드 */}
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-1">매칭 후보 등록</h3>
              <p className="text-blue-100 text-sm mb-4">
                후보로 등록하면 더 많은 매칭 기회를!
              </p>
              <div className="text-2xl font-bold">3,000원</div>
              <p className="text-blue-200 text-xs mt-1">축제 기간 동안 유지</p>
            </div>

            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-1">매칭 신청하기</h3>
              <p className="text-pink-100 text-sm mb-4">무작위 또는 이상형 기반 매칭</p>
              <div className="text-sm text-pink-100">
                <p>무작위: 1,000원/명</p>
                <p>이상형: 1,500원/명</p>
              </div>
            </div>
          </div>

          {/* 피드 */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              실시간 매칭 현황
            </h2>
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
              feedContent
            )}
          </div>
        </div>
      </MobileLayout>
    );
  }

  // ── PWA / 모바일 레이아웃 ────────────────────────────────────────────────
  return (
    <MobileLayout>
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Heart size={18} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-blue-600">Rand</span><span className="text-pink-500">some</span>
          </h1>
        </div>
      </header>

      {/* 대시보드 통계 */}
      <section className="px-5 pt-6">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            설레는 만남이
            <br />
            <span className="text-blue-600">지금 기다리고 있어요!</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1">오늘의 인연을 놓치지 마세요</p>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-6">
          {statsConfig.map(({ label, value, unit, color }) => (
            <div
              key={label}
              className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center"
            >
              <span className="text-xs text-slate-500 font-medium mb-1">{label}</span>
              <span className={`text-xl font-bold ${color}`}>
                {value}
                <span className="text-xs font-normal text-slate-400 ml-0.5">{unit}</span>
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* 피드 */}
      <section className="px-5 pb-24 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
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
            feedContent
          )}
        </div>
      </section>

      <BottomNav />
    </MobileLayout>
  );
};

export default MemberMainPage;
