import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import { FeedCard } from '@/components/ui/FeedCard';
import { FeedSkeleton } from '@/components/ui/Skeleton';
import { useDisplayMode } from '@/store/displayModeStore';
import { useFeed } from '@/hooks/useFeed';
import { Heart, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GuestMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const { feed, isLoading } = useFeed();

  // ── 웹 레이아웃 ────────────────────────────────────────────────────────────
  if (!isPWA) {
    return (
      <MobileLayout className="bg-slate-50">
        <div>
          {/* 인사말 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
              설레는 축제,{' '}
              <span className="text-blue-500">새로운 인연</span>을 만나보세요!
            </h1>
            <p className="text-slate-500 mt-1">복잡한 부스 방문 없이, 온라인으로 간편하게.</p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { label: '등록 후보', value: '142', unit: '명', color: 'text-slate-900' },
              { label: '오늘의 매칭', value: '58', unit: '건', color: 'text-blue-600' },
              { label: '전체 매칭', value: '1,204', unit: '건', color: 'text-pink-500' },
            ].map(({ label, value, unit, color }) => (
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
              <AnimatePresence initial={false}>
                {feed.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -16, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25 }}
                  >
                    <FeedCard item={item} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

        </div>
      </MobileLayout>
    );
  }

  // ── PWA / 모바일 레이아웃 ────────────────────────────────────────────────
  return (
    <MobileLayout className="bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-5 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Heart size={18} fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">
            <span className="text-blue-600">Rand</span><span className="text-pink-500">some</span>
          </h1>
        </div>
        <Button variant="ghost" size="sm" className="text-slate-500" onClick={() => navigate('/login')}>
          로그인
        </Button>
      </header>

      {/* Hero */}
      <section className="px-5 pt-8 pb-6 bg-white rounded-b-[2rem] shadow-sm mb-4">
        <div className="mb-6">
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-3">
            2026 상명대 축제
          </span>
          <h2 className="text-3xl font-bold text-slate-900 leading-tight mb-2">
            설레는 축제,
            <br />
            <span className="text-blue-500">새로운 인연</span>을
            <br />
            만나보세요!
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            복잡한 부스 방문 없이, 온라인으로 간편하게.
            <br />
            지금 바로 매칭 후보로 등록하거나 이상형을 찾아보세요.
          </p>
        </div>
        <Button fullWidth className="shadow-blue-200 shadow-lg" onClick={() => navigate('/signup')}>
          회원가입하고 시작하기
        </Button>
      </section>

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
          )}
        </div>
      </section>

      {/* Guest Bottom Nav (visual only) */}
      <nav className="fixed bottom-0 w-full max-w-[430px] bg-white border-t border-slate-100 h-16 px-6 flex items-center justify-between z-50">
        <div className="flex flex-col items-center gap-1 text-blue-600">
          <Sparkles size={24} fill="currentColor" />
          <span className="text-[10px] font-medium">홈</span>
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
