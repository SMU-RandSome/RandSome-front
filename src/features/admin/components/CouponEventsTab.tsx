import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/components/ui/Toast';
import {
  getAdminCouponEvents,
  createAdminCouponEvent,
  updateAdminCouponEvent,
  deleteAdminCouponEvent,
  activateAdminCouponEvent,
  deactivateAdminCouponEvent,
} from '@/features/admin/api';
import { getApiErrorMessage } from '@/lib/axios';
import type { CouponEventPreviewItem, CouponEventType, TicketType } from '@/types';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X, Zap, KeyRound } from 'lucide-react';

const ITEMS_PER_PAGE = 5;

const STATUS_CONFIG = {
  DRAFT: { label: '준비중', bg: 'bg-slate-100', text: 'text-slate-600' },
  ACTIVE: { label: '활성', bg: 'bg-green-100', text: 'text-green-700' },
  ENDED: { label: '종료', bg: 'bg-red-50', text: 'text-red-500' },
} as const;

const TYPE_LABEL: Record<CouponEventType, string> = {
  HAPPY_HOUR: '해피 아워',
  SECRET_CODE: '시크릿 코드',
};

const TICKET_LABEL: Record<TicketType, string> = {
  RANDOM: '랜덤권',
  IDEAL: '이상형권',
};

interface FormState {
  name: string;
  description: string;
  type: CouponEventType;
  rewardTicketType: TicketType;
  rewardAmount: number;
  startsAt: string;
  expiresAt: string;
  couponExpiresAt: string;
  secretCode: string;
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  type: 'HAPPY_HOUR',
  rewardTicketType: 'RANDOM',
  rewardAmount: 1,
  startsAt: '',
  expiresAt: '',
  couponExpiresAt: '',
  secretCode: '',
};

