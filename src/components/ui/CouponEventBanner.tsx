import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Ticket, ChevronRight } from 'lucide-react';
import type { CouponEventPreviewItem, CouponEventType } from '@/types';

interface CouponEventBannerProps {
  events: CouponEventPreviewItem[];
}

const EVENT_TYPE_LABEL: Record<CouponEventType, string> = {
  HAPPY_HOUR: '해피아워',
  SECRET_CODE: '시크릿 코드',
};

const STATUS_STYLE: Record<string, { badge: string; bg: string; border: string }> = {
  ACTIVE: {
    badge: 'bg-violet-100 text-violet-700',
    bg: 'rgba(245,243,255,.92)',
    border: 'rgba(196,181,253,.5)',
  },
  DRAFT: {
    badge: 'bg-slate-100 text-slate-500',
    bg: 'rgba(248,250,252,.92)',
    border: 'rgba(203,213,225,.5)',
  },
};

const AUTO_SLIDE_MS = 3500;
const SWIPE_THRESHOLD = 50;

export const CouponEventBanner: React.FC<CouponEventBannerProps> = ({ events }) => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const isDragging = useRef(false);

  const goTo = useCallback((next: number): void => {
    setIndex((prev) => {
      setDirection(next > prev ? 1 : -1);
      return next;
    });
  }, []);

  const goPrev = useCallback((): void => {
    setIndex((prev) => {
      setDirection(-1);
      return (prev - 1 + events.length) % events.length;
    });
  }, [events.length]);

  const goNext = useCallback((): void => {
    setIndex((prev) => {
      setDirection(1);
      return (prev + 1) % events.length;
    });
  }, [events.length]);

  useEffect(() => {
    if (events.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setIndex((prev) => (prev + 1) % events.length);
    }, AUTO_SLIDE_MS);
    return () => clearInterval(timer);
  }, [events.length]);

  if (events.length === 0) return null;

  const event = events[index];
  const style = STATUS_STYLE[event.status] ?? STATUS_STYLE.DRAFT;

  return (
    <div className="mx-4 sm:mx-5 mt-2.5 mb-3">
      <motion.div
        className="relative overflow-hidden rounded-[18px] shadow-[0_2px_16px_rgba(0,0,0,0.06)]"
        style={{ background: style.bg, border: `1px solid ${style.border}`, backdropFilter: 'blur(20px) saturate(180%)' }}
        drag={events.length > 1 ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.15}
        onDragStart={() => { isDragging.current = true; }}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > SWIPE_THRESHOLD) {
            info.offset.x < 0 ? goNext() : goPrev();
          }
          setTimeout(() => { isDragging.current = false; }, 0);
        }}
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.button
            key={event.id}
            type="button"
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d * 40, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d * -40, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => { if (!isDragging.current) navigate(`/coupon-events/${event.id}`); }}
            className="w-full text-left flex items-center gap-3 px-4 py-3"
            aria-label={event.name}
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
            </div>
            <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded ${style.badge}`}>
              {event.status === 'ACTIVE' ? '진행중' : '시작 예정'}
            </span>
            <ChevronRight size={15} className="text-slate-400 shrink-0" />
          </motion.button>
        </AnimatePresence>

        {events.length > 1 && (
          <div className="flex justify-center gap-1 pb-2">
            {events.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`${i + 1}번째 이벤트`}
                className="transition-all duration-300"
                style={{
                  width: i === index ? 16 : 5,
                  height: 5,
                  borderRadius: 99,
                  background: i === index ? '#7c3aed' : 'rgba(148,163,184,.4)',
                }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
