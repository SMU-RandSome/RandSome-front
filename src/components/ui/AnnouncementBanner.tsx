import React, { useState } from 'react';
import { ChevronRight, Megaphone, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Announcement } from '@/types';

interface AnnouncementBannerProps {
  announcements: Announcement[];
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  if (announcements.length === 0) return null;

  const first = announcements[0];
  const selected = announcements.find((a) => a.id === selectedId) ?? null;

  const handleOpen = (): void => {
    if (announcements.length === 1) setSelectedId(announcements[0].id);
    setIsOpen(true);
  };

  const handleClose = (): void => {
    setIsOpen(false);
    setSelectedId(null);
  };

  const modalHeader = (
    <div className="flex items-center justify-between">
      {selected ? (
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-1.5 text-sm font-semibold text-slate-900"
        >
          <ChevronRight size={16} className="rotate-180 text-slate-400" />
          목록으로
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <Megaphone size={16} className="text-amber-500" />
          <h3 className="text-lg font-bold text-slate-900">공지사항</h3>
          <span className="text-xs font-bold text-amber-500 bg-amber-100 px-2 py-0.5 rounded-full">
            {announcements.length}
          </span>
        </div>
      )}
      <button
        onClick={handleClose}
        className="p-2 -mr-2 text-slate-400 hover:text-slate-600"
        aria-label="닫기"
      >
        <X size={20} />
      </button>
    </div>
  );

  const modalContent = (
    <AnimatePresence mode="wait">
      {selected ? (
        <motion.div
          key="detail"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className="font-bold text-slate-900 text-base mb-1">{selected.title}</h4>
          <p className="text-[11px] text-slate-400 mb-3">
            {new Date(selected.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selected.content}</p>
        </motion.div>
      ) : (
        <motion.ul
          key="list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          className="space-y-1"
        >
          {announcements.map((notice, i) => (
            <li key={notice.id}>
              <button
                onClick={() => setSelectedId(notice.id)}
                className="w-full flex items-center gap-3 py-3.5 text-left group"
              >
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-[10px] font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-medium text-slate-800 truncate group-hover:text-slate-900">
                  {notice.title}
                </span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-400 shrink-0" />
              </button>
              {i < announcements.length - 1 && <div className="h-px bg-slate-100 ml-8" />}
            </li>
          ))}
        </motion.ul>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* 배너 */}
      <button
        onClick={handleOpen}
        className="w-full flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-left"
        aria-label="공지사항 보기"
      >
        <Megaphone size={14} className="text-amber-500 shrink-0" />
        <span className="flex-1 text-xs font-medium text-amber-800 truncate">{first.title}</span>
        {announcements.length > 1 && (
          <span className="shrink-0 text-[10px] font-bold text-amber-500 bg-amber-100 px-1.5 py-0.5 rounded-full">
            +{announcements.length - 1}
          </span>
        )}
        <ChevronRight size={14} className="text-amber-400 shrink-0" />
      </button>

      {/* 센터 모달 */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60]"
              onClick={handleClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
            >
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 max-h-[70vh] flex flex-col pointer-events-auto">
                <div className="px-6 pt-6 pb-4 shrink-0 border-b border-slate-100">
                  {modalHeader}
                </div>
                <div className="overflow-y-auto px-6 py-4">{modalContent}</div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