const toDateTimeLocal = (iso: string): string => {
  const d = new Date(iso);
  const pad = (n: number): string => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 text-slate-600 transition-colors hover:bg-slate-50"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-slate-600 px-2">
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 text-slate-600 transition-colors hover:bg-slate-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const CouponEventsTab: React.FC = () => {
  const { toast } = useToast();

  const [events, setEvents] = useState<CouponEventPreviewItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<CouponEventPreviewItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [toggling, setToggling] = useState<number | null>(null);

  const fetchEvents = useCallback((page: number): void => {
    setLoading(true);
    getAdminCouponEvents({ page: page - 1, size: ITEMS_PER_PAGE })
      .then((res) => {
        if (res.data) {
          setEvents(res.data.content);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch((err: unknown) => toast(getApiErrorMessage(err), 'error'))
      .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    fetchEvents(currentPage);
  }, [currentPage, fetchEvents]);

  // --- 폼 ---

  const openCreateForm = (): void => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditForm = (event: CouponEventPreviewItem): void => {
    setEditingId(event.id);
    setForm({
      name: event.name,
      description: event.description,
      type: event.type,
      rewardTicketType: event.rewardTicketType,
      rewardAmount: event.rewardAmount,
      startsAt: toDateTimeLocal(event.startsAt),
      expiresAt: toDateTimeLocal(event.expiresAt),
      couponExpiresAt: toDateTimeLocal(event.couponExpiresAt),
      secretCode: '',
    });
    setFormOpen(true);
  };

  const closeForm = (): void => {
    setFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]): void => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const isFormValid = (): boolean => {
    if (!form.name.trim() || !form.description.trim()) return false;
    if (!form.startsAt || !form.expiresAt || !form.couponExpiresAt) return false;
    if (form.rewardAmount < 1) return false;
    if (form.type === 'SECRET_CODE' && !form.secretCode.trim() && editingId === null) return false;
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!isFormValid()) return;
    setSubmitting(true);
    const body = {
      name: form.name.trim(),
      description: form.description.trim(),
      type: form.type,
      rewardTicketType: form.rewardTicketType,
      rewardAmount: form.rewardAmount,
      startsAt: new Date(form.startsAt).toISOString(),
      expiresAt: new Date(form.expiresAt).toISOString(),
      couponExpiresAt: new Date(form.couponExpiresAt).toISOString(),
      ...(form.type === 'SECRET_CODE' && form.secretCode.trim()
        ? { secretCode: form.secretCode.trim() }
        : {}),
    };
    try {
      if (editingId !== null) {
        await updateAdminCouponEvent(editingId, body);
        toast('쿠폰 이벤트가 수정되었습니다.', 'success');
      } else {
        await createAdminCouponEvent(body);
        toast('쿠폰 이벤트가 생성되었습니다.', 'success');
      }
      closeForm();
      fetchEvents(currentPage);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // --- 삭제 ---

  const handleDelete = async (): Promise<void> => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteAdminCouponEvent(deleteTarget.id);
      toast('쿠폰 이벤트가 삭제되었습니다.', 'success');
      setDeleteTarget(null);
      fetchEvents(currentPage);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setDeleting(false);
    }
  };

  // --- 활성화/비활성화 ---

  const handleToggleStatus = async (event: CouponEventPreviewItem): Promise<void> => {
    setToggling(event.id);
    try {
      if (event.status === 'DRAFT') {
        await activateAdminCouponEvent(event.id);
        toast('이벤트가 활성화되었습니다.', 'success');
      } else if (event.status === 'ACTIVE') {
        await deactivateAdminCouponEvent(event.id);
        toast('이벤트가 종료되었습니다.', 'success');
      }
      fetchEvents(currentPage);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="pt-4 space-y-4">
      {/* 생성 버튼 */}
      <motion.button
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        onClick={openCreateForm}
        className="w-full h-12 bg-slate-900 text-white rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
      >
        <Plus size={16} />
        새 쿠폰 이벤트
      </motion.button>

      {/* 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-slate-400 py-16"
        >
          등록된 쿠폰 이벤트가 없습니다.
        </motion.p>
      ) : (
        <>
          <div className="space-y-3">
            {events.map((event, i) => {
              const status = STATUS_CONFIG[event.status];
              const isToggling = toggling === event.id;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: i * 0.06 }}
                  className="bg-white border border-slate-100 rounded-2xl p-4"
                >
                  {/* 헤더 */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">{event.name}</p>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${status.bg} ${status.text}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {event.type === 'HAPPY_HOUR' ? (
                          <Zap size={10} className="text-amber-500" />
                        ) : (
                          <KeyRound size={10} className="text-purple-500" />
                        )}
                        <span className="text-[11px] text-slate-400">{TYPE_LABEL[event.type]}</span>
                      </div>
                    </div>
                  </div>

                  {/* 보상 정보 */}
                  <div className="bg-slate-50 rounded-xl p-3 mb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">보상</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {TICKET_LABEL[event.rewardTicketType]} {event.rewardAmount}장
                      </span>
                    </div>
                  </div>

                  {/* 기간 */}
                  <div className="space-y-1 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">이벤트 기간</span>
                      <span className="text-slate-600">
                        {formatDate(event.startsAt)} ~ {formatDate(event.expiresAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">쿠폰 만료</span>
                      <span className="text-slate-600">{formatDate(event.couponExpiresAt)}</span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    {event.status !== 'ENDED' && (
                      <button
                        onClick={() => handleToggleStatus(event)}
                        disabled={isToggling}
                        className={`flex-1 h-9 rounded-xl text-xs font-semibold transition-colors ${
                          event.status === 'DRAFT'
                            ? 'bg-green-50 border border-green-200 text-green-700 hover:bg-green-100'
                            : 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100'
                        } disabled:opacity-40`}
                      >
                        {isToggling
                          ? '처리 중...'
                          : event.status === 'DRAFT'
                          ? '활성화'
                          : '종료하기'}
                      </button>
                    )}
                    <button
                      onClick={() => openEditForm(event)}
                      className="h-9 px-3 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
                      aria-label="수정"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(event)}
                      className="h-9 px-3 rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
                      aria-label="삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* 생성/수정 모달 */}
      <AnimatePresence>
        {formOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeForm}
            />
            <motion.div
              className="relative w-full max-w-[390px] bg-white rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-900 text-base">
                  {editingId !== null ? '쿠폰 이벤트 수정' : '새 쿠폰 이벤트'}
                </h3>
                <button
                  onClick={closeForm}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="닫기"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {/* 이벤트 이름 */}
                <div>
                  <label htmlFor="event-name" className="text-xs font-bold text-slate-500 mb-1.5 block">
                    이벤트 이름
                  </label>
                  <input
                    id="event-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    placeholder="이벤트 이름 입력"
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label htmlFor="event-desc" className="text-xs font-bold text-slate-500 mb-1.5 block">
                    설명
                  </label>
                  <textarea
                    id="event-desc"
                    value={form.description}
                    onChange={(e) => updateField('description', e.target.value)}
                    placeholder="이벤트 설명 입력"
                    rows={3}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none transition-colors"
                  />
                </div>

                {/* 이벤트 유형 */}
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">이벤트 유형</p>
                  <div className="flex gap-2">
                    {(['HAPPY_HOUR', 'SECRET_CODE'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateField('type', t)}
                        className={`flex-1 h-10 rounded-xl text-xs font-semibold border transition-colors ${
                          form.type === t
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {TYPE_LABEL[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 시크릿 코드 */}
                {form.type === 'SECRET_CODE' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label htmlFor="secret-code" className="text-xs font-bold text-slate-500 mb-1.5 block">
                      시크릿 코드
                    </label>
                    <input
                      id="secret-code"
                      type="text"
                      value={form.secretCode}
                      onChange={(e) => updateField('secretCode', e.target.value)}
                      placeholder={editingId !== null ? '비워두면 기존 코드 유지' : '참여에 필요한 코드 입력'}
                      className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
                    />
                  </motion.div>
                )}

                {/* 보상 티켓 유형 */}
                <div>
                  <p className="text-xs font-bold text-slate-500 mb-1.5">보상 티켓</p>
                  <div className="flex gap-2">
                    {(['RANDOM', 'IDEAL'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => updateField('rewardTicketType', t)}
                        className={`flex-1 h-10 rounded-xl text-xs font-semibold border transition-colors ${
                          form.rewardTicketType === t
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {TICKET_LABEL[t]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 보상 수량 */}
                <div>
                  <label htmlFor="reward-amount" className="text-xs font-bold text-slate-500 mb-1.5 block">
                    보상 수량 (장)
                  </label>
                  <input
                    id="reward-amount"
                    type="number"
                    min={1}
                    value={form.rewardAmount}
                    onChange={(e) => updateField('rewardAmount', Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>

                {/* 이벤트 시작 */}
                <div>
                  <label htmlFor="starts-at" className="text-xs font-bold text-slate-500 mb-1.5 block">
                    이벤트 시작
                  </label>
                  <input
                    id="starts-at"
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(e) => updateField('startsAt', e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>

                {/* 이벤트 종료 */}
                <div>
                  <label htmlFor="expires-at" className="text-xs font-bold text-slate-500 mb-1.5 block">
                    이벤트 종료
                  </label>
                  <input
                    id="expires-at"
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(e) => updateField('expiresAt', e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>

                {/* 쿠폰 만료일 */}
                <div>
                  <label htmlFor="coupon-expires-at" className="text-xs font-bold text-slate-500 mb-1.5 block">
                    쿠폰 만료일
                  </label>
                  <input
                    id="coupon-expires-at"
                    type="datetime-local"
                    value={form.couponExpiresAt}
                    onChange={(e) => updateField('couponExpiresAt', e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-slate-400 transition-colors"
                  />
                </div>

                {/* 제출 */}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || submitting}
                  className="w-full h-11 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting
                    ? '처리 중...'
                    : editingId !== null
                    ? '수정하기'
                    : '생성하기'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 삭제 확인 모달 */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
            />
            <motion.div
              className="relative w-full max-w-[340px] bg-white rounded-3xl p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <h3 className="font-bold text-slate-900 text-base mb-2">이벤트 삭제</h3>
              <p className="text-sm text-slate-500 mb-5">
                <span className="font-semibold text-slate-700">{deleteTarget.name}</span>
                을(를) 삭제하시겠습니까?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 transition-colors"
                >
                  {deleting ? '삭제 중...' : '삭제'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponEventsTab;
