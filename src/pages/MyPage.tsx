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
import { getApiErrorMessage } from '@/lib/axios';
import {
  getRealNameErrorMessage,
  validateInstagramId,
  getInstagramIdErrorMessage,
} from '@/lib/validation';
import { sendEmailVerificationCode, verifyEmailCode } from '@/features/auth/api';
import { registerFcmToken, unregisterFcmToken, FCM_ENABLED_KEY } from '@/hooks/useFcmToken';
import { DEPARTMENT_OPTIONS } from '@/constants/departments';
import type { Department, MemberProfile, Mbti } from '@/types';
import { LogOut, Edit2, ChevronRight, UserCheck, UserX, Clock, AlertCircle, User, AtSign, Smile, Heart, X, Eye, EyeOff, ExternalLink, CheckCircle2, Bell, BellOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
} as const;

const PERSONALITY_TAG_LABELS: Record<string, string> = {
  ACTIVE: '활발한',
  QUIET: '조용한',
  AFFECTIONATE: '다정한',
  INDEPENDENT: '독립적인',
  FUNNY: '유머있는',
  SERIOUS: '진지한',
  OPTIMISTIC: '긍정적인',
  CAREFUL: '신중한',
};

const FACE_TYPE_TAG_LABELS: Record<string, string> = {
  PUPPY: '강아지상',
  CAT: '고양이상',
  BEAR: '곰상',
  FOX: '여우상',
  RABBIT: '토끼상',
  PURE: '청순한',
  CHIC: '시크한',
  WARM: '훈훈한',
};

const DATING_STYLE_TAG_LABELS: Record<string, string> = {
  FREQUENT_CONTACT: '자주 연락',
  MODERATE_CONTACT: '적당한 연락',
  PLANNED_DATE: '계획형 데이트',
  SPONTANEOUS_DATE: '즉흥형 데이트',
  SKINSHIP_LOVER: '스킨십 많은',
  RESPECTFUL_SPACE: '각자 시간 존중',
  EXPRESSIVE: '감정 표현 잘함',
  GROW_TOGETHER: '함께 성장',
};

const MBTI_OPTIONS = [
  { value: 'ISTJ', label: 'ISTJ' },
  { value: 'ISFJ', label: 'ISFJ' },
  { value: 'INFJ', label: 'INFJ' },
  { value: 'INTJ', label: 'INTJ' },
  { value: 'ISTP', label: 'ISTP' },
  { value: 'ISFP', label: 'ISFP' },
  { value: 'INFP', label: 'INFP' },
  { value: 'INTP', label: 'INTP' },
  { value: 'ESTP', label: 'ESTP' },
  { value: 'ESFP', label: 'ESFP' },
  { value: 'ENFP', label: 'ENFP' },
  { value: 'ENTP', label: 'ENTP' },
  { value: 'ESTJ', label: 'ESTJ' },
  { value: 'ESFJ', label: 'ESFJ' },
  { value: 'ENFJ', label: 'ENFJ' },
  { value: 'ENTJ', label: 'ENTJ' },
];

