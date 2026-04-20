import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { useToast } from '@/components/ui/Toast';
import { getAttendance, checkAttendance } from '@/features/attendance/api';
import { getApiErrorMessage } from '@/lib/axios';
import type { AttendanceResponse } from '@/types';
import { ChevronLeft, CalendarCheck, Ticket, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const AttendancePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();
  const { toast } = useToast();
  const [attendance, setAttendance] = useState<AttendanceResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAttendance()
      .then((res) => {
        if (!cancelled) setAttendance(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const todayStr = new Date().toISOString().slice(0, 10);
  const isCheckedToday = attendance?.attendanceDates.some((d) => d.startsWith(todayStr)) ?? false;

  const handleCheckAttendance = (): void => {
    setIsChecking(true);
    checkAttendance()
      .then((res) => {
        setAttendance(res.data);
        toast('출석 완료! 티켓이 지급되었습니다 🎟️', 'success');
      })
      .catch((err: unknown) => {
        toast(getApiErrorMessage(err), 'error');
      })
      .finally(() => {
        setIsChecking(false);
      });
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
    <MobileLayout>
      <header className="sticky top-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 h-14 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="뒤로가기"
        >
          <ChevronLeft size={22} className="text-slate-700" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 flex-1">출석 체크</h1>
      </header>

      <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isPWA ? 'pb-8' : 'pb-6'}`}>
        {/* 출석 현황 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-200/40"
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
          className="bg-white/90 backdrop-blur-sm rounded-3xl p-5 border border-slate-100/80 shadow-[0_1px_12px_rgba(0,0,0,0.04)]"
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
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${
                      isAttended
                        ? 'bg-blue-500 text-white shadow-sm shadow-blue-200'
                        : isToday
                        ? 'ring-2 ring-blue-300 text-blue-600'
                        : 'text-slate-600'
                    }`}
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
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200/50 hover:shadow-blue-300/60 active:opacity-80'
            }`}
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
    </MobileLayout>
  );
};

export default AttendancePage;
