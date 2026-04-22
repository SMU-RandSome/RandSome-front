import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { getMyProfile, updateMyProfile, updatePassword } from '@/features/member/api';
import { withdrawCandidate, cancelCandidateRegistration } from '@/features/candidate/api';
import { getTicketBalance } from '@/features/ticket/api';
import { getApiErrorMessage } from '@/lib/axios';
import {
  getRealNameErrorMessage,
  validateInstagramId,
  getInstagramIdErrorMessage,
} from '@/lib/validation';
import { sendEmailVerificationCode, verifyEmailCode } from '@/features/auth/api';
import { registerFcmToken, unregisterFcmToken, FCM_ENABLED_KEY } from '@/hooks/useFcmToken';
import { DEPARTMENT_OPTIONS } from '@/constants/departments';
import { MBTI_OPTIONS, PERSONALITY_TAGS, FACE_TYPE_TAGS, DATING_STYLE_TAGS, PERSONALITY_TAG_LABELS, FACE_TYPE_TAG_LABELS, DATING_STYLE_TAG_LABELS } from '@/constants/tags';
import type { Department, MemberProfile, Mbti, TicketBalanceResponse, PersonalityTag, FaceTypeTag, DatingStyleTag } from '@/types';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { LogOut, Edit2, ChevronRight, UserCheck, UserX, Clock, AlertCircle, User, AtSign, Smile, Heart, X, Eye, EyeOff, ExternalLink, CheckCircle2, Bell, BellOff, Ticket, QrCode, History, Settings, Shield, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// 태그 상수는 src/constants/tags.ts 에서 import됩니다.

// 컴포넌트 외부 정의 — 매 렌더마다 React 엘리먼트 재생성 방지
const CANDIDATE_STATUS_CONFIG = {
  NOT_APPLIED: {
    icon: <UserX size={20} />,
    iconBg: 'bg-slate-100 text-slate-400',
    title: '매칭 후보 미등록',
    description: '등록하면 매칭 확률이 올라가요!',
    clickable: true,
  },
  PENDING: {
    icon: <Clock size={20} />,
    iconBg: 'bg-orange-100 text-orange-500',
    title: '후보 등록 승인 대기중',
    description: '관리자 확인 후 최대 10분 내 승인됩니다.',
    clickable: false,
  },
  APPROVED: {
    icon: <UserCheck size={20} />,
    iconBg: 'bg-green-100 text-green-600',
    title: '매칭 후보 등록됨',
    description: '다른 친구들이 나를 찾을 수 있어요!',
    clickable: false,
  },
  REJECTED: {
    icon: <AlertCircle size={20} />,
    iconBg: 'bg-red-100 text-red-500',
    title: '후보 등록 거절됨',
    description: '다시 신청하려면 탭을 눌러주세요.',
    clickable: true,
  },
  WITHDRAWN: {
    icon: <UserX size={20} />,
    iconBg: 'bg-slate-100 text-slate-400',
    title: '후보 등록 취소됨',
    description: '다시 신청하려면 탭을 눌러주세요.',
    clickable: true,
  },
  CANCELED: {
    icon: <UserX size={20} />,
    iconBg: 'bg-slate-100 text-slate-400',
    title: '후보 등록 취소됨',
    description: '다시 신청하려면 탭을 눌러주세요.',
    clickable: true,
  },
} as const;


interface EditForm {
  legalName: string;
  mbti: Mbti;
  department: Department | '';
  instagramId: string;
  selfIntroduction: string;
  idealDescription: string;
  personalityTag: PersonalityTag | '';
  faceTypeTag: FaceTypeTag | '';
  datingStyleTag: DatingStyleTag | '';
}

interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();

  const [profile, setProfile] = useState<MemberProfile | null>(user);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({
    legalName: user?.legalName ?? '',
    mbti: (user?.mbti ?? 'ENFP') as Mbti,
    department: (() => {
      const v = user?.department ?? '';
      const opt = DEPARTMENT_OPTIONS.find((o) => o.value === v || o.label === v);
      return opt ? opt.value : '';
    })(),
    instagramId: user?.instagramId ?? '',
    selfIntroduction: user?.selfIntroduction ?? '',
    idealDescription: user?.idealDescription ?? '',
    personalityTag: (user?.personalityTag ?? '') as PersonalityTag | '',
    faceTypeTag: (user?.faceTypeTag ?? '') as FaceTypeTag | '',
    datingStyleTag: (user?.datingStyleTag ?? '') as DatingStyleTag | '',
  });
  const [modal, setModal] = useState<ModalState>({ isOpen: false, title: '', content: null });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showWithdrawConfirm, setShowWithdrawConfirm] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState<boolean>(
    typeof Notification !== 'undefined' &&
      Notification.permission === 'granted' &&
      localStorage.getItem(FCM_ENABLED_KEY) === 'true',
  );
  const [notifLoading, setNotifLoading] = useState(false);
  const [ticketBalance, setTicketBalance] = useState<TicketBalanceResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    getTicketBalance()
      .then((res) => {
        if (cancelled) return;
        if (res.data) setTicketBalance(res.data);
      })
      .catch(() => {
        // 티켓 잔고 조회 실패 — 무시 (위젯 숨김)
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getMyProfile()
      .then((res) => {
        if (cancelled) return;
        if (res.data) {
          setProfile(res.data);
          setUser(res.data);
          setEditForm({
            legalName: res.data.legalName,
            mbti: res.data.mbti,
            department: (() => {
              const v = res.data.department ?? '';
              const opt = DEPARTMENT_OPTIONS.find((o) => o.value === v || o.label === v);
              return opt ? opt.value : '';
            })(),
            instagramId: res.data.instagramId ?? '',
            selfIntroduction: res.data.selfIntroduction ?? '',
            idealDescription: res.data.idealDescription ?? '',
            personalityTag: (res.data.personalityTag ?? '') as PersonalityTag | '',
            faceTypeTag: (res.data.faceTypeTag ?? '') as FaceTypeTag | '',
            datingStyleTag: (res.data.datingStyleTag ?? '') as DatingStyleTag | '',
          });
        }
      })
      .catch(() => {
        // 네트워크 오류 등 — authStore 캐시 사용
      });
    return () => { cancelled = true; };
  }, []);

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const handleWithdrawCandidate = async (): Promise<void> => {
    setIsWithdrawing(true);
    try {
      await withdrawCandidate();
      const res = await getMyProfile();
      if (res.data) {
        setProfile(res.data);
        setUser(res.data);
      }
      toast('후보 등록이 철회되었습니다.', 'success');
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsWithdrawing(false);
      setShowWithdrawConfirm(false);
    }
  };

  const handleCancelCandidateRegistration = async (): Promise<void> => {
    setIsCancelling(true);
    try {
      await cancelCandidateRegistration();
      const res = await getMyProfile();
      if (res.data) {
        setProfile(res.data);
        setUser(res.data);
      }
      toast('후보 등록 신청이 취소되었습니다.', 'success');
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
    }
  };

  const handleNotificationToggle = useCallback(async (): Promise<void> => {
    if (typeof Notification === 'undefined') {
      toast('이 브라우저는 알림을 지원하지 않습니다.', 'error');
      return;
    }

    setNotifLoading(true);
    try {
      if (notifEnabled) {
        // 토글 OFF: Firebase 토큰 삭제 → 서버 삭제
        await unregisterFcmToken();
        setNotifEnabled(false);
        toast('알림을 껐습니다.', 'info');
      } else {
        // 토글 ON: 권한 요청 → 토큰 발급 → 서버 동기화
        const success = await registerFcmToken();
        if (success) {
          setNotifEnabled(true);
          toast('알림을 켰습니다.', 'success');
        }
      }
    } catch {
      toast('알림 설정 중 오류가 발생했습니다.', 'error');
    } finally {
      setNotifLoading(false);
    }
  }, [notifEnabled, toast]);

  const handleSave = async (): Promise<void> => {
    // 유효성 검증
    if (!editForm.legalName.trim()) {
      toast('실명을 입력해주세요.', 'error');
      return;
    }

    const nameError = getRealNameErrorMessage(editForm.legalName);
    if (nameError) {
      toast(nameError, 'error');
      return;
    }

    if (!editForm.department) {
      toast('학과를 선택해주세요.', 'error');
      return;
    }

    if (editForm.instagramId && !validateInstagramId(editForm.instagramId)) {
      const instagramError = getInstagramIdErrorMessage(editForm.instagramId);
      toast(instagramError ?? '올바른 인스타그램 ID를 입력해주세요.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateMyProfile({
        legalName: editForm.legalName,
        mbti: editForm.mbti,
        department: editForm.department as Department,
        instagramId: editForm.instagramId || undefined,
        selfIntroduction: editForm.selfIntroduction || undefined,
        idealDescription: editForm.idealDescription || undefined,
        personalityTag: editForm.personalityTag || undefined,
        faceTypeTag: editForm.faceTypeTag || undefined,
        datingStyleTag: editForm.datingStyleTag || undefined,
      });
      // 저장 후 최신 프로필 다시 조회
      const res = await getMyProfile();
      if (res.data) {
        setProfile(res.data);
        setUser(res.data);
      }
      setIsEditing(false);
      toast('프로필이 저장되었습니다.', 'success');
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSaving(false);
    }
  };


  const openTerms = (): void => {
    setModal({
      isOpen: true,
      title: '이용약관',
      content: (
        <div className="space-y-6 text-sm text-slate-700">
          {/* 1. 서비스 이용 약관 */}
          <section>
            <h3 className="font-bold text-slate-900 mb-2">1. 서비스 이용 약관 (필수)</h3>
            <p className="text-slate-500 text-xs mb-2">
              본 서비스는 상명대학교 천안캠퍼스 축제 기간 동안 운영되는 온라인 랜덤 매칭 서비스 <strong className="text-slate-700">Randsome</strong>입니다.
            </p>
            <ul className="space-y-1.5">
              {[
                '본 서비스는 비영리 목적의 이벤트성 서비스로, 학생 간 교류 및 인연 형성을 지원하기 위해 제공됩니다.',
                '이용 대상은 상명대학교 천안캠퍼스 재학생 및 휴학생으로 제한됩니다.',
                '회원은 매칭 후보 등록 및 랜덤 매칭 신청 기능을 이용할 수 있습니다.',
                '매칭은 랜덤 알고리즘 또는 추천 방식으로 진행되며, 결과에 대한 개인적 만족도는 보장되지 않습니다.',
                '허위 정보 입력, 타인 정보 도용, 부적절한 프로필 작성 등 이용 목적에 어긋나는 행위가 확인될 경우 서비스 이용이 제한되거나 계정이 정지될 수 있습니다.',
                '본 서비스는 축제 기간 동안 한시적으로 운영되며, 행사 종료 후 서비스 운영이 종료됩니다.',
                '본 서비스는 무료로 제공되며, 별도의 결제 또는 환불 절차는 존재하지 않습니다.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 2. 개인정보 수집 및 이용 */}
          <section>
            <h3 className="font-bold text-slate-900 mb-2">2. 개인정보 수집 및 이용 동의 (필수)</h3>
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-slate-800 text-xs mb-1">수집 항목</p>
                <p className="text-slate-500 text-xs">학교 이메일, 성별, MBTI, 자기소개, 이상형 정보</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs mb-1">수집 및 이용 목적</p>
                <p className="text-slate-500 text-xs">회원 식별 및 서비스 이용 관리 / 매칭 서비스 제공 / 부정 이용 방지 및 서비스 운영 관리</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs mb-1">보유 및 이용 기간</p>
                <p className="text-slate-500 text-xs">서비스 종료 시 지체 없이 파기를 원칙으로 합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관 후 파기합니다.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs mb-1">이용자 권리</p>
                <p className="text-slate-500 text-xs">개인정보 열람 / 정정 및 삭제 / 처리 정지 요청</p>
              </div>
              <p className="text-xs text-slate-400">※ 이용자는 개인정보 수집 및 이용에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 서비스 이용이 제한됩니다.</p>
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 3. 개인정보 처리 위탁 및 제3자 제공 */}
          <section>
            <h3 className="font-bold text-slate-900 mb-2">3. 개인정보 처리 위탁 및 제3자 제공 (필수)</h3>
            <p className="text-slate-500 text-xs mb-2">본 서비스는 이용자의 개인정보를 외부에 제공하지 않습니다.</p>
            <p className="text-slate-500 text-xs mb-2">다만, 서비스 운영을 위해 다음과 같은 업무를 위탁할 수 있습니다.</p>
            <ul className="space-y-1.5">
              {[
                '서버 및 데이터 저장 (클라우드 서비스)',
                '이메일 발송 서비스',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-400 mt-2">※ 위탁된 업무는 관련 법령에 따라 안전하게 관리됩니다.</p>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 4. 운영 정책 및 책임 범위 */}
          <section>
            <h3 className="font-bold text-slate-900 mb-2">4. 운영 정책 및 책임 범위 (필수)</h3>
            <ul className="space-y-1.5 mb-3">
              {[
                '매칭은 시스템에 의해 자동으로 이루어지며, 결과의 정확성 또는 만족도를 보장하지 않습니다.',
                '이용자 간의 대화, 만남 등에서 발생하는 문제는 당사자 간 해결을 원칙으로 합니다.',
                '운영자는 이용자 간 분쟁에 직접 개입하지 않습니다. 단, 운영자의 고의 또는 중대한 과실이 있는 경우에는 관련 법령에 따라 책임을 질 수 있습니다.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="font-semibold text-slate-800 text-xs mb-1">서비스 이용 제한 사유</p>
            <ul className="space-y-1.5">
              {[
                '허위 정보 입력 또는 타인 사칭',
                '타인에게 불쾌감을 주는 행위 (욕설, 성희롱 등)',
                '서비스 목적에 부합하지 않는 이용',
                '기타 운영 정책 위반',
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5">
                  <span className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 5. 프로필 정보 공개 */}
          <section>
            <h3 className="font-bold text-slate-900 mb-2">5. 프로필 정보 공개 동의 (필수)</h3>
            <p className="text-slate-500 text-xs mb-2">서비스 특성상 매칭된 상대방에게 다음 정보가 공개될 수 있습니다.</p>
            <p className="font-semibold text-slate-800 text-xs mb-1">공개 항목</p>
            <p className="text-slate-500 text-xs mb-2">닉네임 / 인스타그램 ID (선택 입력) / 자기소개 / MBTI</p>
            <p className="font-semibold text-slate-800 text-xs mb-1">공개 범위</p>
            <p className="text-slate-500 text-xs mb-2">해당 정보는 매칭이 성사된 사용자에게만 제한적으로 공개되며, 제3자에게 별도로 제공되지 않습니다.</p>
            <p className="text-xs text-slate-400">※ 이용자는 프로필 작성 시 타인의 개인정보를 포함하지 않아야 하며, 이를 위반할 경우 운영자는 해당 정보를 수정·삭제하거나 서비스 이용을 제한할 수 있습니다.</p>
          </section>
        </div>
      ),
    });
  };

  const displayProfile = profile ?? user;
  const candidateStatus = displayProfile?.candidateRegistrationStatus ?? 'NOT_APPLIED';
  const statusConfig = CANDIDATE_STATUS_CONFIG[candidateStatus];

  return (
    <MobileLayout className="!bg-transparent">
      <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
      <MobileHeader
        title="마이페이지"
        right={
          <button className="p-1" aria-label="설정">
            <Settings size={20} className="text-slate-500" />
          </button>
        }
      />

      <div className={`flex-1 overflow-y-auto p-5 ${isPWA ? 'pb-24' : 'pb-8'}`}>
        {/* 프로필 카드 with stats */}
        <div
          className="rounded-3xl p-5 pb-0 shadow-[0_6px_28px_rgba(0,0,0,0.08)] relative overflow-hidden mb-3.5"
          style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,.65)' }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-[0.07] pointer-events-none" style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', filter: 'blur(28px)' }} />
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center z-10"
            style={{ background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.15)' }}
            aria-label="프로필 수정"
          >
            <Edit2 size={14} className="text-blue-600" />
          </button>
          <div className="flex items-center gap-3.5 relative mb-4">
            <div
              className="w-[66px] h-[66px] rounded-[22px] flex items-center justify-center font-display text-[28px] text-slate-700 shrink-0"
              style={{ background: 'linear-gradient(135deg, #c7d2fe, #fbcfe8)', boxShadow: '0 4px 16px rgba(0,0,0,.12)' }}
            >
              {(displayProfile?.nickname ?? '?')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-lg text-slate-900">{displayProfile?.nickname}</p>
              <p className="text-[12.5px] text-slate-500 mt-0.5">
                {displayProfile?.gender === 'MALE' ? '남성' : '여성'} · {DEPARTMENT_OPTIONS.find((o) => o.value === displayProfile?.department || o.label === displayProfile?.department)?.label ?? displayProfile?.department ?? ''}
              </p>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(236,72,153,.1)', color: '#db2777', border: '1px solid rgba(236,72,153,.2)' }}>
                  {displayProfile?.mbti}
                </span>
              </div>
              {(displayProfile?.personalityTag || displayProfile?.faceTypeTag || displayProfile?.datingStyleTag) && (
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {displayProfile?.personalityTag && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600">
                      {PERSONALITY_TAG_LABELS[displayProfile.personalityTag]}
                    </span>
                  )}
                  {displayProfile?.faceTypeTag && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-600">
                      {FACE_TYPE_TAG_LABELS[displayProfile.faceTypeTag]}
                    </span>
                  )}
                  {displayProfile?.datingStyleTag && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-pink-50 text-pink-600">
                      {DATING_STYLE_TAG_LABELS[displayProfile.datingStyleTag]}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Stats row */}
          <div className="flex border-t border-slate-200/60 py-3.5">
            {[
              { label: '노출 횟수', value: String(displayProfile?.exposureCount ?? 0), cls: 'text-blue-500' },
              { label: '보낸 신청', value: '-', cls: 'gt' },
              { label: '매칭 성공', value: '-', cls: 'wt' },
            ].map(({ label, value, cls }, i) => (
              <div key={label} className="flex-1 text-center" style={{ borderRight: i < 2 ? '1px solid rgba(226,232,240,.6)' : 'none' }}>
                <p className={`font-display text-[26px] leading-none ${cls}`}>{value}</p>
                <p className="text-[10.5px] text-slate-400 mt-1 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 티켓 카드 — gradient design v4 */}
        {ticketBalance && (
          <div className="grid grid-cols-2 gap-3 mb-3.5">
            <div className="rounded-[18px] p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2563eb, #6366f1)', boxShadow: '0 6px 24px rgba(59,130,246,.3)' }}>
              <div className="absolute -top-2.5 -right-2.5 opacity-[0.12]"><Ticket size={70} className="text-white" /></div>
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <Ticket size={16} className="text-white/80" />
                  <span className="text-xs font-semibold text-white/80">랜덤권</span>
                </div>
                <p className="font-display text-[26px] text-white leading-none">{ticketBalance.randomTicketCount}<span className="text-[10px] font-normal ml-1">장</span></p>
              </div>
            </div>
            <div className="rounded-[18px] p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)', boxShadow: '0 6px 24px rgba(236,72,153,.3)' }}>
              <div className="absolute -top-2.5 -right-2.5 opacity-[0.12]"><Ticket size={70} className="text-white" /></div>
              <div className="relative">
                <div className="flex items-center gap-1.5 mb-2">
                  <Ticket size={16} className="text-white/80" />
                  <span className="text-xs font-semibold text-white/80">이상형권</span>
                </div>
                <p className="font-display text-[26px] text-white leading-none">{ticketBalance.idealTicketCount}<span className="text-[10px] font-normal ml-1">장</span></p>
              </div>
            </div>
          </div>
        )}

        {/* 후보 상태 banner */}
        <div
          onClick={statusConfig.clickable ? () => navigate('/match?view=register') : undefined}
          className={`rounded-[18px] p-[14px_18px] flex items-center gap-3 mb-3 transition-all ${
            statusConfig.clickable ? 'cursor-pointer' : ''
          }`}
          style={{ background: 'linear-gradient(135deg, rgba(59,130,246,.08), rgba(99,102,241,.08))', border: '1px solid rgba(59,130,246,.15)', boxShadow: '0 2px 12px rgba(0,0,0,.04)' }}
        >
          <div className={`w-[42px] h-[42px] rounded-[14px] flex items-center justify-center shrink-0 ${statusConfig.iconBg}`}>
            {statusConfig.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-slate-900 truncate">{statusConfig.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{statusConfig.description}</p>
          </div>
          {statusConfig.clickable && <ChevronRight size={18} className="text-slate-400 shrink-0" />}
          {candidateStatus === 'APPROVED' && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowWithdrawConfirm(true); }}
              className="text-xs text-rose-400 font-medium hover:text-rose-500 transition-colors shrink-0"
            >
              철회
            </button>
          )}
          {candidateStatus === 'PENDING' && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowCancelConfirm(true); }}
              className="text-xs text-rose-400 font-medium hover:text-rose-500 transition-colors shrink-0"
            >
              신청 취소
            </button>
          )}
        </div>

        {/* 활동 섹션 */}
        <p className="text-[11px] font-bold text-slate-400 tracking-[.08em] uppercase mb-2 ml-1">활동</p>
        <div
          className="rounded-[18px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)] mb-5"
          style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,.65)' }}
        >
          {[
            { label: '내 쿠폰', icon: <Ticket size={16} className="text-purple-700" />, bg: 'rgba(139,92,246,.1)', onClick: () => navigate('/coupons') },
            { label: '쿠폰 이벤트', icon: <Ticket size={16} className="text-violet-500" />, bg: 'rgba(139,92,246,.07)', onClick: () => navigate('/coupon-events') },
            { label: '티켓 이력', icon: <History size={16} className="text-green-700" />, bg: 'rgba(34,197,94,.1)', onClick: () => navigate('/tickets/history') },
            { label: 'QR 코드', icon: <QrCode size={16} className="text-slate-700" />, bg: 'rgba(15,23,42,.08)', onClick: () => navigate('/qr') },
          ].map(({ label, icon, bg, onClick }, i, arr) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full p-[15px_18px] flex items-center gap-3 hover:bg-slate-50/80 transition-colors"
              style={{ borderBottom: i < arr.length - 1 ? '1px solid rgba(226,232,240,.6)' : 'none' }}
            >
              <div className="w-[33px] h-[33px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: bg }}>
                {icon}
              </div>
              <span className="flex-1 text-left text-sm font-medium text-slate-700">{label}</span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          ))}
        </div>

        {/* 설정 섹션 */}
        <p className="text-[11px] font-bold text-slate-400 tracking-[.08em] uppercase mb-2 ml-1">설정</p>
        <div
          className="rounded-[18px] overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.05)]"
          style={{ background: 'rgba(255,255,255,.82)', backdropFilter: 'blur(20px) saturate(180%)', border: '1px solid rgba(255,255,255,.65)' }}
        >
          {/* 비밀번호 변경 */}
          <button
            onClick={() => setShowPasswordChange(true)}
            className="w-full p-[15px_18px] flex items-center gap-3 hover:bg-slate-50/80 transition-colors"
            style={{ borderBottom: '1px solid rgba(226,232,240,.6)' }}
          >
            <div className="w-[33px] h-[33px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'rgba(251,191,36,.12)' }}>
              <Lock size={16} className="text-amber-700" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-slate-700">비밀번호 변경</span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          {/* 알림 설정 토글 */}
          {typeof Notification !== 'undefined' && (
            <button
              onClick={() => void handleNotificationToggle()}
              disabled={notifLoading}
              className="w-full p-[15px_18px] flex items-center gap-3 hover:bg-slate-50/80 transition-colors disabled:opacity-60"
              style={{ borderBottom: '1px solid rgba(226,232,240,.6)' }}
            >
              <div className="w-[33px] h-[33px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: notifEnabled ? 'rgba(59,130,246,.1)' : 'rgba(148,163,184,.1)' }}>
                {notifEnabled ? <Bell size={16} className="text-blue-600" /> : <BellOff size={16} className="text-slate-400" />}
              </div>
              <span className="flex-1 text-left text-sm font-medium text-slate-700">푸시 알림</span>
              <div className={`relative w-[46px] h-[27px] rounded-full transition-colors duration-200 shrink-0 ${notifEnabled ? 'bg-blue-600' : 'bg-slate-200'}`} style={{ boxShadow: notifEnabled ? '0 2px 8px rgba(37,99,235,.35)' : 'none' }}>
                <div className={`absolute top-[2.5px] w-[22px] h-[22px] bg-white rounded-full shadow transition-all duration-200 ${notifEnabled ? 'left-[21px]' : 'left-[2.5px]'}`} />
              </div>
            </button>
          )}

          {/* 이용약관 */}
          <button
            onClick={openTerms}
            className="w-full p-[15px_18px] flex items-center gap-3 hover:bg-slate-50/80 transition-colors"
            style={{ borderBottom: '1px solid rgba(226,232,240,.6)' }}
          >
            <div className="w-[33px] h-[33px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'rgba(99,102,241,.1)' }}>
              <Shield size={16} className="text-indigo-500" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-slate-700">이용약관</span>
            <ChevronRight size={14} className="text-slate-400" />
          </button>

          {/* 로그아웃 */}
          <button
            onClick={handleLogout}
            className="w-full p-[15px_18px] flex items-center gap-3 hover:bg-slate-50/80 transition-colors"
          >
            <div className="w-[33px] h-[33px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,.1)' }}>
              <LogOut size={16} className="text-red-600" />
            </div>
            <span className="flex-1 text-left text-sm font-medium text-red-600">로그아웃</span>
          </button>
        </div>

        <p className="text-center text-slate-400 text-[11px] mt-5">Randsome v2.0 · SMU Festival 2026 Archive</p>
      </div>

      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
      >
        {modal.content}
      </Modal>

      <AnimatePresence>
        {showWithdrawConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60]"
              onClick={() => setShowWithdrawConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl w-[calc(100%-2rem)] max-w-[360px]"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">후보 등록 철회</h3>
                <p className="text-sm text-slate-500 mb-2">정말 후보 등록을 철회하시겠어요?</p>
                <p className="text-xs text-rose-400 mb-6">철회 후에는 다시 등록 신청이 필요합니다.</p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowWithdrawConfirm(false)}
                    className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => void handleWithdrawCandidate()}
                    disabled={isWithdrawing}
                    className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:opacity-80 shadow-md shadow-rose-200/40 transition-all disabled:opacity-60"
                  >
                    {isWithdrawing ? '처리 중...' : '철회 확인'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCancelConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-[60]"
              onClick={() => setShowCancelConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl w-[calc(100%-2rem)] max-w-[360px]"
            >
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">후보 등록 신청 취소</h3>
                <p className="text-sm text-slate-500 mb-2">정말 후보 등록 신청을 취소하시겠어요?</p>
                <p className="text-xs text-slate-400 mb-6">취소 후에는 다시 등록 신청이 필요합니다.</p>
                <div className="flex gap-2.5">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
                  >
                    돌아가기
                  </button>
                  <button
                    onClick={() => void handleCancelCandidateRegistration()}
                    disabled={isCancelling}
                    className="flex-1 py-3.5 rounded-2xl bg-rose-500 text-white text-sm font-bold hover:bg-rose-600 active:opacity-80 shadow-md shadow-rose-200/50 transition-all disabled:opacity-60"
                  >
                    {isCancelling ? '처리 중...' : '취소 확인'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditing && (
          <EditProfileSheet
            editForm={editForm}
            setEditForm={setEditForm}
            isSaving={isSaving}
            onSave={() => void handleSave()}
            onClose={() => setIsEditing(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordChange && (
          <PasswordChangeSheet
            userEmail={user?.email ?? ''}
            onClose={() => setShowPasswordChange(false)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
      </div>
    </MobileLayout>
  );
};

interface EditProfileSheetProps {
  editForm: EditForm;
  setEditForm: React.Dispatch<React.SetStateAction<EditForm>>;
  isSaving: boolean;
  onSave: () => void;
  onClose: () => void;
}

const EditProfileSheet: React.FC<EditProfileSheetProps> = ({ editForm, setEditForm, isSaving, onSave, onClose }) => (
  <>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.5 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-[60]"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: 'spring', damping: 28, stiffness: 320 }}
      className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-3xl w-full max-h-[90vh] flex flex-col"
    >
      <div className="px-6 pt-4 pb-3 shrink-0">
        <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
      </div>

      <div className="overflow-y-auto px-6 pb-10 space-y-7">
        {/* MBTI */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">MBTI</p>
          <div className="grid grid-cols-4 gap-1.5">
            {MBTI_OPTIONS.map(({ value }) => (
              <button
                key={value}
                type="button"
                onClick={() => setEditForm((f) => ({ ...f, mbti: value as Mbti }))}
                className={`py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors duration-150 ${
                  editForm.mbti === value
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50'
                    : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        {/* 실명 */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">실명</label>
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white transition-all">
            <User size={15} className="text-slate-300 shrink-0" />
            <input
              value={editForm.legalName}
              onChange={(e) => setEditForm((f) => ({ ...f, legalName: e.target.value }))}
              placeholder="홍길동"
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* 학과 */}
        <SearchableSelect
          label=""
          options={DEPARTMENT_OPTIONS}
          value={editForm.department}
          onChange={(value) => setEditForm((f) => ({ ...f, department: value as Department | '' }))}
          placeholder="학과 선택"
          searchPlaceholder="학과명 검색..."
          className="mb-0"
        />

        {/* 인스타그램 */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">인스타그램</label>
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white transition-all">
            <AtSign size={15} className="text-slate-300 shrink-0" />
            <input
              value={editForm.instagramId}
              onChange={(e) => setEditForm((f) => ({ ...f, instagramId: e.target.value }))}
              placeholder="my_insta  (@ 제외)"
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
            />
          </div>
        </div>

        {/* 한줄 소개 */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">한줄 소개</label>
          <div className="flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-violet-400 focus-within:bg-white transition-all">
            <Smile size={15} className="text-slate-300 shrink-0 mt-0.5" />
            <textarea
              value={editForm.selfIntroduction}
              onChange={(e) => setEditForm((f) => ({ ...f, selfIntroduction: e.target.value }))}
              placeholder="나를 한 마디로 표현하면?"
              rows={2}
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none resize-none placeholder:text-slate-300 leading-relaxed"
            />
          </div>
        </div>

        {/* 이상형 */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">나의 이상형</label>
          <div className="flex items-start gap-3 bg-pink-50/60 rounded-2xl px-4 py-3.5 ring-1 ring-pink-100 focus-within:ring-2 focus-within:ring-pink-400 focus-within:bg-white transition-all">
            <Heart size={15} className="text-pink-300 shrink-0 mt-0.5" />
            <textarea
              value={editForm.idealDescription}
              onChange={(e) => setEditForm((f) => ({ ...f, idealDescription: e.target.value }))}
              placeholder="어떤 사람을 찾고 계신가요?"
              rows={2}
              className="flex-1 bg-transparent text-sm text-slate-800 outline-none resize-none placeholder:text-pink-200 leading-relaxed"
            />
          </div>
        </div>

        {/* 태그 */}
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">나를 표현하는 태그</p>
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">성격</p>
              <div className="flex flex-wrap gap-1.5">
                {PERSONALITY_TAGS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setEditForm((f) => ({ ...f, personalityTag: f.personalityTag === value ? '' : value }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${editForm.personalityTag === value ? 'bg-blue-500 text-white shadow-sm' : 'bg-blue-50 text-blue-500 hover:bg-blue-100'}`}
                  >{label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">외모 스타일</p>
              <div className="flex flex-wrap gap-1.5">
                {FACE_TYPE_TAGS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setEditForm((f) => ({ ...f, faceTypeTag: f.faceTypeTag === value ? '' : value }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${editForm.faceTypeTag === value ? 'bg-violet-500 text-white shadow-sm' : 'bg-violet-50 text-violet-500 hover:bg-violet-100'}`}
                  >{label}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 mb-2">연애 스타일</p>
              <div className="flex flex-wrap gap-1.5">
                {DATING_STYLE_TAGS.map(({ value, label }) => (
                  <button key={value} type="button"
                    onClick={() => setEditForm((f) => ({ ...f, datingStyleTag: f.datingStyleTag === value ? '' : value }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${editForm.datingStyleTag === value ? 'bg-pink-500 text-white shadow-sm' : 'bg-pink-50 text-pink-500 hover:bg-pink-100'}`}
                  >{label}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 허위 프로필 경고 */}
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)' }}>
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs font-medium text-red-500">허위 프로필 작성 시 신고 및 서비스 이용 제한을 받을 수 있습니다.</p>
        </div>

        {/* 저장/취소 버튼 */}
        <div className="flex gap-2.5 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
          >
            취소
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-200/60 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
          >
            {isSaving ? '저장 중...' : '저장하기'}
          </button>
        </div>
      </div>
    </motion.div>
  </>
);

type PwStep = 'send' | 'verify' | 'newpw';

const PasswordChangeSheet: React.FC<{ userEmail: string; onClose: () => void }> = ({
  userEmail,
  onClose,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<PwStep>('send');
  const [code, setCode] = useState('');
  const [emailVerificationToken, setEmailVerificationToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const res = await sendEmailVerificationCode({ email: userEmail });
      if (res.result === 'ERROR') {
        toast(res.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }
      toast('인증 코드를 발송했습니다.', 'success');
      setStep('verify');
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!code) return;
    setIsLoading(true);
    try {
      const res = await verifyEmailCode({ email: userEmail, code }, 'PASSWORD_RESET');
      if (res.result === 'ERROR' || !res.data) {
        toast(res.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }
      setEmailVerificationToken(res.data.emailVerificationToken);
      setStep('newpw');
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (): Promise<void> => {
    if (newPassword !== newPasswordConfirm) {
      toast('비밀번호가 일치하지 않습니다.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      toast('비밀번호는 8자 이상이어야 합니다.', 'error');
      return;
    }
    setIsLoading(true);
    try {
      const res = await updatePassword({ email: userEmail, emailVerificationToken, newPassword });
      if (res.result === 'ERROR') {
        toast(res.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }
      toast('비밀번호가 변경되었습니다.', 'success');
      onClose();
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[60]"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl w-[calc(100%-2rem)] max-w-[430px] max-h-[80vh] flex flex-col"
      >
        <div className="px-6 pt-4 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-slate-900">비밀번호 변경</h3>
            <button onClick={onClose} className="p-2 -mr-2 text-slate-400 hover:text-slate-600" aria-label="닫기">
              <X size={20} />
            </button>
          </div>
          {/* 스텝 인디케이터 */}
          <div className="flex gap-1.5 mt-3">
            {(['send', 'verify', 'newpw'] as PwStep[]).map((s, i) => (
              <div
                key={s}
                className={`h-1 rounded-full flex-1 transition-all ${
                  s === step ? 'bg-blue-500' : i < (['send', 'verify', 'newpw'] as PwStep[]).indexOf(step) ? 'bg-blue-300' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="overflow-y-auto px-6 pb-8 space-y-4">
          {/* Step: send */}
          {step === 'send' && (
            <>
              <div className="text-center py-2">
                <p className="text-sm text-slate-600">
                  아래 이메일로 인증 코드를 발송합니다.
                </p>
                <p className="font-semibold text-slate-900 mt-1 text-sm">{userEmail}</p>
              </div>
              <Button fullWidth size="lg" onClick={() => void handleSendCode()} disabled={isLoading}>
                {isLoading ? '발송 중...' : '인증 코드 받기'}
              </Button>
            </>
          )}

          {/* Step: verify */}
          {step === 'verify' && (
            <>
              <p className="text-xs text-blue-600 font-medium">
                인증 메일이 발송되었습니다. 코드를 입력해주세요.
              </p>
              <a
                href="https://cloud.smu.ac.kr/t/smu.ac.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
              >
                <span>📧</span>
                학교 웹메일 바로가기
                <ExternalLink size={12} />
              </a>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="인증 코드 6자리"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && code) void handleVerifyCode(); }}
                  autoFocus
                  className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                <button
                  onClick={() => void handleVerifyCode()}
                  disabled={!code || isLoading}
                  className="shrink-0 h-[46px] px-4 rounded-2xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all"
                >
                  {isLoading ? '확인 중...' : '확인'}
                </button>
              </div>
              <button
                type="button"
                onClick={() => void handleSendCode()}
                disabled={isLoading}
                className="text-xs text-slate-400 hover:text-blue-500 hover:underline disabled:pointer-events-none"
              >
                인증 코드 재발송
              </button>
            </>
          )}

          {/* Step: newpw */}
          {step === 'newpw' && (
            <>
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> 인증이 완료되었습니다.
              </p>
              <div>
                <label htmlFor="pw-new" className="block text-sm font-semibold text-slate-700 mb-1">새 비밀번호</label>
                <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
                  <input
                    id="pw-new"
                    type={showPw ? 'text' : 'password'}
                    placeholder="8자 이상 입력해주세요"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-white"
                  />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="px-3 text-slate-400" aria-label="비밀번호 보기">
                    {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="pw-confirm" className="block text-sm font-semibold text-slate-700 mb-1">새 비밀번호 확인</label>
                <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
                  <input
                    id="pw-confirm"
                    type={showPwConfirm ? 'text' : 'password'}
                    placeholder="비밀번호를 다시 입력해주세요"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-white"
                  />
                  <button type="button" onClick={() => setShowPwConfirm((v) => !v)} className="px-3 text-slate-400" aria-label="비밀번호 보기">
                    {showPwConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                  <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
                )}
              </div>
              <Button
                fullWidth
                size="lg"
                onClick={() => void handleChangePassword()}
                disabled={!newPassword || !newPasswordConfirm || newPassword !== newPasswordConfirm || isLoading}
              >
                {isLoading ? '변경 중...' : '비밀번호 변경하기'}
              </Button>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
};

export default MyPage;
