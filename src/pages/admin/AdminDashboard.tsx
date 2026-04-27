import React, { Suspense, useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import {
  getAdminMembers,
  getAdminMemberDetail,
  getCandidateGenderCount,
  registerAnnouncement,
  getAdminMatchingApplications,
  getAdminReports,
  getAdminReportDetail,
  resolveAdminReport,
  rejectAdminReport,
  restoreAdminMember,
  suspendAdminMember,
} from '@/features/admin/api';
import { getAnnouncements } from '@/features/announcement/api';
import type {
  Gender,
  AdminMemberListItem,
  AdminMemberDetail,
  AdminMatchingItem,
  CandidateGenderCountResponse,
  Announcement,
  AdminReportListItem,
  AdminReportDetailResponse,
  ReportStatus,
  ReportReason,
  ReportStatusFilter,
} from '@/types';
import {
  X, ChevronRight, Search, ChevronLeft, Megaphone, Plus,
  CheckCircle2, XCircle, Dice5, Heart, Flag, RotateCcw, QrCode,
  Users, Tag, LogOut, ShieldCheck, UserCheck, AlertTriangle, Menu, Bell, BellOff,
} from 'lucide-react';
import { getApiErrorMessage } from '@/lib/axios';
import { FCM_ENABLED_KEY, registerFcmToken, unregisterFcmToken } from '@/hooks/useFcmToken';

const CouponEventsTab = React.lazy(() => import('@/features/admin/components/CouponEventsTab'));
const CandidateRegistrationsTab = React.lazy(() => import('@/features/admin/components/CandidateRegistrationsTab'));

type AdminTab = 'members' | 'candidates' | 'requests' | 'announcements' | 'coupon-events' | 'reports';
type AdminReportFilter = 'ALL' | ReportStatusFilter;

const ITEMS_PER_PAGE = 20;

const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  INAPPROPRIATE_CONTENT: '부적절한 내용',
  PLAGIARIZED_PROFILE: '프로필 도용',
  FAKE_PROFILE: '허위 프로필',
  HARASSMENT: '괴롭힘',
  SCAM: '사기',
  OTHER: '기타',
};

const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  PENDING: '대기 중',
  IN_REVIEW: '검토 중',
  RESOLVED: '처리됨',
  REJECTED: '거절됨',
};

const REPORT_STATUS_COLORS: Record<ReportStatus, string> = {
  PENDING: 'bg-orange-100 text-orange-600',
  IN_REVIEW: 'bg-blue-100 text-blue-600',
  RESOLVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-slate-100 text-slate-500',
};

// ── 페이지네이션 ───────────────────────────────────────────────
const PAGE_WINDOW = 5;

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const half = Math.floor(PAGE_WINDOW / 2);
  const start = Math.max(1, Math.min(currentPage - half, totalPages - PAGE_WINDOW + 1));
  const end = Math.min(totalPages, start + PAGE_WINDOW - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <div className="flex items-center justify-center gap-1 mt-8 pb-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="이전 페이지"
      >
        <ChevronLeft size={16} />
      </button>
      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="w-8 h-8 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            1
          </button>
          {start > 2 && <span className="px-1 text-slate-400 text-sm">…</span>}
        </>
      )}
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
            p === currentPage
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {p}
        </button>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400 text-sm">…</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            className="w-8 h-8 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {totalPages}
          </button>
        </>
      )}
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-2 rounded-lg border border-slate-200 disabled:opacity-30 text-slate-600 transition-colors hover:bg-slate-50"
        aria-label="다음 페이지"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// ── 사이드바 탭 정의 ──────────────────────────────────────────
const SIDEBAR_TABS: { id: AdminTab; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'members',      label: '회원 관리',     icon: Users,     description: '가입 회원 및 후보자 관리' },
  { id: 'candidates',   label: '후보 신청',     icon: UserCheck, description: '후보 등록 신청 승인/거절' },
  { id: 'requests',     label: '매칭 신청',     icon: Heart,     description: '매칭 신청 내역 확인' },
  { id: 'announcements',label: '공지사항',      icon: Megaphone, description: '공지사항 등록 및 조회' },
  { id: 'coupon-events',label: '쿠폰 이벤트',   icon: Tag,       description: '쿠폰 이벤트 관리' },
  { id: 'reports',      label: '신고 관리',     icon: Flag,      description: '신고 처리 및 회원 복구' },
];

