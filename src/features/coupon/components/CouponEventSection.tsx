import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Ticket, ChevronRight } from 'lucide-react';
import { useCouponEvents } from '../hooks/useCouponEvents';
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
const MAX_VISIBLE = 3;

export const CouponEventSection: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useCouponEvents();

  if (events.length === 0) return null;

  const sorted = [...events].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);
  const visible = sorted.slice(0, MAX_VISIBLE);
  const remaining = events.length - MAX_VISIBLE;

  return (
    <motion.div
      className="mt-2.5 mx-4 sm:mx-5"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Ticket size={13} className="text-violet-500" />
        <h3 className="text-[13px] font-bold text-slate-900">쿠폰 이벤트</h3>
      </div>
      <div className="flex flex-col gap-2">
        {visible.map((event) => (
          <button
            key={event.id}
            type="button"
            onClick={() => navigate(`/coupon-events/${event.id}`)}
            className="w-full text-left flex items-center gap-3 rounded-[20px] px-4 py-3 shadow-[0_2px_16px_rgba(0,0,0,0.06)] cursor-pointer"
            style={{
              background: 'rgba(255,255,255,.82)',
              backdropFilter: 'blur(20px) saturate(180%)', WebkitBackdropFilter: 'blur(20px) saturate(180%)',
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
        {remaining > 0 && (
          <button
            type="button"
            onClick={() => navigate('/coupon-events')}
            className="w-full py-2.5 text-center text-[12px] font-semibold text-violet-600 cursor-pointer"
          >
            + {remaining}개 더 보기 ›
          </button>
        )}
      </div>
    </motion.div>
  );
};
