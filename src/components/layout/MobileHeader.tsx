import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Megaphone, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useDisplayMode } from '@/store/displayModeStore';
import { motion, AnimatePresence } from 'motion/react';
import type { Announcement } from '@/types';

interface MobileHeaderProps {
  /** 왼쪽 타이틀 텍스트. brand가 true이면 무시됨 */
  title?: string;
  /** true면 Logo + Randsome 브랜드로 표시 */
  brand?: boolean;
  /** 제공 시 왼쪽에 뒤로가기 버튼 표시 */
  onBack?: () => void;
  /** 우측 슬롯 */
  right?: React.ReactNode;
  /** 공지사항 목록. 있으면 헤더에 아이콘 노출 */
  announcements?: Announcement[];
}

const HEADER_STYLE: React.CSSProperties = {
  background: 'rgba(237,243,255,.9)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
};

export const MobileHeader: React.FC<MobileHeaderProps> = ({ title, brand, onBack, right, announcements }) => {
  const { isPWA } = useDisplayMode();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // 웹 모드: WebShell이 상단 네비게이션을 담당하므로 MobileHeader 숨김
  if (!isPWA) return null;

  const hasAnnouncements = (announcements?.length ?? 0) > 0;
  const selected = announcements?.find((a) => a.id === selectedId) ?? null;

  const handleOpen = (): void => {
    if (announcements?.length === 1) setSelectedId(announcements[0].id);
    setIsOpen(true);
  };

  const handleClose = (): void => {
    setIsOpen(false);
    setSelectedId(null);
  };

  return (
    <>
      <header
        className="sticky top-0 z-50 px-4 flex items-center gap-3 border-b border-blue-500/10"
        style={{ ...HEADER_STYLE, paddingTop: 'env(safe-area-inset-top, 0px)', minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}
      >
        {onBack && (
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,.7)', border: '1px solid rgba(59,130,246,.1)' }}
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
        )}

        <div className="flex-1 flex items-center gap-2.5 min-w-0">
          {brand ? (
            <>
              <Logo />
              <span className="font-display text-[22px] tracking-tight leading-none">
                <span className="text-blue-700">Rand</span>
                <span className="text-pink-500">some</span>
              </span>
            </>
          ) : (
            <h1 className="text-[17px] font-bold text-slate-900 truncate">{title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasAnnouncements && (
            <button
              onClick={handleOpen}
              className="relative w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(251,191,36,.15)', border: '1px solid rgba(251,191,36,.3)' }}
              aria-label="공지사항 보기"
            >
              <Megaphone size={16} className="text-amber-500" />
              {(announcements?.length ?? 0) > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-white text-[9px] font-bold flex items-center justify-center">
                  {announcements!.length}
                </span>
              )}
            </button>
          )}
          {right && right}
        </div>
      </header>

      {/* 공지사항 모달 */}
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
                          {announcements!.length}
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
                </div>
                <div className="overflow-y-auto px-6 py-4">
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
                        {announcements!.map((notice, i) => (
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
                            {i < announcements!.length - 1 && <div className="h-px bg-slate-100 ml-8" />}
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
