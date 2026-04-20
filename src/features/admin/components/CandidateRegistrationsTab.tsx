import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/components/ui/Toast';
import {
  getAdminCandidateRegistrations,
  approveAdminCandidateRegistration,
  rejectAdminCandidateRegistration,
} from '@/features/admin/api';
import { getApiErrorMessage } from '@/lib/axios';
import type {
  AdminCandidateRegistrationItem,
  CandidateRegistrationFilter,
  CandidateRegistrationStatus,
} from '@/types';
import {
  Search, X, CheckCircle2, XCircle, Clock, UserCheck, UserX,
  ChevronRight, Loader2,
} from 'lucide-react';

const STATUS_LABELS: Record<CandidateRegistrationStatus, string> = {
  NOT_APPLIED: '미신청',
  PENDING: '대기 중',
  APPROVED: '승인됨',
  REJECTED: '거절됨',
  WITHDRAWN: '철회됨',
  CANCELED: '취소됨',
};

const STATUS_COLORS: Record<CandidateRegistrationStatus, string> = {
  NOT_APPLIED: 'bg-slate-100 text-slate-500',
  PENDING: 'bg-orange-100 text-orange-600',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-600',
  WITHDRAWN: 'bg-slate-100 text-slate-500',
  CANCELED: 'bg-slate-100 text-slate-500',
};

const ITEMS_PER_PAGE = 20;

