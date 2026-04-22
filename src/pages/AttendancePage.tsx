import React from 'react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { Orbs } from '@/components/ui/Orbs';
import { useDisplayMode } from '@/store/displayModeStore';
import { useAttendance } from '@/features/attendance/hooks/useAttendance';
import { useCheckAttendance } from '@/features/attendance/hooks/useCheckAttendance';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { CalendarCheck, Ticket, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const AttendancePage: React.FC = () => {
  const { isPWA } = useDisplayMode();
  const { attendance, isLoading } = useAttendance();
  const checkMutation = useCheckAttendance();

  const todayStr = new Date().toISOString().slice(0, 10);
  const isCheckedToday = attendance?.attendanceDates.some((d) => d.startsWith(todayStr)) ?? false;
  const isChecking = checkMutation.isPending;

  const handleCheckAttendance = (): void => {
    checkMutation.mutate();
  };

  // 이번 달 캘린더 계산
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells: (number | null)[] = [
    ...Array<null>(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const attendedDays = new Set(
    (attendance?.attendanceDates ?? []).map((d) => new Date(d).getDate())
  );

  return (
    <MobileLayout className="!bg-transparent">
      <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
      <Orbs />

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
      <MobileHeader title="출석 체크" />

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 relative z-10 ${isPWA ? 'pb-24' : 'pb-8'}`}>
        {/* 출석 현황 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-5 text-white shadow-lg shadow-blue-200/40"
          style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)' }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck size={20} />
            <span className="text-sm font-semibold opacity-90">이번 달 출석 현황</span>
          </div>

          {isLoading ? (
            <div className="h-12 bg-white/20 rounded-xl animate-pulse" />
          ) : (
            <div className="flex items-end gap-2">
              <span className="text-5xl font-black">{attendance?.attendedDays ?? 0}</span>
              <span className="text-lg font-medium opacity-70 mb-1.5">
                / {attendance?.totalDays ?? 0}일
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center gap-1.5 bg-white/20 rounded-xl px-3 py-2">
            <Ticket size={14} />
            <span className="text-xs font-medium">출석 1회당 랜덤권 1장 지급</span>
          </div>
        </motion.div>

        {/* 캘린더 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl p-5"
          style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,.65)' }}
        >
          <p className="text-sm font-bold text-slate-700 mb-3 text-center">
            {year}년 {month + 1}월
          </p>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[11px] font-semibold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* 날짜 셀 */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }
              const isToday = day === now.getDate();
              const isAttended = attendedDays.has(day);
              return (
                <div key={day} className="flex items-center justify-center aspect-square">
                  <div
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-[13px] font-semibold transition-colors ${
                      isAttended
                        ? 'text-white shadow-sm shadow-blue-200/50'
                        : isToday
                        ? 'border-2 border-blue-400 text-blue-600'
                        : 'text-slate-600'
                    }`}
                    style={isAttended ? { background: 'linear-gradient(135deg, #2563eb, #6366f1)' } : undefined}
                  >
                    {isAttended ? <CheckCircle2 size={15} strokeWidth={2.5} /> : day}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* 출석 체크 버튼 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        >
          <button
            onClick={handleCheckAttendance}
            disabled={isCheckedToday || isChecking || isLoading}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all duration-200 ${
              isCheckedToday
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'text-white shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60 active:opacity-80'
            }`}
            style={!isCheckedToday ? { background: 'linear-gradient(135deg, #2563eb, #6366f1)' } : undefined}
          >
            {isChecking ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                처리중...
              </span>
            ) : isCheckedToday ? (
              <span className="flex items-center justify-center gap-2">
                <CheckCircle2 size={18} />
                오늘 출석 완료
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <CalendarCheck size={18} />
                출석 체크하기
              </span>
            )}
          </button>

          {isCheckedToday && (
            <p className="text-center text-xs text-slate-400 mt-2">
              내일 다시 출석할 수 있습니다
            </p>
          )}
        </motion.div>
      </div>
      </div>
      <BottomNav />
      </div>
    </MobileLayout>
  );
};

export default AttendancePage;
