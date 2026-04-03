import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import {
  getAdminMembers,
  getAdminMemberDetail,
  confirmPayment,
  rejectPayment,
  getAdminPayments,
  getCandidateGenderCount,
  getPaymentStatusStatistics,
  registerAnnouncement,
} from '@/features/admin/api';
import { getAnnouncements } from '@/features/announcement/api';
import type {
  AdminMemberListItem,
  AdminMemberDetail,
  PaymentPreviewItem,
  CandidateGenderCountResponse,
  PaymentStatusStatisticsResponse,
  PaymentFilterStatus,
  Announcement,
} from '@/types';
import { Check, X, ChevronRight, Search, ChevronLeft, Megaphone, Plus } from 'lucide-react';
import { getApiErrorMessage } from '@/lib/axios';

type AdminTab = 'payments' | 'members' | 'announcements';
type PaymentSubTab = 'waiting' | 'processed';

const ITEMS_PER_PAGE = 5;

const PAYMENT_TYPE_LABELS: Record<PaymentPreviewItem['paymentType'], string> = {
  CANDIDATE_REGISTRATION: '후보 등록',
  RANDOM_MATCHING: '무작위 매칭',
  IDEAL_TYPE_MATCHING: '이상형 매칭',
};

const PAYMENT_TYPE_COLORS: Record<PaymentPreviewItem['paymentType'], string> = {
  CANDIDATE_REGISTRATION: 'bg-teal-100 text-teal-700',
  RANDOM_MATCHING: 'bg-violet-100 text-violet-700',
  IDEAL_TYPE_MATCHING: 'bg-rose-100 text-rose-700',
};

const formatPaymentTime = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
};


// ── 페이지네이션 ───────────────────────────────────────────────
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