const CandidateRegistrationsTab: React.FC = () => {
  const { toast } = useToast();

  const [filter, setFilter] = useState<CandidateRegistrationFilter>('PENDING');
  const [keyword, setKeyword] = useState('');
  const [items, setItems] = useState<AdminCandidateRegistrationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // 상세/액션
  const [selectedItem, setSelectedItem] = useState<AdminCandidateRegistrationItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const fetchItems = useCallback((
    filterVal: CandidateRegistrationFilter,
    keywordVal: string,
    lastId?: number,
  ): void => {
    const isLoadMore = lastId !== undefined;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    getAdminCandidateRegistrations({
      filter: filterVal,
      keyword: keywordVal || undefined,
      lastId,
      size: ITEMS_PER_PAGE,
    })
      .then((res) => {
        if (res.data) {
          if (isLoadMore) {
            setItems((prev) => [...prev, ...res.data!.items]);
          } else {
            setItems(res.data.items);
          }
          setHasNext(res.data.hasNext);
        }
      })
      .catch((err: unknown) => toast(getApiErrorMessage(err), 'error'))
      .finally(() => {
        setLoading(false);
        setLoadingMore(false);
      });
  }, [toast]);

  useEffect(() => {
    fetchItems(filter, keyword);
  }, [filter, keyword, fetchItems]);

  const handleLoadMore = (): void => {
    if (!hasNext || loadingMore || items.length === 0) return;
    const lastId = items[items.length - 1].id;
    fetchItems(filter, keyword, lastId);
  };

  const handleFilterChange = (newFilter: CandidateRegistrationFilter): void => {
    setFilter(newFilter);
    setKeyword('');
  };

  const handleApprove = async (item: AdminCandidateRegistrationItem): Promise<void> => {
    setActionLoading(true);
    try {
      await approveAdminCandidateRegistration(item.id);
      toast(`${item.memberNickname}님의 후보 등록이 승인되었습니다.`, 'success');
      setSelectedItem(null);
      fetchItems(filter, keyword);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (item: AdminCandidateRegistrationItem): Promise<void> => {
    if (!rejectReason.trim()) {
      toast('거절 사유를 입력해주세요.', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await rejectAdminCandidateRegistration(item.id, { reason: rejectReason.trim() });
      toast(`${item.memberNickname}님의 후보 등록이 거절되었습니다.`, 'info');
      setSelectedItem(null);
      setShowRejectForm(false);
      setRejectReason('');
      fetchItems(filter, keyword);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = (item: AdminCandidateRegistrationItem): void => {
    setSelectedItem(item);
    setShowRejectForm(false);
    setRejectReason('');
  };

  const FILTERS: { value: CandidateRegistrationFilter; label: string }[] = [
    { value: 'PENDING', label: '대기 중' },
    { value: 'COMPLETED', label: '처리 완료' },
  ];

  return (
    <div className="flex flex-col">
      {/* 필터 + 검색 */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex gap-2"
        >
          {FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleFilterChange(value)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                filter === value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full h-9 pl-9 pr-9 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all"
            placeholder="닉네임 또는 실명 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <AnimatePresence>
            {keyword && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                onClick={() => setKeyword('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-500 rounded-full"
              >
                <X size={10} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 목록 */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-slate-400 py-16"
              >
                {keyword ? '검색 결과가 없습니다.' : '후보 등록 신청 내역이 없습니다.'}
              </motion.p>
            ) : (
              items.map((item, i) => {
                const isPending = item.registrationStatus === 'PENDING';
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    onClick={() => openDetail(item)}
                    className="w-full py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors rounded-lg px-2"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isPending
                        ? 'bg-orange-100 text-orange-500'
                        : item.registrationStatus === 'APPROVED'
                        ? 'bg-green-100 text-green-600'
                        : item.registrationStatus === 'REJECTED'
                        ? 'bg-red-100 text-red-500'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isPending ? (
                        <Clock size={16} />
                      ) : item.registrationStatus === 'APPROVED' ? (
                        <UserCheck size={16} />
                      ) : item.registrationStatus === 'REJECTED' ? (
                        <UserX size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {item.memberNickname}
                        </p>
                        <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded ${STATUS_COLORS[item.registrationStatus]}`}>
                          {STATUS_LABELS[item.registrationStatus]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {item.memberLegalName} · {new Date(item.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 shrink-0" />
                  </motion.button>
                );
              })
            )}
          </div>

          {/* 더 보기 */}
          {hasNext && (
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="mt-4 w-full h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
            >
              {loadingMore ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  불러오는 중...
                </>
              ) : (
                '더 보기'
              )}
            </button>
          )}
        </>
      )}

      {/* 상세 모달 */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!actionLoading) setSelectedItem(null); }}
            />
            <motion.div
              className="relative w-full max-w-[390px] bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              {/* 헤더 */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 text-base">{selectedItem.memberNickname}</h3>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${STATUS_COLORS[selectedItem.registrationStatus]}`}>
                      {STATUS_LABELS[selectedItem.registrationStatus]}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{selectedItem.memberLegalName}</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="닫기"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 상세 정보 */}
              <div className="space-y-3 mb-5">
                <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">신청 일시</span>
                    <span className="text-sm text-slate-700 font-medium">
                      {new Date(selectedItem.createdAt).toLocaleString('ko-KR', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {selectedItem.approvedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">승인 일시</span>
                      <span className="text-sm text-green-600 font-medium">
                        {new Date(selectedItem.approvedAt).toLocaleString('ko-KR', {
                          month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  {selectedItem.rejectedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">거절 일시</span>
                      <span className="text-sm text-red-600 font-medium">
                        {new Date(selectedItem.rejectedAt).toLocaleString('ko-KR', {
                          month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                  {selectedItem.withdrawnAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">철회 일시</span>
                      <span className="text-sm text-slate-500 font-medium">
                        {new Date(selectedItem.withdrawnAt).toLocaleString('ko-KR', {
                          month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {selectedItem.rejectedReason && (
                  <div className="bg-red-50 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-red-400 mb-1.5">거절 사유</p>
                    <p className="text-sm text-red-700 leading-relaxed">{selectedItem.rejectedReason}</p>
                  </div>
                )}
              </div>

              {/* 액션 버튼 (PENDING일 때만) */}
              {selectedItem.registrationStatus === 'PENDING' && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  {!showRejectForm ? (
                    <>
                      <button
                        onClick={() => handleApprove(selectedItem)}
                        disabled={actionLoading}
                        className="w-full h-11 rounded-2xl bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                        {actionLoading ? '처리 중...' : '승인'}
                      </button>
                      <button
                        onClick={() => setShowRejectForm(true)}
                        disabled={actionLoading}
                        className="w-full h-11 rounded-2xl border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                      >
                        <XCircle size={14} />
                        거절
                      </button>
                    </>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-3"
                    >
                      <textarea
                        placeholder="거절 사유를 입력해주세요"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2.5 bg-white border border-red-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-400 resize-none transition-colors"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setShowRejectForm(false);
                            setRejectReason('');
                          }}
                          className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleReject(selectedItem)}
                          disabled={actionLoading || !rejectReason.trim()}
                          className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading ? '처리 중...' : '거절 확인'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CandidateRegistrationsTab;