interface EditForm {
  legalName: string;
  mbti: Mbti;
  department: Department | '';
  instagramId: string;
  selfIntroduction: string;
  idealDescription: string;
  personalityTag: string;
  faceTypeTag: string;
  datingStyleTag: string;
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
    personalityTag: (user?.personalityTag as any) ?? '',
    faceTypeTag: (user?.faceTypeTag as any) ?? '',
    datingStyleTag: (user?.datingStyleTag as any) ?? '',
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
            personalityTag: (res.data.personalityTag as any) ?? '',
            faceTypeTag: (res.data.faceTypeTag as any) ?? '',
            datingStyleTag: (res.data.datingStyleTag as any) ?? '',
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
      // 디버그: 전송할 데이터 확인
      console.log('전송할 editForm:', {
        department: editForm.department,
        personalityTag: editForm.personalityTag,
        faceTypeTag: editForm.faceTypeTag,
        datingStyleTag: editForm.datingStyleTag,
      });
      await updateMyProfile({
        legalName: editForm.legalName,
        mbti: editForm.mbti,
        department: editForm.department as Department,
        instagramId: editForm.instagramId || undefined,
        selfIntroduction: editForm.selfIntroduction || undefined,
        idealDescription: editForm.idealDescription || undefined,
        personalityTag: editForm.personalityTag as any,
        faceTypeTag: editForm.faceTypeTag as any,
        datingStyleTag: editForm.datingStyleTag as any,
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
                '본 서비스는 학생 간의 새로운 인연 형성을 돕기 위한 축제 이벤트 서비스입니다.',
                '서비스 이용 대상은 상명대학교 재학생 또는 휴학생으로 제한됩니다.',
                '회원은 매칭 후보 등록 및 랜덤 매칭 신청 기능을 이용할 수 있습니다.',
                '매칭은 랜덤 방식 또는 추천 방식으로 진행되며 결과에 대한 만족도는 보장되지 않습니다.',
                '허위 정보 입력, 타인 정보 도용, 부적절한 프로필 작성 등의 경우 서비스 이용이 제한될 수 있습니다.',
                '본 서비스는 축제 기간 동안 한시적으로 운영되며 행사 종료 후 종료될 수 있습니다.',
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
                <p className="text-slate-500 text-xs">학생 이메일, 성별, MBTI, 자기소개, 이상형 정보</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs mb-1">수집 목적</p>
                <p className="text-slate-500 text-xs">회원 식별 및 서비스 이용 관리 / 매칭 서비스 제공 / 부정 이용 방지</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs mb-1">보관 기간</p>
                <p className="text-slate-500 text-xs">서비스 종료 후 일정 기간 내 파기</p>
              </div>
              <p className="text-xs text-slate-400">※ 개인정보 수집 및 이용에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.</p>
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 3. 환불 처리 정보 */}
          <section>
            <h3 className="font-bold text-slate-900 mb-2">3. 환불 처리를 위한 정보 제공 동의 (필수)</h3>
            <p className="text-slate-500 text-xs mb-2">서비스 운영 중 불가피한 사유로 환불이 필요한 경우를 대비해 실명 및 계좌번호를 수집할 수 있습니다. 해당 정보는 환불 처리 목적에 한하여 사용되며 관리자에게만 노출됩니다.</p>
            <div className="space-y-2">
              <div>
                <p className="font-semibold text-slate-800 text-xs mb-0.5">환불 가능한 경우</p>
                <p className="text-slate-500 text-xs">서비스 장애로 매칭이 정상 진행되지 않은 경우 / 운영자 판단에 따라 서비스 제공이 불가능한 경우</p>
              </div>
              <div>
                <p className="font-semibold text-slate-800 text-xs mb-0.5">환불 불가능한 경우</p>
                <p className="text-slate-500 text-xs">단순 변심 / 매칭 결과에 대한 개인적 불만 / 사용자의 정보 입력 오류</p>
              </div>
            </div>
          </section>

          <div className="h-px bg-slate-100" />

          {/* 4. 운영 및 면책 */}
          <section>
            <h3 className="font-bold text-slate-900 mb-2">4. 운영 및 면책 동의 (필수)</h3>
            <ul className="space-y-1.5">
              {[
                '매칭은 랜덤 알고리즘 또는 추천 방식으로 진행됩니다.',
                '매칭 결과에 대한 개인적인 만족도는 보장되지 않습니다.',
                '서비스 이용 중 발생하는 개인 간의 문제에 대해서는 운영자가 책임지지 않습니다.',
                '부적절한 프로필 작성, 타인에게 불쾌감을 주는 행위 등의 경우 운영자가 서비스를 제한할 수 있습니다.',
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
            <p className="text-slate-500 text-xs mb-2">매칭 서비스 특성상 다음 정보가 매칭된 상대방에게 공개될 수 있습니다.</p>
            <p className="text-slate-500 text-xs mb-2">닉네임 / 인스타그램 ID / 자기소개 / MBTI</p>
            <p className="text-xs text-slate-400">해당 정보는 매칭 결과가 생성된 사용자에게만 공개됩니다.</p>
          </section>
        </div>
      ),
    });
  };

  const displayProfile = profile ?? user;
  const candidateStatus = displayProfile?.candidateRegistrationStatus ?? 'NOT_APPLIED';
  const statusConfig = CANDIDATE_STATUS_CONFIG[candidateStatus];

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">마이페이지</h1>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="로그아웃"
          >
            <LogOut size={20} />
          </button>
        </header>
      )}

      <div className={`flex-1 overflow-y-auto p-5 ${isPWA ? 'pb-24' : 'pb-8'}`}>
        {/* 프로필 카드 */}
        <div className="rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.05)] border border-slate-100/80 mb-6 overflow-hidden">
          {/* 그라디언트 헤더 — morphing orbs */}
          <div className="mesh-hero h-20 relative overflow-hidden">
            {displayProfile?.gender === 'FEMALE' ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/25 to-rose-500/20" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-300/15 to-rose-400/10 rounded-full blur-2xl animate-morph pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-fuchsia-400/12 to-pink-500/8 rounded-full blur-xl animate-morph pointer-events-none" style={{ animationDelay: '-3s' }} />
              </>
            ) : (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/25 to-indigo-600/20" />
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-violet-400/15 to-pink-400/10 rounded-full blur-2xl animate-morph pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-br from-blue-400/12 to-indigo-500/8 rounded-full blur-xl animate-morph pointer-events-none" style={{ animationDelay: '-3s' }} />
              </>
            )}
          </div>
          <div className="bg-white/90 backdrop-blur-sm px-6 pb-6 text-center relative">
            {/* 아바타 — 헤더와 겹치도록 */}
            <div className={`w-20 h-20 -mt-10 mx-auto mb-3 rounded-2xl flex items-center justify-center text-white font-display text-3xl shadow-xl ${displayProfile?.gender === 'FEMALE' ? 'bg-gradient-to-br from-pink-400 to-rose-500 shadow-pink-300/40' : 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-300/40'}`}>
              {(displayProfile?.nickname ?? '?')[0]}
            </div>

          {isEditing ? (
            <div className="text-left -mx-6 -mb-6">
              {/* 상단 그라디언트 바 */}
              <div className="h-0.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 mb-6" />

              <div className="px-6 pb-8 space-y-7">
                {/* MBTI 칩 그리드 */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">MBTI</p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {MBTI_OPTIONS.map(({ value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setEditForm({ ...editForm, mbti: value as Mbti })}
                        className={`py-2.5 rounded-xl text-xs font-bold tracking-wide transition-colors duration-150 ${
                          editForm.mbti === value
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50'
                            : 'bg-slate-100 text-slate-400 hover:bg-slate-200 active:bg-slate-300'
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 실명 */}
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">실명</label>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white transition-all">
                    <User size={15} className="text-slate-300 shrink-0 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      value={editForm.legalName}
                      onChange={(e) => setEditForm({ ...editForm, legalName: e.target.value })}
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
                  onChange={(value) => setEditForm({ ...editForm, department: value as Department | '' })}
                  placeholder="학과 선택"
                  searchPlaceholder="학과명 검색..."
                  className="mb-0"
                />

                {/* 인스타그램 */}
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">인스타그램</label>
                  <div className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-blue-400 focus-within:bg-white transition-all">
                    <AtSign size={15} className="text-slate-300 shrink-0 group-focus-within:text-blue-400 transition-colors" />
                    <input
                      value={editForm.instagramId}
                      onChange={(e) => setEditForm({ ...editForm, instagramId: e.target.value })}
                      placeholder="my_insta  (@ 제외)"
                      className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </div>
                </div>

                {/* 한줄 소개 */}
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">한줄 소개</label>
                  <div className="flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-3.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-violet-400 focus-within:bg-white transition-all">
                    <Smile size={15} className="text-slate-300 shrink-0 mt-0.5 group-focus-within:text-violet-400 transition-colors" />
                    <textarea
                      value={editForm.selfIntroduction}
                      onChange={(e) => setEditForm({ ...editForm, selfIntroduction: e.target.value })}
                      placeholder="나를 한 마디로 표현하면?"
                      rows={2}
                      className="flex-1 bg-transparent text-sm text-slate-800 outline-none resize-none placeholder:text-slate-300 leading-relaxed"
                    />
                  </div>
                </div>

                {/* 이상형 */}
                <div className="group">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">나의 이상형</label>
                  <div className="flex items-start gap-3 bg-pink-50/60 rounded-2xl px-4 py-3.5 ring-1 ring-pink-100 focus-within:ring-2 focus-within:ring-pink-400 focus-within:bg-white transition-all">
                    <Heart size={15} className="text-pink-300 shrink-0 mt-0.5 group-focus-within:text-pink-500 transition-colors" />
                    <textarea
                      value={editForm.idealDescription}
                      onChange={(e) => setEditForm({ ...editForm, idealDescription: e.target.value })}
                      placeholder="어떤 사람을 찾고 계신가요?"
                      rows={2}
                      className="flex-1 bg-transparent text-sm text-slate-800 outline-none resize-none placeholder:text-pink-200 leading-relaxed"
                    />
                  </div>
                </div>

                {/* 나를 표현하는 태그 */}
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">나를 표현하는 태그</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">성격</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(PERSONALITY_TAG_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, personalityTag: editForm.personalityTag === value ? '' : value })}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
                              editForm.personalityTag === value
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'bg-blue-50 text-blue-500 hover:bg-blue-100'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">외모 스타일</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(FACE_TYPE_TAG_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, faceTypeTag: editForm.faceTypeTag === value ? '' : value })}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
                              editForm.faceTypeTag === value
                                ? 'bg-violet-500 text-white shadow-sm'
                                : 'bg-violet-50 text-violet-500 hover:bg-violet-100'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 mb-2">연애 스타일</p>
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(DATING_STYLE_TAG_LABELS).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setEditForm({ ...editForm, datingStyleTag: editForm.datingStyleTag === value ? '' : value })}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors duration-150 ${
                              editForm.datingStyleTag === value
                                ? 'bg-pink-500 text-white shadow-sm'
                                : 'bg-pink-50 text-pink-500 hover:bg-pink-100'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 버튼 */}
                <div className="flex gap-2.5 pt-1">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3.5 rounded-2xl border-2 border-slate-200 text-slate-500 text-sm font-bold hover:bg-slate-50 transition-all"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold shadow-lg shadow-blue-200/60 hover:shadow-xl hover:shadow-blue-200/60 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:scale-100"
                  >
                    {isSaving ? '저장 중...' : '저장하기'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{displayProfile?.nickname}</h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                  {displayProfile?.mbti}
                </span>
                {displayProfile?.department && (
                  <span className="inline-block px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">
                    {DEPARTMENT_OPTIONS.find((option) => option.value === displayProfile.department)?.label ?? displayProfile.department}
                  </span>
                )}
                {displayProfile?.gender && (
                  <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${displayProfile.gender === 'MALE' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                    {displayProfile.gender === 'MALE' ? '남성' : '여성'}
                  </span>
                )}
                {candidateStatus === 'APPROVED' && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">
                    후보자
                  </span>
                )}
                {candidateStatus === 'PENDING' && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-600 text-xs font-bold rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                    승인 대기중
                  </span>
                )}
              </div>

              <div className="text-left space-y-3 mb-6">
                <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">한줄 소개</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {displayProfile?.selfIntroduction
                      ? `"${displayProfile.selfIntroduction}"`
                      : <span className="text-slate-300 italic">소개글을 작성해주세요</span>}
                  </p>
                </div>
                <div className="p-4 rounded-2xl border border-pink-100 bg-pink-50/40">
                  <p className="text-[10px] font-bold text-pink-400 uppercase tracking-wider mb-1.5">나의 이상형</p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {displayProfile?.idealDescription ?? <span className="text-slate-300 italic">이상형을 작성해주세요</span>}
                  </p>
                </div>
                {(displayProfile?.personalityTag || displayProfile?.faceTypeTag || displayProfile?.datingStyleTag) && (
                  <div className="px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50/50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">나를 표현하는 태그</p>
                    <div className="flex flex-wrap gap-1.5">
                      {displayProfile.personalityTag && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {PERSONALITY_TAG_LABELS[displayProfile.personalityTag] ?? displayProfile.personalityTag}
                        </span>
                      )}
                      {displayProfile.faceTypeTag && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
                          {FACE_TYPE_TAG_LABELS[displayProfile.faceTypeTag] ?? displayProfile.faceTypeTag}
                        </span>
                      )}
                      {displayProfile.datingStyleTag && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700">
                          {DATING_STYLE_TAG_LABELS[displayProfile.datingStyleTag] ?? displayProfile.datingStyleTag}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mx-auto flex items-center gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} /> 프로필 수정
              </Button>
            </>
          )}
          </div>
        </div>

        {/* 후보 상태 */}
        <div
          onClick={statusConfig.clickable ? () => navigate('/match') : undefined}
          className={`bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-[0_1px_12px_rgba(0,0,0,0.04)] border border-slate-100/80 mb-5 flex items-center justify-between transition-all duration-200 ${
            statusConfig.clickable ? 'cursor-pointer hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 active:scale-[0.99]' : ''
          }`}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${statusConfig.iconBg}`}>
              {statusConfig.icon}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900 truncate">{statusConfig.title}</p>
              <p className="text-xs text-slate-400 truncate">{statusConfig.description}</p>
            </div>
          </div>
          {statusConfig.clickable && <ChevronRight size={16} className="text-slate-300 shrink-0" />}
          {candidateStatus === 'APPROVED' && (
            <div className="flex items-center gap-2 shrink-0 ml-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 rounded-lg">
                <Eye size={12} className="text-blue-500" />
                <span className="text-xs font-bold text-blue-600">노출 {displayProfile?.exposureCount ?? 0}회</span>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setShowWithdrawConfirm(true); }}
                className="text-xs text-rose-400 font-medium hover:text-rose-500 transition-colors"
              >
                철회
              </button>
            </div>
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

        {/* 메뉴 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-100/80 shadow-[0_1px_12px_rgba(0,0,0,0.04)] overflow-hidden divide-y divide-slate-50">
          {[
            { label: '비밀번호 변경', onClick: () => setShowPasswordChange(true) },
            { label: '이용약관', onClick: openTerms },
            { label: '개발팀 소개', onClick: () => navigate('/about') },
          ].map(({ label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors"
            >
              <span className="text-slate-700 font-medium text-sm">{label}</span>
              <ChevronRight size={16} className="text-slate-300" />
            </button>
          ))}

          {/* 알림 설정 토글 */}
          {typeof Notification !== 'undefined' && (
            <button
              onClick={() => void handleNotificationToggle()}
              disabled={notifLoading}
              className="w-full p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors disabled:opacity-60"
            >
              <div className="flex items-center gap-3">
                {notifEnabled ? (
                  <Bell size={16} className="text-blue-500" />
                ) : (
                  <BellOff size={16} className="text-slate-400" />
                )}
                <div className="text-left">
                  <span className="text-slate-700 font-medium text-sm">푸시 알림</span>
                </div>
              </div>
              {/* 토글 스위치 */}
              <div
                className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
                  notifEnabled ? 'bg-blue-500' : 'bg-slate-200'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    notifEnabled ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
            </button>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">Randsome v1.0.0</p>
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
                <p className="text-xs text-slate-400 mb-6">취소 시 결제 정보도 함께 취소됩니다.</p>
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
        {showPasswordChange && (
          <PasswordChangeSheet
            userEmail={user?.email ?? ''}
            onClose={() => setShowPasswordChange(false)}
          />
        )}
      </AnimatePresence>

      <BottomNav />
    </MobileLayout>
  );
};

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