// ── 메인 컴포넌트 ──────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 통계
  const [candidateStats, setCandidateStats] = useState<CandidateGenderCountResponse | null>(null);
  const [paymentStats, setPaymentStats] = useState<PaymentStatusStatisticsResponse | null>(null);

  // 입금 확인
  const [paymentItems, setPaymentItems] = useState<PaymentPreviewItem[]>([]);
  const [paymentTotalPages, setPaymentTotalPages] = useState(1);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentSubTab, setPaymentSubTab] = useState<PaymentSubTab>('waiting');
  const [paymentPage, setPaymentPage] = useState(1);
  const [rejectModal, setRejectModal] = useState<{ id: number; realName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 회원 관리
  const [members, setMembers] = useState<AdminMemberListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<AdminMemberDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [restrictedMemberIds, setRestrictedMemberIds] = useState<Set<number>>(new Set());

  // 공지사항
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchPaymentStats = useCallback((): void => {
    getPaymentStatusStatistics()
      .then((res) => { if (res.data) setPaymentStats(res.data); })
      .catch(() => {});
  }, []);

  const fetchCandidateStats = useCallback((): void => {
    getCandidateGenderCount()
      .then((res) => { if (res.data) setCandidateStats(res.data); })
      .catch(() => {});
  }, []);

  const fetchPayments = useCallback((filterStatus: PaymentFilterStatus, page: number, memberName?: string): void => {
    setPaymentsLoading(true);
    getAdminPayments(filterStatus, { page: page - 1, size: ITEMS_PER_PAGE, ...(memberName ? { query: memberName } : {}) })
      .then((res) => {
        if (res.data) {
          setPaymentItems(res.data.content);
          setPaymentTotalPages(res.data.totalPages || 1);
        }
      })
      .catch((err: unknown) => toast(getApiErrorMessage(err), 'error'))
      .finally(() => setPaymentsLoading(false));
  }, [toast]);

  const fetchMembers = useCallback((page: number, search: string): void => {
    setMembersLoading(true);
    getAdminMembers({ page: page - 1, size: ITEMS_PER_PAGE })
      .then((res) => {
        if (res.data) {
          const filtered = search
            ? res.data.content.filter(
                (m) =>
                  m.nickname.toLowerCase().includes(search.toLowerCase()) ||
                  m.legalName.toLowerCase().includes(search.toLowerCase()),
              )
            : res.data.content;
          setMembers(filtered);
          setTotalPages(res.data.totalPages);
        }
      })
      .catch((err: unknown) => {
        toast(getApiErrorMessage(err), 'error');
      })
      .finally(() => setMembersLoading(false));
  }, [toast]);

  const fetchAnnouncements = useCallback((): void => {
    setAnnouncementsLoading(true);
    getAnnouncements()
      .then((res) => { if (res.data) setAnnouncements(res.data); })
      .catch((err: unknown) => toast(getApiErrorMessage(err), 'error'))
      .finally(() => setAnnouncementsLoading(false));
  }, [toast]);

  const handlePostAnnouncement = async (): Promise<void> => {
    if (!newTitle.trim() || !newContent.trim()) return;
    setIsPosting(true);
    try {
      await registerAnnouncement({ title: newTitle.trim(), content: newContent.trim() });
      toast('공지사항이 등록되었습니다.', 'success');
      setNewTitle('');
      setNewContent('');
      fetchAnnouncements();
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsPosting(false);
    }
  };

  // 초기 통계 로드
  useEffect(() => {
    fetchPaymentStats();
    fetchCandidateStats();
  }, [fetchPaymentStats, fetchCandidateStats]);

  // 결제 목록 로드
  useEffect(() => {
    if (activeTab === 'payments') {
      const filterStatus: PaymentFilterStatus = paymentSubTab === 'waiting' ? 'PENDING' : 'PROCESSED';
      fetchPayments(filterStatus, paymentPage, searchTerm || undefined);
    }
  }, [activeTab, paymentSubTab, paymentPage, searchTerm, fetchPayments]);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers(currentPage, searchTerm);
    }
  }, [activeTab, currentPage, searchTerm, fetchMembers]);

  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchAnnouncements();
    }
  }, [activeTab, fetchAnnouncements]);

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab: AdminTab): void => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
    setPaymentPage(1);
    setPaymentSubTab('waiting');
  };

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    setCurrentPage(1);
    setPaymentPage(1);
  };

  // ── 입금 확인 ────────────────────────────────────────────────
  const handleConfirmPayment = async (id: number): Promise<void> => {
    setIsProcessing(true);
    try {
      await confirmPayment(id);
      const item = paymentItems.find((p) => p.paymentId === id);
      const followUp = item?.paymentType !== 'CANDIDATE_REGISTRATION'
        ? ' 매칭이 자동으로 처리되었습니다.'
        : ' 후보 등록이 자동 승인되었습니다.';
      toast(`입금 확인 완료.${followUp}`, 'success');
      const filterStatus: PaymentFilterStatus = paymentSubTab === 'waiting' ? 'PENDING' : 'PROCESSED';
      fetchPayments(filterStatus, paymentPage, searchTerm || undefined);
      fetchPaymentStats();
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const openRejectModal = (id: number, realName: string): void => {
    setRejectReason('');
    setRejectModal({ id, realName });
  };

  const closeRejectModal = (): void => {
    setRejectModal(null);
    setRejectReason('');
  };

  const submitReject = async (): Promise<void> => {
    if (!rejectModal || !rejectReason.trim()) return;
    setIsProcessing(true);
    try {
      await rejectPayment(rejectModal.id, { rejectedReason: rejectReason });
      toast('거절 처리되었습니다.', 'info');
      closeRejectModal();
      fetchPayments('PENDING', paymentPage, searchTerm || undefined);
      fetchPaymentStats();
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // ── 회원 상세 ────────────────────────────────────────────────
  const handleMemberClick = async (memberId: number): Promise<void> => {
    setDetailLoading(true);
    try {
      const res = await getAdminMemberDetail(memberId);
      if (res.data) setSelectedMemberDetail(res.data);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  // 더미 — 백엔드 연동 시 API 호출로 교체
  const handleToggleRestrict = (memberId: number): void => {
    const isRestricted = restrictedMemberIds.has(memberId);
    setRestrictedMemberIds((prev) => {
      const next = new Set(prev);
      if (isRestricted) next.delete(memberId);
      else next.add(memberId);
      return next;
    });
    toast(isRestricted ? '제한이 해제되었습니다.' : '회원이 제한 처리되었습니다.', 'info');
  };

  // ── 파생 상태 ────────────────────────────────────────────────
  const pendingCount = paymentStats?.pendingCount ?? 0;
  const processedCount = paymentStats?.processedCount ?? 0;

  // ── 렌더 함수 ────────────────────────────────────────────────
  const renderPayments = (): React.ReactNode => (
    <div>
      {/* 요약 카운터 */}
      <div className="flex gap-3 pt-4 pb-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="flex-1 bg-amber-50 border border-amber-100 rounded-2xl p-3 text-center"
        >
          <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
          <p className="text-[10px] text-amber-500 font-semibold mt-0.5">입금 대기</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl p-3 text-center"
        >
          <p className="text-2xl font-black text-slate-500">{processedCount}</p>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">처리 완료</p>
        </motion.div>
      </div>
      {/* 서브 탭 */}
      <div className="flex gap-2 mb-4 pt-4">
        <button
          onClick={() => { setPaymentSubTab('waiting'); setPaymentPage(1); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            paymentSubTab === 'waiting'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${paymentSubTab === 'waiting' ? 'bg-white animate-pulse' : 'bg-slate-400'}`} />
          승인 대기
          {pendingCount > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black ${
              paymentSubTab === 'waiting' ? 'bg-white text-slate-900' : 'bg-slate-500 text-white'
            }`}>
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => { setPaymentSubTab('processed'); setPaymentPage(1); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            paymentSubTab === 'processed'
              ? 'bg-slate-800 text-white shadow-sm'
              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
          }`}
        >
          처리 완료
          {processedCount > 0 && (
            <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-black ${
              paymentSubTab === 'processed' ? 'bg-white text-slate-800' : 'bg-slate-400 text-white'
            }`}>
              {processedCount}
            </span>
          )}
        </button>
      </div>

      {/* 목록 */}
      {paymentsLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-50 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : paymentItems.length === 0 ? (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-slate-400 py-12 text-center"
        >
          {searchTerm ? '검색 결과가 없습니다.' : paymentSubTab === 'waiting' ? '대기 중인 입금이 없습니다.' : '처리된 내역이 없습니다.'}
        </motion.p>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={paymentSubTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-2"
          >
            {paymentSubTab === 'waiting'
              ? paymentItems.map((item, i) => (
                  <motion.div
                    key={item.paymentId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.05 }}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-slate-900 text-sm">{item.memberName}</p>
                          <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${PAYMENT_TYPE_COLORS[item.paymentType]}`}>
                            {PAYMENT_TYPE_LABELS[item.paymentType]}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {formatPaymentTime(item.applyAt)}
                          {item.applicationCount != null && ` · ${item.applicationCount}명`}
                        </p>
                      </div>
                      <p className="text-base font-black text-slate-900">{item.amount.toLocaleString()}원</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openRejectModal(item.paymentId, item.memberName)}
                        disabled={isProcessing}
                        className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl border border-slate-200 bg-white text-slate-500 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
                      >
                        <X size={13} /> 거절
                      </button>
                      <button
                        onClick={() => handleConfirmPayment(item.paymentId)}
                        disabled={isProcessing}
                        className="flex-[2] flex items-center justify-center gap-1 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors"
                      >
                        <Check size={13} /> 입금 확인
                      </button>
                    </div>
                  </motion.div>
                ))
              : paymentItems.map((item, i) => (
                  <motion.div
                    key={item.paymentId}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, delay: i * 0.05 }}
                    className={`rounded-2xl p-3.5 border flex items-center gap-3 ${
                      item.paymentStatus === 'COMPLETED'
                        ? 'bg-green-50 border-green-100'
                        : 'bg-red-50 border-red-100 opacity-75'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      item.paymentStatus === 'COMPLETED' ? 'bg-green-500 text-white' : 'bg-red-400 text-white'
                    }`}>
                      {item.paymentStatus === 'COMPLETED' ? <Check size={15} /> : <X size={15} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-slate-800">{item.memberName}</p>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${PAYMENT_TYPE_COLORS[item.paymentType]}`}>
                          {PAYMENT_TYPE_LABELS[item.paymentType]}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {formatPaymentTime(item.applyAt)} · {item.amount.toLocaleString()}원
                        {item.applicationCount != null && ` · ${item.applicationCount}명`}
                      </p>
                      {item.paymentStatus === 'REJECTED' && item.rejectedReason && (
                        <p className="text-xs text-red-500 mt-1 truncate">{item.rejectedReason}</p>
                      )}
                    </div>
                    {item.paymentStatus === 'COMPLETED' ? (
                      <span className="text-xs font-bold shrink-0 text-green-600">확인됨</span>
                    ) : (
                      <button
                        onClick={() => handleConfirmPayment(item.paymentId)}
                        disabled={isProcessing}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-700 disabled:opacity-50 transition-colors shrink-0"
                      >
                        <Check size={12} /> 승인
                      </button>
                    )}
                  </motion.div>
                ))
            }
          </motion.div>
        </AnimatePresence>
      )}
      <Pagination
        currentPage={paymentPage}
        totalPages={paymentTotalPages}
        onPageChange={setPaymentPage}
      />
    </div>
  );

  const renderMembers = (): React.ReactNode => (
    <div className="flex flex-col h-full">
      {/* 후보자 성비 현황 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="pt-4 mb-4"
      >
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
          <p className="text-[10px] font-bold text-slate-400 mb-3">후보자 현황</p>
          {candidateStats === null ? (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          ) : (() => {
            const total = candidateStats.maleCount + candidateStats.femaleCount;
            const maleRatio = total > 0 ? Math.round((candidateStats.maleCount / total) * 100) : 50;
            const femaleRatio = total > 0 ? Math.round((candidateStats.femaleCount / total) * 100) : 50;
            return (
              <div className="flex items-center gap-4">
                <div className="text-center min-w-[52px]">
                  <p className="text-2xl font-black text-slate-900">{total}</p>
                  <p className="text-[10px] text-slate-400">전체</p>
                </div>
                <div className="flex-1">
                  <div className="flex rounded-full overflow-hidden h-2 mb-2">
                    <div className="bg-blue-400 transition-all" style={{ width: `${maleRatio}%` }} />
                    <div className="bg-rose-400 transition-all" style={{ width: `${femaleRatio}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-blue-500 font-bold">남 {candidateStats.maleCount}명 · {maleRatio}%</span>
                    <span className="text-rose-500 font-bold">여 {candidateStats.femaleCount}명 · {femaleRatio}%</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </motion.div>
      {membersLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {members.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-slate-400 py-16"
              >
                {searchTerm ? '검색 결과가 없습니다.' : '회원이 없습니다.'}
              </motion.p>
            ) : (
              members.map((member, i) => (
                <motion.button
                  key={member.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() => handleMemberClick(member.id)}
                  className="w-full py-3 flex items-center gap-3 text-left hover:bg-slate-50 -mx-5 px-5 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{member.nickname}</p>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        member.role === 'ROLE_CANDIDATE'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {member.role === 'ROLE_CANDIDATE' ? '후보자' : '일반'}
                      </span>
                      {restrictedMemberIds.has(member.id) && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-500">
                          제한
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {member.legalName} · {member.gender === 'MALE' ? '남' : '여'} · {member.mbti}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 shrink-0" />
                </motion.button>
              ))
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );

  const renderAnnouncements = (): React.ReactNode => (
    <div className="pt-4 space-y-4">
      {/* 등록 폼 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3"
      >
        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
          <Plus size={12} /> 새 공지사항
        </p>
        <input
          type="text"
          placeholder="제목"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors"
        />
        <textarea
          placeholder="내용"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none transition-colors"
        />
        <button
          onClick={handlePostAnnouncement}
          disabled={!newTitle.trim() || !newContent.trim() || isPosting}
          className="w-full h-10 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPosting ? '등록 중...' : '공지 등록'}
        </button>
      </motion.div>

      {/* 목록 */}
      <div>
        <p className="text-xs font-bold text-slate-400 mb-3">등록된 공지사항 ({announcements.length})</p>
        {announcementsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />)}
          </div>
        ) : announcements.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-slate-400 py-8 text-center"
          >
            등록된 공지사항이 없습니다.
          </motion.p>
        ) : (
          <div className="space-y-2">
            {announcements.map((notice, i) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: i * 0.06 }}
                className="bg-white border border-slate-100 rounded-2xl p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{notice.title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(notice.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">{notice.content}</p>
                  </div>
                  <Megaphone size={14} className="text-amber-400 shrink-0 mt-0.5" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ── 탭 정의 ──────────────────────────────────────────────────
  const TABS: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'payments', label: '입금 확인', count: pendingCount },
    { id: 'members', label: '회원 관리' },
    { id: 'announcements', label: '공지사항' },
  ];

  const searchPlaceholder =
    activeTab === 'members' ? '닉네임 또는 실명 검색' : '실명으로 검색';

  // ── 렌더 ─────────────────────────────────────────────────────
  return (
    <MobileLayout className="bg-white">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-50 bg-white border-b border-slate-100 px-5 h-14 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-slate-900 rounded-lg" />
          <span className="font-bold text-slate-900 text-sm">관리자</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors"
        >
          로그아웃
        </button>
      </motion.header>

      <div className="sticky top-14 z-40 bg-white border-b border-slate-100 flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`relative flex-1 py-3 text-xs font-semibold transition-colors ${
              activeTab === tab.id ? 'text-slate-900' : 'text-slate-400'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full">
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <motion.div
                layoutId="adminTabIndicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      {activeTab !== 'announcements' && (
        <div className="px-5 py-3 bg-white border-b border-slate-50 sticky top-[98px] z-30">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="w-full h-10 pl-10 pr-10 bg-slate-50 border-none rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <AnimatePresence>
              {searchTerm && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-500 rounded-full"
                >
                  <X size={10} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'payments' && renderPayments()}
            {activeTab === 'members' && renderMembers()}
            {activeTab === 'announcements' && renderAnnouncements()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 입금 거절 사유 모달 */}
      <AnimatePresence>
        {rejectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRejectModal}
            />
            <motion.div
              className="relative w-full max-w-[390px] bg-white rounded-3xl p-6"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <h3 className="font-bold text-slate-900 text-base mb-1">입금 거절</h3>
              <p className="text-xs text-slate-400 mb-4">
                <span className="font-semibold text-slate-600">{rejectModal.realName}</span> 님의 거절 사유를 입력해주세요.
              </p>
              <textarea
                className="w-full h-28 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-slate-400 transition-colors"
                placeholder="예) 입금자명이 신청자 이름과 일치하지 않습니다."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
              <div className="flex gap-2 mt-4">
                <button
                  onClick={closeRejectModal}
                  disabled={isProcessing}
                  className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={submitReject}
                  disabled={!rejectReason.trim() || isProcessing}
                  className="flex-[2] h-12 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessing ? '처리 중...' : '거절'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 회원 상세 모달 */}
      <AnimatePresence>
        {(selectedMemberDetail ?? detailLoading) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemberDetail(null)}
            />
            <motion.div
              className="relative w-full max-w-[390px] bg-white rounded-3xl p-6 max-h-[85vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              {detailLoading ? (
                <div className="h-40 animate-pulse bg-slate-50 rounded-2xl" />
              ) : selectedMemberDetail && (
                <>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 text-base">{selectedMemberDetail.nickname}</h3>
                        <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                          selectedMemberDetail.role === 'ROLE_CANDIDATE'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {selectedMemberDetail.role === 'ROLE_CANDIDATE' ? '후보자' : '일반'}
                        </span>
                        {restrictedMemberIds.has(selectedMemberDetail.id) && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-red-50 text-red-500">
                            제한됨
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{selectedMemberDetail.email}</p>
                    </div>
                    <button
                      onClick={() => setSelectedMemberDetail(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label="닫기"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <Row label="실명" value={selectedMemberDetail.legalName} />
                    <Row label="성별" value={selectedMemberDetail.gender === 'MALE' ? '남성' : '여성'} />
                    <Row label="MBTI" value={selectedMemberDetail.mbti} />
                    {selectedMemberDetail.instagramId && (
                      <Row label="인스타그램" value={`@${selectedMemberDetail.instagramId}`} />
                    )}
                    {selectedMemberDetail.bankName && selectedMemberDetail.accountNumber && (
                      <Row label="환불 계좌" value={`${selectedMemberDetail.bankName} ${selectedMemberDetail.accountNumber}`} />
                    )}
                  </div>

                  <div className="mt-4 space-y-3">
                    {selectedMemberDetail.selfIntroduction && (
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-slate-400 mb-1.5">자기소개</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedMemberDetail.selfIntroduction}</p>
                      </div>
                    )}
                    {selectedMemberDetail.idealDescription && (
                      <div className="bg-slate-50 rounded-2xl p-4">
                        <p className="text-[10px] font-bold text-slate-400 mb-1.5">이상형</p>
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedMemberDetail.idealDescription}</p>
                      </div>
                    )}
                  </div>
                  {/* 회원 제한 */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleRestrict(selectedMemberDetail.id)}
                      className={`w-full h-11 rounded-2xl text-sm font-semibold transition-colors ${
                        restrictedMemberIds.has(selectedMemberDetail.id)
                          ? 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                          : 'bg-red-50 border border-red-100 text-red-600 hover:bg-red-100'
                      }`}
                    >
                      {restrictedMemberIds.has(selectedMemberDetail.id) ? '제한 해제' : '회원 제한'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MobileLayout>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100">
    <span className="text-xs text-slate-400 font-medium">{label}</span>
    <span className="text-sm text-slate-800 font-medium">{value}</span>
  </div>
);

export default AdminDashboard;
