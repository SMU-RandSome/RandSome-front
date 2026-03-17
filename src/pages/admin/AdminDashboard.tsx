import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { getAdminMembers, getAdminMemberDetail, confirmPayment, rejectPayment } from '@/features/admin/api';
import type { AdminMemberListItem, AdminMemberDetail } from '@/types';
import { Check, X, ChevronRight, Search, ChevronLeft } from 'lucide-react';
import axios from 'axios';

type AdminTab = 'payments' | 'members';

const ITEMS_PER_PAGE = 10;

// 결제 목록 API가 미구현이므로 임시 타입 및 더미 데이터 유지
interface PaymentItem {
  id: number;
  realName: string;
  type: string;
  amount: number;
  time: string;
  status: 'waiting' | 'confirmed' | 'failed';
}

const DUMMY_PAYMENTS: PaymentItem[] = [
  { id: 1, realName: '김민수', type: '후보 등록', amount: 3000, time: '10:29', status: 'waiting' },
  { id: 2, realName: '이지은', type: '후보 등록', amount: 3000, time: '10:34', status: 'waiting' },
  { id: 3, realName: '박준혁', type: '무작위 매칭', amount: 2000, time: '10:39', status: 'waiting' },
];

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
        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 text-slate-600"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-sm font-medium text-slate-600 px-2">
        {currentPage} / {totalPages}
      </span>
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 text-slate-600"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();

  const [activeTab, setActiveTab] = useState<AdminTab>('payments');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 결제 상태 (목록 API 미구현 — 더미 유지, 버튼은 실제 API)
  const [payments, setPayments] = useState<PaymentItem[]>(DUMMY_PAYMENTS);
  const [failModal, setFailModal] = useState<{ id: number; realName: string } | null>(null);
  const [failReason, setFailReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // 회원 목록 (실제 API)
  const [members, setMembers] = useState<AdminMemberListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<AdminMemberDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

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
      .catch(() => toast('회원 목록을 불러오지 못했습니다.', 'error'))
      .finally(() => setMembersLoading(false));
  }, [toast]);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers(currentPage, searchTerm);
    }
  }, [activeTab, currentPage, searchTerm, fetchMembers]);

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const handleTabChange = (tab: AdminTab): void => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // 결제 확인 — 실제 API 호출
  const handleConfirmPayment = async (id: number): Promise<void> => {
    setIsProcessing(true);
    try {
      await confirmPayment(id);
      setPayments((prev) => prev.map((p) => p.id === id ? { ...p, status: 'confirmed' as const } : p));
      toast('입금 확인 및 자동 승인되었습니다.', 'success');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast(err.response?.data?.error?.message ?? '처리에 실패했습니다.', 'error');
      } else {
        toast('처리 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 결제 거절 모달 열기
  const openFailModal = (id: number, realName: string): void => {
    setFailReason('');
    setFailModal({ id, realName });
  };

  const closeFailModal = (): void => {
    setFailModal(null);
    setFailReason('');
  };

  // 결제 거절 제출 — 실제 API 호출
  const submitFail = async (): Promise<void> => {
    if (!failModal || !failReason.trim()) return;
    setIsProcessing(true);
    try {
      await rejectPayment(failModal.id, { rejectedReason: failReason });
      setPayments((prev) => prev.map((p) => p.id === failModal.id ? { ...p, status: 'failed' as const } : p));
      toast('거절 처리되었습니다.', 'info');
      closeFailModal();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast(err.response?.data?.error?.message ?? '거절 처리에 실패했습니다.', 'error');
      } else {
        toast('처리 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // 회원 상세 조회 — 실제 API 호출
  const handleMemberClick = async (memberId: number): Promise<void> => {
    setDetailLoading(true);
    try {
      const res = await getAdminMemberDetail(memberId);
      if (res.data) setSelectedMemberDetail(res.data);
    } catch {
      toast('회원 정보를 불러오지 못했습니다.', 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const waitingPayments = payments.filter((p) => p.status === 'waiting');
  const processedPayments = payments.filter((p) => p.status !== 'waiting');

  const renderPayments = (): React.ReactNode => (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-1">
          확인 대기 ({waitingPayments.length})
        </p>
        <p className="text-[10px] text-amber-500 mb-3">
          ※ 결제 목록 API 미구현 — 실제 데이터는 백엔드 연동 후 표시됩니다.
        </p>
        {waitingPayments.length === 0 ? (
          <p className="text-sm text-slate-400 py-4">대기 중인 입금이 없습니다.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {waitingPayments.map((item) => (
              <div key={item.id} className="py-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-sm">{item.realName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.time} · {item.type} · {item.amount.toLocaleString()}원
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openFailModal(item.id, item.realName)}
                    disabled={isProcessing}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-500 text-xs font-medium hover:bg-slate-50 disabled:opacity-50"
                  >
                    <X size={13} /> 거절
                  </button>
                  <button
                    onClick={() => handleConfirmPayment(item.id)}
                    disabled={isProcessing}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-700 disabled:opacity-50"
                  >
                    <Check size={13} /> 확인
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {processedPayments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1">
            처리 완료 ({processedPayments.length})
          </p>
          <div className="divide-y divide-slate-100">
            {processedPayments.map((item) => (
              <div key={item.id} className="py-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700">{item.realName}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {item.time} · {item.type} · {item.amount.toLocaleString()}원
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  item.status === 'confirmed'
                    ? 'bg-green-50 text-green-600'
                    : 'bg-red-50 text-red-500'
                }`}>
                  {item.status === 'confirmed' ? '확인됨' : '실패함'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderMembers = (): React.ReactNode => (
    <div className="flex flex-col h-full">
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
              <p className="text-center text-sm text-slate-400 py-16">
                {searchTerm ? '검색 결과가 없습니다.' : '회원이 없습니다.'}
              </p>
            ) : (
              members.map((member) => (
                <button
                  key={member.id}
                  onClick={() => handleMemberClick(member.id)}
                  className="w-full py-3 flex items-center gap-3 text-left hover:bg-slate-50 -mx-5 px-5"
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
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {member.legalName} · {member.gender === 'MALE' ? '남' : '여'} · {member.mbti}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 shrink-0" />
                </button>
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

  const TABS: { id: AdminTab; label: string; count?: number }[] = [
    { id: 'payments', label: '결제', count: waitingPayments.length },
    { id: 'members', label: '회원' },
  ];

  return (
    <MobileLayout className="bg-white">
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-lg" />
            <span className="font-bold text-slate-900 text-sm">관리자</span>
          </div>
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-slate-700 font-medium"
          >
            로그아웃
          </button>
        </header>
      )}

      <div className={`sticky z-40 bg-white border-b border-slate-100 flex ${isPWA ? 'top-14' : 'top-0'}`}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 py-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 검색 바 */}
      <div className={`px-5 py-3 bg-white border-b border-slate-50 sticky z-30 ${isPWA ? 'top-[102px]' : 'top-[44px]'}`}>
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            className="w-full h-10 pl-10 pr-10 bg-slate-50 border-none rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-slate-200 outline-none transition-all"
            placeholder={activeTab === 'members' ? '닉네임, 실명 검색' : '실명으로 검색'}
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center bg-slate-200 text-slate-500 rounded-full"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {activeTab === 'payments' && renderPayments()}
        {activeTab === 'members' && renderMembers()}
      </div>

      {/* 거절 사유 모달 */}
      {failModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={closeFailModal} />
          <div className="relative w-full max-w-[390px] bg-white rounded-3xl p-6">
            <h3 className="font-bold text-slate-900 text-base mb-1">거절</h3>
            <p className="text-xs text-slate-400 mb-4">
              <span className="font-semibold text-slate-600">{failModal.realName}</span> 님의 거절 사유를 입력해주세요.
            </p>
            <textarea
              className="w-full h-28 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 resize-none focus:outline-none focus:border-slate-400"
              placeholder="예) 입금자명이 신청자 이름과 일치하지 않습니다."
              value={failReason}
              onChange={(e) => setFailReason(e.target.value)}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={closeFailModal}
                disabled={isProcessing}
                className="flex-1 h-12 rounded-2xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={submitFail}
                disabled={!failReason.trim() || isProcessing}
                className="flex-[2] h-12 rounded-2xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isProcessing ? '처리 중...' : '거절'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 회원 상세 모달 */}
      {(selectedMemberDetail ?? detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedMemberDetail(null)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-3xl p-6 max-h-[85vh] overflow-y-auto">
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
                    </div>
                    <p className="text-xs text-slate-400">{selectedMemberDetail.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMemberDetail(null)}
                    className="p-1 text-slate-400 hover:text-slate-700"
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
              </>
            )}
          </div>
        </div>
      )}
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