// ── 메인 컴포넌트 ──────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<AdminTab>('members');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // 알림
  const [notifEnabled, setNotifEnabled] = useState<boolean>(
    typeof Notification !== 'undefined' &&
      Notification.permission === 'granted' &&
      localStorage.getItem(FCM_ENABLED_KEY) === 'true',
  );
  const notifLoadingRef = useRef(false);

  // 통계
  const [candidateStats, setCandidateStats] = useState<CandidateGenderCountResponse | null>(null);

  // 회원 관리
  const [members, setMembers] = useState<AdminMemberListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [membersLoading, setMembersLoading] = useState(false);
  const [selectedMemberDetail, setSelectedMemberDetail] = useState<AdminMemberDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [suspendReason, setSuspendReason] = useState('');
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);

  // 매칭 신청
  const [matchingApplications, setMatchingApplications] = useState<AdminMatchingItem[]>([]);
  const [matchingTotalPages, setMatchingTotalPages] = useState(1);
  const [matchingPage, setMatchingPage] = useState(1);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [matchingSort, setMatchingSort] = useState<'LATEST' | 'OLDEST'>('LATEST');
  const [matchingKeyword, setMatchingKeyword] = useState('');
  const [matchingDate, setMatchingDate] = useState('');
  const [matchingGender, setMatchingGender] = useState<Gender | ''>('');

  // 공지사항
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  // 신고 관리
  const [reportFilter, setReportFilter] = useState<AdminReportFilter>('ALL');
  const [reports, setReports] = useState<AdminReportListItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AdminReportDetailResponse | null>(null);
  const [reportDetailLoading, setReportDetailLoading] = useState(false);
  const [isProcessingReport, setIsProcessingReport] = useState(false);
  const [showReportSuspendForm, setShowReportSuspendForm] = useState(false);
  const [reportSuspendReason, setReportSuspendReason] = useState('');

  const fetchCandidateStats = useCallback((): void => {
    getCandidateGenderCount()
      .then((res) => { if (res.data) setCandidateStats(res.data); })
      .catch((err: unknown) => {
        if (import.meta.env.DEV) console.error('후보 통계 로딩 실패:', err);
        toast('후보 통계를 불러오는데 실패했습니다', 'error');
      });
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

  const fetchMatchingApplications = useCallback((
    page: number,
    sort: 'LATEST' | 'OLDEST',
    keyword: string,
    date: string,
    gender: Gender | '',
  ): void => {
    setMatchingLoading(true);
    getAdminMatchingApplications({
      page,
      size: ITEMS_PER_PAGE,
      sort,
      keyword: keyword || undefined,
      date: date || undefined,
      gender: gender || undefined,
    })
      .then((res) => {
        if (res.data) {
          setMatchingApplications(res.data.content);
          setMatchingTotalPages(res.data.totalPages);
        }
      })
      .catch((err: unknown) => toast(getApiErrorMessage(err), 'error'))
      .finally(() => setMatchingLoading(false));
  }, [toast]);

  const fetchAnnouncements = useCallback((): void => {
    setAnnouncementsLoading(true);
    getAnnouncements()
      .then((res) => { if (res.data) setAnnouncements(res.data); })
      .catch((err: unknown) => toast(getApiErrorMessage(err), 'error'))
      .finally(() => setAnnouncementsLoading(false));
  }, [toast]);

  const fetchReports = useCallback((status: AdminReportFilter): void => {
    setReportsLoading(true);
    getAdminReports(status !== 'ALL' ? { statusFilter: status } : undefined)
      .then((res) => {
        if (res.data) setReports(res.data);
      })
      .catch((err: unknown) => toast(getApiErrorMessage(err), 'error'))
      .finally(() => setReportsLoading(false));
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

  const handleReportClick = async (reportId: number): Promise<void> => {
    setReportDetailLoading(true);
    setShowReportSuspendForm(false);
    setReportSuspendReason('');
    try {
      const res = await getAdminReportDetail(reportId);
      if (res.data) setSelectedReport(res.data);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setReportDetailLoading(false);
    }
  };

  const handleProcessReport = async (reportId: number): Promise<void> => {
    setIsProcessingReport(true);
    try {
      await resolveAdminReport(reportId);
      toast('신고가 처리(경고)되었습니다.', 'success');
      setSelectedReport(null);
      fetchReports(reportFilter);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsProcessingReport(false);
    }
  };

  const handleRejectReport = async (reportId: number): Promise<void> => {
    setIsProcessingReport(true);
    try {
      await rejectAdminReport(reportId);
      toast('신고가 거절되었습니다.', 'info');
      setSelectedReport(null);
      fetchReports(reportFilter);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsProcessingReport(false);
    }
  };

  const handleSuspendFromReport = async (reportId: number, memberId: number): Promise<void> => {
    if (!reportSuspendReason.trim()) {
      toast('정지 사유를 입력해주세요.', 'error');
      return;
    }
    setIsProcessingReport(true);
    try {
      await suspendAdminMember(memberId, { reason: reportSuspendReason.trim() });
      await resolveAdminReport(reportId);
      toast('회원 정지 및 신고 처리가 완료되었습니다.', 'success');
      setReportSuspendReason('');
      setShowReportSuspendForm(false);
      setSelectedReport(null);
      fetchReports(reportFilter);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsProcessingReport(false);
    }
  };

  const handleRestoreMember = async (memberId: number): Promise<void> => {
    try {
      await restoreAdminMember(memberId);
      toast('회원이 복구되었습니다.', 'success');
      setSelectedReport(null);
      fetchReports(reportFilter);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    }
  };

  useEffect(() => {
    fetchCandidateStats();
  }, [fetchCandidateStats]);

  useEffect(() => {
    if (activeTab === 'members') {
      fetchMembers(currentPage, searchTerm);
    }
  }, [activeTab, currentPage, searchTerm, fetchMembers]);

  useEffect(() => {
    if (activeTab === 'requests') {
      fetchMatchingApplications(matchingPage, matchingSort, matchingKeyword, matchingDate, matchingGender);
    }
  }, [activeTab, matchingPage, matchingSort, matchingKeyword, matchingDate, matchingGender, fetchMatchingApplications]);

  useEffect(() => {
    if (activeTab === 'announcements') {
      fetchAnnouncements();
    }
  }, [activeTab, fetchAnnouncements]);

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports(reportFilter);
    }
  }, [activeTab, reportFilter, fetchReports]);

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const handleNotificationToggle = useCallback(async (): Promise<void> => {
    if (typeof Notification === 'undefined') {
      toast('이 브라우저는 알림을 지원하지 않습니다.', 'error');
      return;
    }
    if (notifLoadingRef.current) return;
    notifLoadingRef.current = true;
    try {
      if (notifEnabled) {
        await unregisterFcmToken();
        setNotifEnabled(false);
        toast('알림을 껐습니다.', 'info');
      } else {
        const success = await registerFcmToken();
        if (success) {
          setNotifEnabled(true);
          toast('알림을 켰습니다.', 'success');
        }
      }
    } catch {
      toast('알림 설정 중 오류가 발생했습니다.', 'error');
    } finally {
      notifLoadingRef.current = false;
    }
  }, [notifEnabled, toast]);

  const handleTabChange = (tab: AdminTab): void => {
    setActiveTab(tab);
    setSearchTerm('');
    setCurrentPage(1);
    setMatchingPage(1);
    setMatchingSort('LATEST');
    setMatchingKeyword('');
    setMatchingDate('');
    setMatchingGender('');
    setDrawerOpen(false);
  };

  const handleSearchChange = (value: string): void => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // ── 회원 상세 ────────────────────────────────────────────────
  const handleMemberClick = async (memberId: number): Promise<void> => {
    setDetailLoading(true);
    setShowSuspendForm(false);
    setSuspendReason('');
    try {
      const res = await getAdminMemberDetail(memberId);
      if (res.data) setSelectedMemberDetail(res.data);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspendMember = async (memberId: number): Promise<void> => {
    if (!suspendReason.trim()) {
      toast('정지 사유를 입력해주세요.', 'error');
      return;
    }
    setSuspendLoading(true);
    try {
      await suspendAdminMember(memberId, { reason: suspendReason.trim() });
      toast('회원이 정지 처리되었습니다.', 'success');
      setSuspendReason('');
      setShowSuspendForm(false);
      setSelectedMemberDetail(null);
      fetchMembers(currentPage, searchTerm);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setSuspendLoading(false);
    }
  };

  // ── 렌더 함수 ────────────────────────────────────────────────
  const renderMembers = (): React.ReactNode => (
    <div className="flex flex-col">
      {/* 후보자 성비 현황 */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        className="mb-5"
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
                  <p className="font-display text-[26px] text-slate-900 leading-none">{total}</p>
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
                  className="w-full py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors rounded-lg px-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{member.nickname}</p>
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                        member.role === 'ROLE_CANDIDATE'
                          ? 'bg-blue-50 text-blue-600'
                          : member.role === 'ROLE_SUSPEND_MEMBER'
                          ? 'bg-red-50 text-red-600'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {member.role === 'ROLE_CANDIDATE' ? '후보자' : member.role === 'ROLE_SUSPEND_MEMBER' ? '정지' : '일반'}
                      </span>
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

  const renderMatchingApplications = (): React.ReactNode => (
    <div className="flex flex-col">
      {/* 필터 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-wrap gap-2 mb-4"
      >
        {/* 정렬 */}
        <div className="flex gap-1.5">
          {(['LATEST', 'OLDEST'] as const).map((s) => (
            <button
              key={s}
              onClick={() => { setMatchingSort(s); setMatchingPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                matchingSort === s ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {s === 'LATEST' ? '최신순' : '오래된순'}
            </button>
          ))}
        </div>

        {/* 성별 */}
        <div className="flex gap-1.5">
          {([['', '전체'], ['MALE', '남'], ['FEMALE', '여']] as [Gender | '', string][]).map(([g, label]) => (
            <button
              key={g}
              onClick={() => { setMatchingGender(g); setMatchingPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                matchingGender === g ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* 날짜 */}
        <input
          type="date"
          value={matchingDate}
          onChange={(e) => { setMatchingDate(e.target.value); setMatchingPage(1); }}
          className="h-8 px-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-slate-400 transition-colors"
          style={{ fontSize: '16px' }}
        />

        {/* 키워드 */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={matchingKeyword}
            onChange={(e) => { setMatchingKeyword(e.target.value); setMatchingPage(1); }}
            placeholder="닉네임 또는 실명"
            className="h-8 pl-8 pr-8 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 transition-colors w-40"
            style={{ fontSize: '16px' }}
          />
          <AnimatePresence>
            {matchingKeyword && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.15 }}
                onClick={() => { setMatchingKeyword(''); setMatchingPage(1); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center bg-slate-200 text-slate-500 rounded-full"
              >
                <X size={9} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {matchingLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {matchingApplications.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-slate-400 py-16"
              >
                매칭 신청 내역이 없습니다.
              </motion.p>
            ) : (
              matchingApplications.map((app, i) => {
                const isSuccess = app.applicationStatus === 'SUCCESS';
                const isPartial = app.applicationStatus === 'PARTIAL_MATCH';
                const isFailed = app.applicationStatus === 'FAILED';
                const isCancelled = app.applicationStatus === 'CANCELLED';
                const isIdeal = app.matchingType === 'IDEAL';

                const iconBg = isSuccess
                  ? isIdeal ? 'bg-pink-100 text-pink-500' : 'bg-green-100 text-green-600'
                  : isPartial
                  ? 'bg-amber-100 text-amber-600'
                  : isFailed
                  ? 'bg-red-100 text-red-500'
                  : isCancelled
                  ? 'bg-slate-100 text-slate-400'
                  : 'bg-orange-100 text-orange-500';

                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.04 }}
                    className="py-3 flex items-center gap-3"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                      {isCancelled || isFailed ? (
                        <XCircle size={16} />
                      ) : isIdeal ? (
                        <Heart size={16} fill={isSuccess || isPartial ? 'currentColor' : 'none'} />
                      ) : (
                        isSuccess || isPartial ? <CheckCircle2 size={16} /> : <Dice5 size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-slate-900 truncate">{app.applicantNickname}</p>
                        <span className="text-xs text-slate-400 shrink-0">{app.matchingType === 'IDEAL' ? '이상형' : '랜덤'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {app.applicationStatus === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                            처리중 · {app.applicationCount}명 신청
                          </span>
                        )}
                        {isSuccess && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={9} />
                            완료 · {app.matchedCount}/{app.applicationCount}명
                          </span>
                        )}
                        {isPartial && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 size={9} />
                            부분 매칭 · {app.matchedCount}/{app.applicationCount}명
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
                            <XCircle size={9} />
                            매칭 실패 · {app.applicationCount}명 신청
                          </span>
                        )}
                        {isCancelled && (
                          <span className="text-[10px] text-slate-400 font-medium">취소됨 · {app.applicationCount}명 신청</span>
                        )}
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 shrink-0">
                      {new Date(app.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                    </p>
                  </motion.div>
                );
              })
            )}
          </div>
          <Pagination
            currentPage={matchingPage}
            totalPages={matchingTotalPages}
            onPageChange={setMatchingPage}
          />
        </>
      )}
    </div>
  );

  const renderAnnouncements = (): React.ReactNode => (
    <div className="space-y-4">
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
          style={{ fontSize: '16px' }}
        />
        <textarea
          placeholder="내용"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          rows={4}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 resize-none transition-colors"
          style={{ fontSize: '16px' }}
        />
        <button
          onClick={handlePostAnnouncement}
          disabled={!newTitle.trim() || !newContent.trim() || isPosting}
          className="w-full h-10 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {isPosting ? '등록 중...' : '공지 등록'}
        </button>
      </motion.div>

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
                onClick={() => setSelectedAnnouncement(notice)}
                className="bg-white border border-slate-100 rounded-2xl p-4 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-colors"
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

  const renderReports = (): React.ReactNode => {
    const STATUS_FILTERS: { value: AdminReportFilter; label: string }[] = [
      { value: 'ALL', label: '전체' },
      { value: 'PENDING', label: '대기 중' },
      { value: 'IN_REVIEW', label: '검토 중' },
      { value: 'COMPLETED', label: '처리 완료' },
    ];

    return (
      <div className="flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none"
        >
          {STATUS_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => {
                setReportFilter(value);
              }}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                reportFilter === value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </motion.div>

        {reportsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {reports.length === 0 ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-slate-400 py-16"
              >
                신고 내역이 없습니다.
              </motion.p>
            ) : (
              reports.map((report, i) => (
                <motion.button
                  key={report.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: i * 0.04 }}
                  onClick={() => handleReportClick(report.id)}
                  className="w-full py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors rounded-lg px-2"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    report.reportStatus === 'PENDING'
                      ? 'bg-orange-100 text-orange-500'
                      : report.reportStatus === 'RESOLVED'
                      ? 'bg-green-100 text-green-600'
                      : report.reportStatus === 'IN_REVIEW'
                      ? 'bg-blue-100 text-blue-500'
                      : 'bg-slate-100 text-slate-400'
                  }`}>
                    <Flag size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {REPORT_REASON_LABELS[report.reason]}
                      </p>
                      <span className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded ${REPORT_STATUS_COLORS[report.reportStatus]}`}>
                        {REPORT_STATUS_LABELS[report.reportStatus]}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{report.reporterNickname} → {report.reportedMemberNickname}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })}
                    </p>
                    <ChevronRight size={14} className="text-slate-300 ml-auto mt-1" />
                  </div>
                </motion.button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const activeTabInfo = SIDEBAR_TABS.find((t) => t.id === activeTab)!;

  // ── 사이드바 내용 (데스크탑 + 모바일 드로어 공용) ──
  const renderSidebarContent = (): React.ReactNode => (
    <>
      {/* 서비스 설명 */}
      <div className="px-5 py-5 border-b border-slate-800">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Admin Panel</p>
        <p className="text-xs text-slate-400 mt-1">상명대학교 축제 랜덤매칭</p>
      </div>

      {/* 네비게이션 */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {SIDEBAR_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150 group ${
                isActive
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon
                size={16}
                strokeWidth={isActive ? 2.5 : 2}
                className={isActive ? 'text-blue-600' : 'text-slate-500 group-hover:text-slate-300'}
              />
              <span className={`text-sm font-semibold ${isActive ? 'text-slate-900' : ''}`}>
                {tab.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 하단 */}
      <div className="px-5 py-4 border-t border-slate-800">
        <p className="text-[10px] text-slate-600">소프트웨어학과 학생회</p>
      </div>
    </>
  );

  // ── 렌더 ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* ── 상단 헤더 ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 flex items-center px-3 lg:px-6 gap-2 lg:gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.04)]" style={{ paddingTop: 'env(safe-area-inset-top, 0px)', height: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
        {/* 모바일 햄버거 */}
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu size={20} />
        </button>

        {/* 로고 */}
        <div className="flex items-center gap-2 lg:gap-2.5 lg:w-56 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-300/30">
            <Heart size={15} fill="currentColor" />
          </div>
          <span className="font-display text-lg tracking-tight hidden sm:inline">
            <span className="text-blue-600">Rand</span><span className="text-pink-500">some</span>
          </span>
        </div>

        {/* 현재 페이지명 */}
        <div className="hidden sm:flex items-center gap-2 flex-1 min-w-0">
          <ShieldCheck size={15} className="text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-600 shrink-0">관리자</span>
          <span className="text-slate-300 mx-1 shrink-0">/</span>
          <span className="text-sm font-bold text-slate-900 truncate">{activeTabInfo.label}</span>
        </div>
        {/* 모바일 페이지명 */}
        <div className="sm:hidden flex-1 min-w-0">
          <span className="text-sm font-bold text-slate-900 truncate block">{activeTabInfo.label}</span>
        </div>

        {/* 우측 액션 */}
        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
          <button
            onClick={() => navigate('/admin/qr')}
            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-semibold transition-colors"
            aria-label="QR 인증"
          >
            <QrCode size={14} />
            <span className="hidden sm:inline">QR 스캔</span>
          </button>
          <button
            onClick={handleNotificationToggle}
            className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              notifEnabled
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
            aria-label={notifEnabled ? '알림 끄기' : '알림 켜기'}
          >
            {notifEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            <span className="hidden sm:inline">{notifEnabled ? '알림 ON' : '알림 OFF'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors"
          >
            <LogOut size={14} />
            <span className="hidden sm:inline">로그아웃</span>
          </button>
        </div>
      </header>

      {/* ── 모바일 드로어 ── */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-[60] lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              {/* 드로어 헤더 */}
              <div className="flex items-center justify-between px-5 border-b border-slate-800" style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))', paddingBottom: '1rem' }}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white">
                    <Heart size={12} fill="currentColor" />
                  </div>
                  <span className="font-display text-base tracking-tight">
                    <span className="text-blue-400">Rand</span><span className="text-pink-400">some</span>
                  </span>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  aria-label="메뉴 닫기"
                >
                  <X size={18} />
                </button>
              </div>
              {renderSidebarContent()}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex min-h-screen" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
        {/* ── 좌측 사이드바 (데스크탑 전용) ── */}
        <aside className="hidden lg:flex fixed left-0 bottom-0 w-56 bg-slate-900 flex-col z-40" style={{ top: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
          {renderSidebarContent()}
        </aside>

        {/* ── 메인 컨텐츠 ── */}
        <main className="flex-1 lg:ml-56 min-h-full w-full">
          <div className="p-4 lg:p-6 max-w-4xl">
            {/* 페이지 헤더 */}
            <motion.div
              key={activeTab + '-header'}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="mb-4 lg:mb-5"
            >
              <h1 className="text-lg lg:text-xl font-bold text-slate-900">{activeTabInfo.label}</h1>
              <p className="text-xs text-slate-400 mt-0.5">{activeTabInfo.description}</p>
            </motion.div>

            {/* 검색바 (회원 관리 전용) */}
            {activeTab === 'members' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-4"
              >
                <div className="relative max-w-full sm:max-w-sm">
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    className="w-full h-10 pl-10 pr-10 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none transition-all shadow-sm"
                    style={{ fontSize: '16px' }}
                    placeholder="닉네임 또는 실명 검색"
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
              </motion.div>
            )}

            {/* 탭 컨텐츠 */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 sm:p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeTab === 'members' && renderMembers()}
                  {activeTab === 'candidates' && (
                    <Suspense fallback={<div className="h-28 bg-slate-50 rounded-2xl animate-pulse" />}>
                      <CandidateRegistrationsTab />
                    </Suspense>
                  )}
                  {activeTab === 'requests' && renderMatchingApplications()}
                  {activeTab === 'announcements' && renderAnnouncements()}
                  {activeTab === 'coupon-events' && (
                    <Suspense fallback={<div className="h-28 bg-slate-50 rounded-2xl animate-pulse" />}>
                      <CouponEventsTab />
                    </Suspense>
                  )}
                  {activeTab === 'reports' && renderReports()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>

      {/* 회원 상세 모달 */}
      <AnimatePresence>
        {(selectedMemberDetail ?? detailLoading) && (
          <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center px-0 sm:px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMemberDetail(null)}
            />
            <motion.div
              className="relative w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
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
                            : selectedMemberDetail.role === 'ROLE_SUSPEND_MEMBER'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {selectedMemberDetail.role === 'ROLE_CANDIDATE' ? '후보자' : selectedMemberDetail.role === 'ROLE_SUSPEND_MEMBER' ? '정지' : '일반'}
                        </span>
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
                  <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
                    {selectedMemberDetail.role === 'ROLE_SUSPEND_MEMBER' ? (
                      <button
                        onClick={() => handleRestoreMember(selectedMemberDetail.id)}
                        className="w-full h-11 rounded-2xl bg-green-50 border border-green-100 text-green-700 text-sm font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={14} />
                        정지 해제
                      </button>
                    ) : !showSuspendForm ? (
                      <button
                        onClick={() => setShowSuspendForm(true)}
                        className="w-full h-11 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <AlertTriangle size={14} />
                        회원 정지
                      </button>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-3"
                      >
                        <textarea
                          placeholder="정지 사유를 입력해주세요"
                          value={suspendReason}
                          onChange={(e) => setSuspendReason(e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2.5 bg-white border border-red-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-red-400 resize-none transition-colors"
                          style={{ fontSize: '16px' }}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setShowSuspendForm(false);
                              setSuspendReason('');
                            }}
                            className="flex-1 h-10 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleSuspendMember(selectedMemberDetail.id)}
                            disabled={suspendLoading || !suspendReason.trim()}
                            className="flex-1 h-10 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            {suspendLoading ? '처리 중...' : '정지 확인'}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 신고 상세 모달 */}
      <AnimatePresence>
        {(selectedReport ?? reportDetailLoading) && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (!isProcessingReport) setSelectedReport(null); }}
            />
            <motion.div
              className="relative w-full sm:max-w-[390px] bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              {reportDetailLoading ? (
                <div className="h-48 animate-pulse bg-slate-50 rounded-2xl" />
              ) : selectedReport && (
                <>
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Flag size={16} className="text-slate-500" />
                        <h3 className="font-bold text-slate-900 text-base">
                          {REPORT_REASON_LABELS[selectedReport.reason]}
                        </h3>
                      </div>
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${REPORT_STATUS_COLORS[selectedReport.reportStatus]}`}>
                        {REPORT_STATUS_LABELS[selectedReport.reportStatus]}
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label="닫기"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400">신고자</p>
                        <button
                          type="button"
                          onClick={() => void handleMemberClick(selectedReport.reporterId)}
                          className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
                        >
                          상세 보기 <ChevronRight size={10} />
                        </button>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{selectedReport.reporterNickname}</p>
                      <p className="text-xs text-slate-400">ID: {selectedReport.reporterId}</p>
                    </div>
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400">피신고자</p>
                        <div className="flex items-center gap-2">
                          {selectedReport.activeReportCount > 0 && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-red-100 text-red-600">
                              활성 신고 {selectedReport.activeReportCount}건
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => void handleMemberClick(selectedReport.reportedMemberId)}
                            className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 flex items-center gap-0.5 transition-colors"
                          >
                            상세 보기 <ChevronRight size={10} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{selectedReport.reportedMemberNickname}</p>
                      <p className="text-xs text-slate-400">ID: {selectedReport.reportedMemberId}</p>
                    </div>
                  </div>

                  {selectedReport.description && (
                    <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                      <p className="text-[10px] font-bold text-slate-400 mb-1.5">상세 내용</p>
                      <p className="text-sm text-slate-700 leading-relaxed">{selectedReport.description}</p>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 mb-5">
                    {new Date(selectedReport.createdAt).toLocaleString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    {selectedReport.reportStatus === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleProcessReport(selectedReport.id)}
                          disabled={isProcessingReport}
                          className="w-full h-11 rounded-2xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {isProcessingReport && !showReportSuspendForm ? '처리 중...' : '처리 (경고)'}
                        </button>
                        {showReportSuspendForm ? (
                          <div className="space-y-2">
                            <textarea
                              value={reportSuspendReason}
                              onChange={(e) => setReportSuspendReason(e.target.value)}
                              placeholder="정지 사유를 입력해주세요"
                              className="w-full h-20 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-red-300"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSuspendFromReport(selectedReport.id, selectedReport.reportedMemberId)}
                                disabled={isProcessingReport}
                                className="flex-1 h-11 rounded-2xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                {isProcessingReport ? '처리 중...' : '정지 확인'}
                              </button>
                              <button
                                onClick={() => { setShowReportSuspendForm(false); setReportSuspendReason(''); }}
                                disabled={isProcessingReport}
                                className="flex-1 h-11 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowReportSuspendForm(true)}
                            disabled={isProcessingReport}
                            className="w-full h-11 rounded-2xl bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            회원 정지
                          </button>
                        )}
                        <button
                          onClick={() => handleRejectReport(selectedReport.id)}
                          disabled={isProcessingReport}
                          className="w-full h-11 rounded-2xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          거절
                        </button>
                      </>
                    )}
                    {selectedReport.reportStatus === 'RESOLVED' && (
                      <button
                        onClick={() => handleRestoreMember(selectedReport.reportedMemberId)}
                        className="w-full h-11 rounded-2xl bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <RotateCcw size={14} />
                        회원 복구
                      </button>
                    )}
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 공지사항 상세 모달 */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-5">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAnnouncement(null)}
            />
            <motion.div
              className="relative w-full sm:max-w-[480px] bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[80vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <Megaphone size={16} className="text-amber-400 shrink-0" />
                  <p className="text-base font-bold text-slate-900">{selectedAnnouncement.title}</p>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
                  aria-label="닫기"
                >
                  <X size={14} className="text-slate-500" />
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mb-3">
                {new Date(selectedAnnouncement.createdAt).toLocaleString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedAnnouncement.content}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-slate-100">
    <span className="text-xs text-slate-400 font-medium">{label}</span>
    <span className="text-sm text-slate-800 font-medium">{value}</span>
  </div>
);

export default AdminDashboard;
