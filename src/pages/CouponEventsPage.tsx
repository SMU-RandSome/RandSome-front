import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { useCouponEvents } from '@/features/coupon/hooks/useCouponEvents';
import { ChevronLeft, ChevronRight, Ticket } from 'lucide-react';
import type { CouponEventType } from '@/types';

const EVENT_TYPE_LABEL: Record<CouponEventType, string> = {
  HAPPY_HOUR: '해피아워',
  SECRET_CODE: '시크릿 코드',
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  ACTIVE: { label: '진행중', cls: 'bg-green-100 text-green-700' },
  DRAFT: { label: '시작 예정', cls: 'bg-slate-100 text-slate-500' },
  SOLD_OUT: { label: '매진', cls: 'bg-orange-100 text-orange-600' },
  ENDED: { label: '종료', cls: 'bg-red-50 text-red-400' },
};

const STATUS_ORDER: Record<string, number> = { ACTIVE: 0, DRAFT: 1, SOLD_OUT: 2, ENDED: 3 };

const CouponEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const { events, isLoading } = useCouponEvents();

  const sorted = [...events].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

  return (
    <MobileLayout>
      <header className="sticky top-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={22} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1">쿠폰 이벤트</h1>
      </header>

      <div className={`flex-1 overflow-y-auto p-4 ${isPWA ? 'pb-8' : 'pb-6'}`}>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-[72px] rounded-[20px] bg-white/80 animate-shimmer-gradient" />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Ticket size={24} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium">진행 중인 쿠폰 이벤트가 없어요</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {sorted.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => navigate(`/coupon-events/${event.id}`)}
                className="w-full text-left flex items-center gap-3 rounded-[20px] px-4 py-3 shadow-[0_2px_16px_rgba(0,0,0,0.06)] cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,.82)',
                  backdropFilter: 'blur(20px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,.65)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-[12px] flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, rgba(124,58,237,.15), rgba(168,85,247,.15))' }}
                >
                  <Ticket size={17} className="text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-slate-900 truncate">{event.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {EVENT_TYPE_LABEL[event.eventType]} · {event.totalQuantity}매 한정
                  </p>
                  <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${STATUS_BADGE[event.status].cls}`}>
                    {STATUS_BADGE[event.status].label}
                  </span>
                </div>
                <ChevronRight size={16} className="text-slate-400 shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default CouponEventsPage;
