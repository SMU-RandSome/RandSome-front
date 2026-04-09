import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { Textarea } from '@/components/ui/Textarea';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { sendEmailVerificationCode, verifyEmailCode } from '@/features/auth/api';
import { login as loginApi } from '@/features/auth/api';
import { getMyProfile } from '@/features/member/api';
import { apiClient, getApiErrorMessage } from '@/lib/axios';
import { DEPARTMENT_OPTIONS } from '@/constants/departments';
import type { MemberCreateRequest, Department, Gender, Mbti, ApiResponse } from '@/types';
import {
  getRealNameErrorMessage,
  validateInstagramId,
  getInstagramIdErrorMessage,
  validateBankAccount,
  getBankAccountErrorMessage,
  getSangmyungEmailErrorMessage,
} from '@/lib/validation';
import {
  ChevronLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ClipboardCheck,
  UserCircle2,
  Sparkles,
  Check,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

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

const BANK_OPTIONS = [
  { value: '국민', label: '국민은행' },
  { value: '신한', label: '신한은행' },
  { value: '우리', label: '우리은행' },
  { value: '하나', label: '하나은행' },
  { value: 'IBK기업', label: 'IBK기업은행' },
  { value: 'NH농협', label: 'NH농협은행' },
  { value: '카카오', label: '카카오뱅크' },
  { value: '토스', label: '토스뱅크' },
  { value: '케이', label: '케이뱅크' },
  { value: 'SC제일', label: 'SC제일은행' },
  { value: '씨티', label: '씨티은행' },
  { value: '새마을', label: '새마을금고' },
  { value: '수협', label: '수협은행' },
  { value: '우체국', label: '우체국' },
];

type SignupStep = 1 | 2 | 3;

type TermsKey = 'service' | 'privacy' | 'refund' | 'disclaimer' | 'profilePublic';

interface TermsItem {
  key: TermsKey;
  label: string;
  required: boolean;
  content: React.ReactNode;
}

const TERMS_ITEMS: TermsItem[] = [
  {
    key: 'service',
    label: '서비스 이용 약관 동의',
    required: true,
    content: (
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>본 서비스는 상명대학교 천안캠퍼스 축제 기간 동안 운영되는 온라인 랜덤 매칭 서비스 <strong>Randsome</strong>입니다.</p>
        <ul className="space-y-2 list-none">
          <li>• 본 서비스는 학생 간의 새로운 인연 형성을 돕기 위한 <strong>축제 이벤트 서비스</strong>입니다.</li>
          <li>• 서비스 이용 대상은 <strong>상명대학교 재학생 또는 휴학생</strong>으로 제한됩니다.</li>
          <li>• 회원은 매칭 후보 등록 및 랜덤 매칭 신청 기능을 이용할 수 있습니다.</li>
          <li>• 매칭은 <strong>랜덤 방식 또는 추천 방식</strong>으로 진행되며 결과에 대한 만족도는 보장되지 않습니다.</li>
          <li>• 허위 정보 입력, 타인 정보 도용, 부적절한 프로필 작성 등의 경우 서비스 이용이 제한될 수 있습니다.</li>
          <li>• 본 서비스는 <strong>축제 기간 동안 한시적으로 운영</strong>되며 행사 종료 후 종료될 수 있습니다.</li>
        </ul>
      </div>
    ),
  },
  {
    key: 'privacy',
    label: '개인정보 수집 및 이용 동의',
    required: true,
    content: (
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>서비스 운영을 위해 다음과 같은 개인정보를 수집합니다.</p>
        <div>
          <p className="font-semibold text-slate-800 mb-1">수집 항목</p>
          <p>학생 이메일, 성별, MBTI, 자기소개, 이상형 정보</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">수집 목적</p>
          <ul className="space-y-1 list-none">
            <li>• 회원 식별 및 서비스 이용 관리</li>
            <li>• 매칭 서비스 제공</li>
            <li>• 부정 이용 방지</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">보관 기간</p>
          <p>서비스 종료 후 일정 기간 내 파기</p>
        </div>
        <p className="text-xs text-slate-400">※ 개인정보 수집 및 이용에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 서비스 이용이 제한될 수 있습니다.</p>
      </div>
    ),
  },
  {
    key: 'refund',
    label: '환불 처리를 위한 정보 제공 동의',
    required: true,
    content: (
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>서비스 운영 중 불가피한 사유로 환불이 필요한 경우를 대비하여 다음 정보를 수집할 수 있습니다.</p>
        <div>
          <p className="font-semibold text-slate-800 mb-1">수집 항목</p>
          <p>실명, 계좌번호</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">환불이 가능한 경우</p>
          <ul className="space-y-1 list-none">
            <li>• 서비스 장애로 인해 매칭이 정상적으로 진행되지 않은 경우</li>
            <li>• 운영자의 판단에 따라 서비스 제공이 불가능한 경우</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">환불이 불가능한 경우</p>
          <ul className="space-y-1 list-none">
            <li>• 단순 변심</li>
            <li>• 매칭 결과에 대한 개인적 불만</li>
            <li>• 사용자의 정보 입력 오류</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">해당 정보는 환불 처리 목적에 한하여 사용되며 관리자에게만 노출됩니다. 환불 처리 완료 또는 서비스 종료 시 즉시 파기됩니다.</p>
      </div>
    ),
  },
  {
    key: 'disclaimer',
    label: '운영 및 면책 동의',
    required: true,
    content: (
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>본 서비스는 <strong>축제 이벤트 성격의 매칭 서비스</strong>로 다음 사항을 안내드립니다.</p>
        <ul className="space-y-2 list-none">
          <li>• 매칭은 <strong>랜덤 알고리즘 또는 추천 방식</strong>으로 진행됩니다.</li>
          <li>• 매칭 결과에 대한 개인적인 만족도는 보장되지 않습니다.</li>
          <li>• 서비스 이용 중 발생하는 개인 간의 문제에 대해서는 운영자가 책임지지 않습니다.</li>
        </ul>
        <div>
          <p className="font-semibold text-slate-800 mb-1">서비스 제한 사유</p>
          <ul className="space-y-1 list-none">
            <li>• 부적절한 프로필 작성</li>
            <li>• 타인에게 불쾌감을 주는 행위</li>
            <li>• 서비스 목적에 맞지 않는 이용</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    key: 'profilePublic',
    label: '매칭 시 프로필 정보 공개 동의',
    required: true,
    content: (
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>매칭 서비스 특성상 다음 정보가 <strong>매칭된 상대방에게 공개될 수 있습니다.</strong></p>
        <ul className="space-y-1 list-none">
          <li>• 닉네임</li>
          <li>• 인스타그램 ID</li>
          <li>• 자기소개</li>
          <li>• MBTI</li>
        </ul>
        <p className="text-xs text-slate-400">해당 정보는 매칭 결과가 생성된 사용자에게만 공개됩니다.</p>
      </div>
    ),
  },
];

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();

  const [step, setStep] = useState<SignupStep>(1);
  const [formData, setFormData] = useState({
    realName: '',
    gender: '',
    mbti: '',
    department: '',
    intro: '',
    idealType: '',
    personalityTag: '',
    faceTypeTag: '',
    datingStyleTag: '',
    emailUsername: '',
    instagramId: '',
    bankName: '',
    bankAccountNumber: '',
    password: '',
    passwordConfirm: '',
    terms: {
      service: false,
      privacy: false,
      refund: false,
      disclaimer: false,
      profilePublic: false,
    },
  });

  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [openTermKey, setOpenTermKey] = useState<TermsKey | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendEmail = async (): Promise<void> => {
    if (!formData.emailUsername.trim()) {
      toast('이메일 아이디를 입력해주세요.', 'error');
      return;
    }
    try {
      const email = `${formData.emailUsername}@sangmyung.kr`;
      await sendEmailVerificationCode({ email });
      setEmailSent(true);
      setVerificationCode('');
      toast('인증 메일이 발송되었습니다.', 'info');
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!verificationCode.trim()) {
      toast('인증코드를 입력해주세요.', 'error');
      return;
    }
    try {
      const email = `${formData.emailUsername}@sangmyung.kr`;
      const res = await verifyEmailCode({ email, code: verificationCode }, 'SIGN_UP');
      if (!res.data) {
        toast(res.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }
      setEmailVerificationToken(res.data.emailVerificationToken);
      setEmailVerified(true);
      toast('이메일 인증이 완료되었습니다!', 'success');
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    }
  };

  const requiredTermsAgreed =
    formData.terms.service &&
    formData.terms.privacy &&
    formData.terms.refund &&
    formData.terms.disclaimer &&
    formData.terms.profilePublic;

  const allTermsAgreed = requiredTermsAgreed;

  const toggleAllTerms = (): void => {
    const next = !allTermsAgreed;
    setFormData((prev) => ({
      ...prev,
      terms: {
        service: next,
        privacy: next,
        refund: next,
        disclaimer: next,
        profilePublic: next,
      },
    }));
  };

  const toggleTerm = (key: TermsKey): void => {
    setFormData((prev) => ({
      ...prev,
      terms: { ...prev.terms, [key]: !prev.terms[key] },
    }));
  };

  // 태그 옵션 (백엔드 enum에 맞춘 목록)
  const PERSONALITY_TAGS = [
    { value: 'ACTIVE', label: '활발한' },
    { value: 'QUIET', label: '조용한' },
    { value: 'AFFECTIONATE', label: '다정한' },
    { value: 'INDEPENDENT', label: '독립적인' },
    { value: 'FUNNY', label: '유머있는' },
    { value: 'SERIOUS', label: '진지한' },
    { value: 'OPTIMISTIC', label: '긍정적인' },
    { value: 'CAREFUL', label: '신중한' },
  ];

  const FACE_TYPE_TAGS = [
    { value: 'PUPPY', label: '강아지상' },
    { value: 'CAT', label: '고양이상' },
    { value: 'BEAR', label: '곰상' },
    { value: 'FOX', label: '여우상' },
    { value: 'RABBIT', label: '토끼상' },
    { value: 'PURE', label: '청순한' },
    { value: 'CHIC', label: '시크한' },
    { value: 'WARM', label: '훈훈한' },
  ];

  const DATING_STYLE_TAGS = [
    { value: 'FREQUENT_CONTACT', label: '자주 연락' },
    { value: 'MODERATE_CONTACT', label: '적당한 연락' },
    { value: 'PLANNED_DATE', label: '계획형 데이트' },
    { value: 'SPONTANEOUS_DATE', label: '즉흥형 데이트' },
    { value: 'SKINSHIP_LOVER', label: '스킨십 많은' },
    { value: 'RESPECTFUL_SPACE', label: '각자 시간 존중' },
    { value: 'EXPRESSIVE', label: '감정 표현 잘함' },
    { value: 'GROW_TOGETHER', label: '함께 성장' },
  ];

  const passwordsMatch = formData.password === formData.passwordConfirm;

  const isStep1Valid =
    emailVerified &&
    formData.password.length >= 8 &&
    passwordsMatch &&
    requiredTermsAgreed;

  const isStep2Valid =
    !!formData.realName &&
    !!formData.gender &&
    !!formData.mbti &&
    !!formData.department &&
    !!formData.instagramId &&
    !!formData.bankName &&
    !!formData.bankAccountNumber;

  const isStep3Valid =
    !!formData.intro &&
    !!formData.idealType &&
    !!formData.personalityTag &&
    !!formData.faceTypeTag &&
    !!formData.datingStyleTag;

  const nextStep = (): void => {
    if (step === 1 && !isStep1Valid) {
      if (!emailVerified) return void toast('이메일 인증이 필요합니다.', 'error');
      if (formData.password.length < 8) return void toast('비밀번호를 8자 이상 입력해주세요.', 'error');
      if (!passwordsMatch) return void toast('비밀번호가 일치하지 않습니다.', 'error');
      if (!requiredTermsAgreed) return void toast('필수 약관에 동의해주세요.', 'error');
      return;
    }
    if (step === 2 && !isStep2Valid) {
      return void toast('모든 정보를 올바르게 입력해주세요.', 'error');
    }
    setStep((s) => (s + 1) as SignupStep);
  };

  const prevStep = (): void => {
    if (step === 1) {
      navigate(-1);
      return;
    }
    setStep((s) => (s - 1) as SignupStep);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isStep3Valid) {
      toast('자기소개와 이상형을 모두 입력해주세요.', 'error');
      return;
    }

    // 추가 유효성 검증 (안전망)
    const email = `${formData.emailUsername}@sangmyung.kr`;
    const emailError = getSangmyungEmailErrorMessage(email);
    if (emailError) {
      toast(emailError, 'error');
      return;
    }

    const nameError = getRealNameErrorMessage(formData.realName);
    if (nameError) {
      toast(nameError, 'error');
      return;
    }

    if (formData.instagramId && !validateInstagramId(formData.instagramId)) {
      const instagramError = getInstagramIdErrorMessage(formData.instagramId);
      toast(instagramError ?? '올바른 인스타그램 ID를 입력해주세요.', 'error');
      return;
    }

    if (!validateBankAccount(formData.bankAccountNumber)) {
      const accountError = getBankAccountErrorMessage(formData.bankAccountNumber);
      toast(accountError ?? '올바른 계좌번호를 입력해주세요.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const body: MemberCreateRequest = {
        emailVerificationToken,
        email,
        password: formData.password,
        legalName: formData.realName,
        gender: formData.gender as Gender,
        mbti: formData.mbti as Mbti,
        department: formData.department as Department,
        instagramId: formData.instagramId || undefined,
        selfIntroduction: formData.intro || undefined,
        idealDescription: formData.idealType || undefined,
        personalityTag: formData.personalityTag,
        faceTypeTag: formData.faceTypeTag,
        datingStyleTag: formData.datingStyleTag,
        agreedToTerms: requiredTermsAgreed,
        bankName: formData.bankName,
        accountNumber: formData.bankAccountNumber,
      };

      const signupRes = await apiClient.post<ApiResponse<null>>('/v1/members/sign-up', body);
      
      // 응답 검증
      if (!signupRes.data || signupRes.data.result === 'ERROR') {
        throw new Error(signupRes.data?.error?.message ?? '회원가입에 실패했습니다');
      }

      // 가입 후 자동 로그인
      const tokenRes = await loginApi({ email: body.email, password: body.password });
      if (!tokenRes.data) {
        toast('회원가입이 완료되었습니다. 로그인해주세요.', 'success');
        navigate('/login');
        return;
      }

      localStorage.setItem('accessToken', tokenRes.data.accessToken);
      localStorage.setItem('refreshToken', tokenRes.data.refreshToken);

      const profileRes = await getMyProfile();
      if (profileRes.data) {
        setUser(profileRes.data);
      }

      toast('회원가입이 완료되었습니다! 환영합니다.', 'success');
      navigate('/home');
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openTerm = TERMS_ITEMS.find((t) => t.key === openTermKey);

  const renderStepIndicator = (): React.ReactNode => (
    <div className="flex items-center gap-1.5 mb-8">
      {[1, 2, 3].map((s) => (
        <div
          key={s}
          className={`h-1 rounded-full transition-all duration-300 ${
            s < step
              ? 'flex-1 bg-blue-400'
              : s === step
              ? 'flex-[2] bg-gradient-to-r from-blue-500 to-indigo-600'
              : 'flex-1 bg-slate-200'
          }`}
        />
      ))}
    </div>
  );

  // 웹 환경에서의 레이아웃
  if (!isPWA) {
    return (
      <div className="w-full min-h-screen bg-white relative overflow-hidden">
        {/* 배경 그라데이션 오브 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-purple-100/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-100/40 to-pink-100/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
          {/* 네비게이션 */}
          <div className="mb-8 flex items-center justify-between">
            <button
              onClick={prevStep}
              className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="뒤로 가기"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-sm font-bold text-blue-600 bg-blue-50 border border-blue-200 px-4 py-2 rounded-full">
              Step {step} / 3
            </div>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* 좌측: 사이드바 (진행 상태) */}
            <div>
              <div className="sticky top-20">
                <h1 className="text-4xl font-black text-slate-900 mb-8">
                  회원가입
                </h1>

                {/* 스텝 진행 표시 */}
                <div className="space-y-3">
                  {[
                    {
                      number: 1,
                      title: '계정 정보',
                      description: '이메일 및 비밀번호',
                    },
                    {
                      number: 2,
                      title: '프로필 정보',
                      description: '기본 정보 입력',
                    },
                    {
                      number: 3,
                      title: '자기 소개',
                      description: '자신을 표현하기',
                    },
                  ].map((item) => (
                    <div
                      key={item.number}
                      className={`p-4 rounded-xl border transition-all ${
                        step === item.number
                          ? 'border-blue-200 bg-blue-50'
                          : step > item.number
                            ? 'border-green-200 bg-green-50'
                            : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold shrink-0 ${
                            step > item.number
                              ? 'bg-green-500 text-white'
                              : step === item.number
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-400 text-white'
                          }`}
                        >
                          {step > item.number ? (
                            <Check size={16} />
                          ) : (
                            item.number
                          )}
                        </div>
                        <div>
                          <p
                            className={`font-bold ${
                              step >= item.number
                                ? 'text-slate-900'
                                : 'text-slate-600'
                            }`}
                          >
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 우측: 폼 영역 */}
            <div className="col-span-2">
              <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl">
                <div className="overflow-y-auto max-h-[calc(100vh-200px)] pr-4">
                  {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                          <ClipboardCheck className="text-blue-600" size={20} />
                          계정 정보를 입력해주세요
                        </h2>
                        <p className="text-sm text-slate-600">상명대 학생 인증이 필요합니다.</p>
                      </div>

                      {/* 학교 이메일 인증 */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-white">학교 이메일</label>
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex flex-1 rounded-2xl border bg-white overflow-hidden transition-all ${
                              emailVerified
                                ? 'border-slate-200'
                                : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                            }`}
                          >
                            <input
                              type="text"
                              placeholder="이메일 아이디"
                              value={formData.emailUsername}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  emailUsername: e.target.value,
                                })
                              }
                              disabled={emailVerified}
                              className="flex-1 px-4 py-3.5 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-300 disabled:text-slate-400 min-w-0"
                            />
                            <span className="px-3 flex items-center text-xs font-bold text-slate-400 bg-slate-50 border-l border-slate-200 shrink-0 whitespace-nowrap">
                              @sangmyung.kr
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={handleSendEmail}
                            disabled={
                              emailVerified ||
                              !formData.emailUsername.trim()
                            }
                            className={`shrink-0 h-[50px] px-4 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 ${
                              emailVerified
                                ? 'bg-green-500 text-white'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                          >
                            {emailVerified ? (
                              <Check size={20} />
                            ) : emailSent ? (
                              '재전송'
                            ) : (
                              '인증'
                            )}
                          </button>
                        </div>
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
                        {emailVerified ? (
                          <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                            <CheckCircle2 size={12} /> 인증이
                            완료되었습니다.
                          </p>
                        ) : emailSent && (
                          <div className="space-y-2">
                            <p className="text-xs text-blue-600 font-medium">
                              인증 메일이 발송되었습니다. 코드를
                              입력해주세요.
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                placeholder="인증코드 입력"
                                value={verificationCode}
                                onChange={(e) =>
                                  setVerificationCode(e.target.value)
                                }
                                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyCode}
                                disabled={!verificationCode.trim()}
                                className="shrink-0 h-[46px] px-4 rounded-2xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all"
                              >
                                확인
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* 비밀번호 */}
                      <div className="space-y-4">
                        <div className="relative">
                          <Input
                            label="비밀번호"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="8자 이상 입력해주세요"
                            value={formData.password}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                password: e.target.value,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPassword((v) => !v)
                            }
                            className="absolute right-4 top-10 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>

                        <div className="relative">
                          <Input
                            label="비밀번호 확인"
                            type={
                              showPasswordConfirm
                                ? 'text'
                                : 'password'
                            }
                            placeholder="다시 한번 입력해주세요"
                            value={formData.passwordConfirm}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                passwordConfirm: e.target.value,
                              })
                            }
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowPasswordConfirm((v) => !v)
                            }
                            className="absolute right-4 top-10 text-slate-400 hover:text-slate-600"
                          >
                            {showPasswordConfirm ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>

                        {formData.passwordConfirm.length > 0 && (
                          <div className="flex items-center gap-1.5 px-1">
                            {passwordsMatch &&
                            formData.password.length >= 8 ? (
                              <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} />
                                비밀번호가 일치합니다.
                              </span>
                            ) : (
                              <span className="text-[11px] text-red-500 font-bold">
                                {!passwordsMatch
                                  ? '비밀번호가 일치하지 않습니다.'
                                  : '8자 이상 입력해주세요.'}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 약관 동의 */}
                      <div className="space-y-2">
                        {/* 전체 동의 */}
                        <button
                          type="button"
                          onClick={toggleAllTerms}
                          className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-300 transition-colors"
                        >
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                              allTermsAgreed
                                ? 'bg-blue-600 border-blue-600'
                                : 'border-slate-300'
                            }`}
                          >
                            {allTermsAgreed && (
                              <Check
                                size={12}
                                className="text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-sm">
                            전체 동의
                          </span>
                        </button>

                        <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                          {TERMS_ITEMS.map((item) => (
                            <div
                              key={item.key}
                              className="flex items-center gap-3 px-4 py-3 bg-white"
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  toggleTerm(item.key)
                                }
                                className="flex items-center gap-3 flex-1 text-left"
                              >
                                <div
                                  className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                                    formData.terms[item.key]
                                      ? 'bg-blue-600 border-blue-600'
                                      : 'border-slate-300'
                                  }`}
                                >
                                  {formData.terms[item.key] && (
                                    <Check
                                      size={10}
                                      className="text-white"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                                <span className="text-xs text-slate-700">
                                  {item.label}{' '}
                                  <span
                                    className={`font-bold ${
                                      item.required
                                        ? 'text-blue-500'
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    (
                                    {item.required
                                      ? '필수'
                                      : '선택'}
                                    )
                                  </span>
                                </span>
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenTermKey(item.key)
                                }
                                className="shrink-0 text-slate-400 hover:text-slate-600"
                                aria-label="약관 내용 보기"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                          <UserCircle2 className="text-blue-600" size={20} />
                          프로필 정보를 알려주세요
                        </h2>
                        <p className="text-sm text-slate-400">
                          매칭 및 본인 확인을 위해
                          사용됩니다.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-5">
                        <Input
                          label="실명"
                          placeholder="홍길동"
                          value={formData.realName}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              realName: e.target.value,
                            })
                          }
                          helperText="송금 확인을 위해 정확히 입력해주세요."
                        />

                        <div className="space-y-2">
                          <p className="block text-sm font-semibold text-white">
                            성별
                          </p>
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  gender: 'MALE',
                                })
                              }
                              className={`h-12 rounded-2xl border-2 font-bold transition-all ${
                                formData.gender === 'MALE'
                                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                              남성
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  gender: 'FEMALE',
                                })
                              }
                              className={`h-12 rounded-2xl border-2 font-bold transition-all ${
                                formData.gender === 'FEMALE'
                                  ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                                  : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                              }`}
                            >
                              여성
                            </button>
                          </div>
                        </div>

                        <CustomSelect
                          label="MBTI"
                          options={MBTI_OPTIONS}
                          value={formData.mbti}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              mbti: value,
                            })
                          }
                          placeholder="MBTI를 선택해주세요"
                        />

                        <SearchableSelect
                          label="학과"
                          options={DEPARTMENT_OPTIONS}
                          value={formData.department}
                          onChange={(value) =>
                            setFormData({
                              ...formData,
                              department: value,
                            })
                          }
                          placeholder="학과를 선택해주세요"
                          searchPlaceholder="학과명 검색..."
                        />

                        <Input
                          label="인스타그램 ID"
                          placeholder="아이디만 입력해주세요 (예: randsome_official)"
                          value={formData.instagramId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              instagramId: e.target.value,
                            })
                          }
                        />

                        {/* 환불 계좌 */}
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-slate-700">
                            환불 계좌번호
                          </p>
                          <p className="text-xs text-slate-400 -mt-1">
                            매칭 실패 시 환불을 위해
                            입력해주세요.
                          </p>
                          <SearchableSelect
                            label=""
                            options={BANK_OPTIONS}
                            value={formData.bankName}
                            onChange={(value) =>
                              setFormData({
                                ...formData,
                                bankName: value,
                              })
                            }
                            placeholder="은행 선택"
                            searchPlaceholder="은행명 검색..."
                          />
                          <input
                            type="text"
                            inputMode="numeric"
                            placeholder="계좌번호 (숫자만 입력)"
                            value={formData.bankAccountNumber}
                            onChange={(e) => {
                              const digits = e.target.value.replace(
                                /\D/g,
                                ''
                              );
                              setFormData(prev => ({
                                ...prev,
                                bankAccountNumber: digits,
                              }));
                            }}
                            className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>



                  {step === 3 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                          <Sparkles className="text-blue-600" size={20} />
                          자신을 표현해주세요
                        </h2>
                        <p className="text-sm text-slate-400">
                          매칭 성공률을 높이는 핵심
                          정보입니다!
                        </p>
                      </div>

                      <div className="space-y-5">
                        <Textarea
                          label="자기 소개"
                          placeholder="자신을 표현할 수 있는 멋진 소개글을 작성해주세요! (취미, 관심사, 성격 등)"
                          value={formData.intro}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              intro: e.target.value,
                            })
                          }
                          maxLength={500}
                          className="h-32"
                        />

                        <Textarea
                          label="이상형"
                          placeholder="어떤 사람을 찾고 계신가요? (원하는 성격, 스타일 등 자유롭게!)"
                          value={formData.idealType}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              idealType: e.target.value,
                            })
                          }
                          maxLength={500}
                          className="h-32"
                        />

                        {/* 태그 선택: 성격/얼굴형/연애 스타일 (이상형 매칭에 사용됩니다) */}
                        <div className="mt-4">
                          <p className="text-sm font-semibold text-slate-700 mb-2">프로필 태그</p>
                          <p className="text-xs text-slate-500 mb-3">선택한 태그는 이상형 기반 매칭에 사용됩니다.</p>

                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <p className="text-sm font-semibold text-slate-600 mb-2">성격 태그</p>
                              <div className="flex flex-wrap gap-2">
                                {PERSONALITY_TAGS.map((t) => (
                                  <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, personalityTag: t.value }))}
                                    className={`px-3 py-1 rounded-full text-sm transition-all border ${
                                      formData.personalityTag === t.value
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-blue-50'
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-600 mb-2">얼굴형 태그</p>
                              <div className="flex flex-wrap gap-2">
                                {FACE_TYPE_TAGS.map((t) => (
                                  <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, faceTypeTag: t.value }))}
                                    className={`px-3 py-1 rounded-full text-sm transition-all border ${
                                      formData.faceTypeTag === t.value
                                        ? 'bg-pink-500 text-white border-pink-500'
                                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-pink-50'
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-600 mb-2">연애 스타일 태그</p>
                              <div className="flex flex-wrap gap-2">
                                {DATING_STYLE_TAGS.map((t) => (
                                  <button
                                    key={t.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, datingStyleTag: t.value }))}
                                    className={`px-3 py-1 rounded-full text-sm transition-all border ${
                                      formData.datingStyleTag === t.value
                                        ? 'bg-rose-600 text-white border-rose-600'
                                        : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-rose-50'
                                    }`}
                                  >
                                    {t.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                          <p className="text-xs text-blue-700 leading-relaxed font-medium">
                            💡{' '}
                            <strong>작성 팁:</strong>{' '}
                            상세하게 적을수록 나와 잘
                            맞는 사람을 만날 확률이
                            높아집니다!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 버튼 영역 */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex gap-3">
                  {step > 1 && (
                    <button
                      onClick={prevStep}
                      className="flex-1 h-12 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                    >
                      이전
                    </button>
                  )}
                  <Button
                    fullWidth={step === 1}
                    size="lg"
                    className={`${step === 1 ? 'w-full' : 'flex-[2]'} h-12 text-sm font-bold`}
                    onClick={
                      step === 3 ? handleSubmit : nextStep
                    }
                    disabled={
                      isSubmitting ||
                      (step === 1 && !isStep1Valid) ||
                      (step === 2 && !isStep2Valid) ||
                      (step === 3 && !isStep3Valid)
                    }
                  >
                    {step === 3
                      ? isSubmitting
                        ? '가입 중...'
                        : '가입 완료하기'
                      : '다음 단계'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 약관 상세 모달 (웹) */}
        {openTerm && (
          <div className="fixed inset-0 z-50 flex justify-center items-center px-5">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpenTermKey(null)}
            />
            <div className="relative w-full bg-white flex flex-col max-h-[85vh] max-w-[540px] rounded-3xl">
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {openTerm.label}
                  </h3>
                  <span
                    className={`text-xs font-bold ${
                      openTerm.required
                        ? 'text-blue-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {openTerm.required ? '필수 동의' : '선택 동의'}
                  </span>
                </div>
                <button
                  onClick={() => setOpenTermKey(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                  aria-label="닫기"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="overflow-y-auto px-6 py-4 flex-1">
                {openTerm.content}
              </div>
              <div className="px-6 pb-8 pt-4 border-t border-slate-100 shrink-0">
                <button
                  onClick={() => {
                    toggleTerm(openTerm.key);
                    setOpenTermKey(null);
                  }}
                  className={`w-full h-12 rounded-2xl font-semibold text-sm transition-colors ${
                    formData.terms[openTerm.key]
                      ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {formData.terms[openTerm.key]
                    ? '동의 취소'
                    : '동의하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 모바일 환경에서의 레이아웃
  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center">
          <button
            onClick={prevStep}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 ml-2">회원가입</h1>
          <div className="ml-auto text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Step {step} / 3
          </div>
        </header>
      )}

      <div className={`flex-1 overflow-y-auto p-6 ${isPWA ? 'pb-32' : 'pb-12'}`}>
        {renderStepIndicator()}

        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ClipboardCheck className="text-blue-600" size={20} />
                계정 정보를 입력해주세요
              </h2>
              <p className="text-sm text-slate-600">상명대 학생 인증이 필요합니다.</p>
            </div>

            {/* 학교 이메일 인증 */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-white">학교 이메일</label>
              <div className="flex items-center gap-2">
                <div className={`flex flex-1 rounded-2xl border bg-white overflow-hidden transition-all ${
                  emailVerified
                    ? 'border-slate-200'
                    : 'border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'
                }`}>
                  <input
                    type="text"
                    placeholder="이메일 아이디"
                    value={formData.emailUsername}
                    onChange={(e) => setFormData({ ...formData, emailUsername: e.target.value })}
                    disabled={emailVerified}
                    className="flex-1 px-4 py-3.5 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-300 disabled:text-slate-400 min-w-0"
                  />
                  <span className="px-3 flex items-center text-xs font-bold text-slate-400 bg-slate-50 border-l border-slate-200 shrink-0 whitespace-nowrap">
                    @sangmyung.kr
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={emailVerified || !formData.emailUsername.trim()}
                  className={`shrink-0 h-[50px] px-4 rounded-2xl text-sm font-bold transition-all disabled:opacity-50 ${
                    emailVerified
                      ? 'bg-green-500 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {emailVerified ? <Check size={20} /> : emailSent ? '재전송' : '인증'}
                </button>
              </div>
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
              {emailVerified ? (
                <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} /> 인증이 완료되었습니다.
                </p>
              ) : emailSent && (
                <div className="space-y-2">
                  <p className="text-xs text-blue-600 font-medium">인증 메일이 발송되었습니다. 코드를 입력해주세요.</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="인증코드 입력"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={!verificationCode.trim()}
                      className="shrink-0 h-[46px] px-4 rounded-2xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all"
                    >
                      확인
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 비밀번호 */}
            <div className="space-y-4">
              <div className="relative">
                <Input
                  label="비밀번호"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8자 이상 입력해주세요"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-10 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="비밀번호 확인"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="다시 한번 입력해주세요"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((v) => !v)}
                  className="absolute right-4 top-10 text-slate-400 hover:text-slate-600"
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {formData.passwordConfirm.length > 0 && (
                <div className="flex items-center gap-1.5 px-1">
                  {passwordsMatch && formData.password.length >= 8 ? (
                    <span className="text-[11px] text-green-600 font-bold flex items-center gap-1">
                      <CheckCircle2 size={12} /> 비밀번호가 일치합니다.
                    </span>
                  ) : (
                    <span className="text-[11px] text-red-500 font-bold">
                      {!passwordsMatch ? '비밀번호가 일치하지 않습니다.' : '8자 이상 입력해주세요.'}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="space-y-2">
              {/* 전체 동의 */}
              <button
                type="button"
                onClick={toggleAllTerms}
                className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-blue-300 transition-colors"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  allTermsAgreed ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                }`}>
                  {allTermsAgreed && <Check size={12} className="text-white" strokeWidth={3} />}
                </div>
                <span className="font-bold text-slate-900 text-sm">전체 동의</span>
              </button>

              <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {TERMS_ITEMS.map((item) => (
                  <div key={item.key} className="flex items-center gap-3 px-4 py-3 bg-white">
                    <button
                      type="button"
                      onClick={() => toggleTerm(item.key)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                        formData.terms[item.key]
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300'
                      }`}>
                        {formData.terms[item.key] && (
                          <Check size={10} className="text-white" strokeWidth={3} />
                        )}
                      </div>
                      <span className="text-xs text-slate-700">
                        {item.label}{' '}
                        <span className={`font-bold ${item.required ? 'text-blue-500' : 'text-slate-400'}`}>
                          ({item.required ? '필수' : '선택'})
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenTermKey(item.key)}
                      className="shrink-0 text-slate-400 hover:text-slate-600"
                      aria-label="약관 내용 보기"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <UserCircle2 className="text-blue-600" size={20} />
                프로필 정보를 알려주세요
              </h2>
              <p className="text-sm text-slate-400">매칭 및 본인 확인을 위해 사용됩니다.</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
              <Input
                label="실명"
                placeholder="홍길동"
                value={formData.realName}
                onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
                helperText="송금 확인을 위해 정확히 입력해주세요."
              />

              <div className="space-y-2">
                <p className="block text-sm font-semibold text-white">성별</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'MALE' })}
                    className={`h-12 rounded-2xl border-2 font-bold transition-all ${
                      formData.gender === 'MALE'
                        ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    남성
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'FEMALE' })}
                    className={`h-12 rounded-2xl border-2 font-bold transition-all ${
                      formData.gender === 'FEMALE'
                        ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-sm'
                        : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    여성
                  </button>
                </div>
              </div>

              <CustomSelect
                label="MBTI"
                options={MBTI_OPTIONS}
                value={formData.mbti}
                onChange={(value) => setFormData({ ...formData, mbti: value })}
                placeholder="MBTI를 선택해주세요"
              />

              <SearchableSelect
                label="학과"
                options={DEPARTMENT_OPTIONS}
                value={formData.department}
                onChange={(value) => setFormData({ ...formData, department: value })}
                placeholder="학과를 선택해주세요"
                searchPlaceholder="학과명 검색..."
              />

              <Input
                label="인스타그램 ID"
                placeholder="아이디만 입력해주세요 (예: randsome_official)"
                value={formData.instagramId}
                onChange={(e) => setFormData({ ...formData, instagramId: e.target.value })}
              />

              {/* 환불 계좌 */}
              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-700">환불 계좌번호</p>
                <p className="text-xs text-slate-400 -mt-1">매칭 실패 시 환불을 위해 입력해주세요.</p>
                <SearchableSelect
                  label=""
                  options={BANK_OPTIONS}
                  value={formData.bankName}
                  onChange={(value) => setFormData({ ...formData, bankName: value })}
                  placeholder="은행 선택"
                  searchPlaceholder="은행명 검색..."
                />
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="계좌번호 (숫자만 입력)"
                  value={formData.bankAccountNumber}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setFormData({ ...formData, bankAccountNumber: digits });
                  }}
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="text-blue-600" size={20} />
                자신을 표현해주세요
              </h2>
              <p className="text-sm text-slate-400">매칭 성공률을 높이는 핵심 정보입니다!</p>
            </div>

            <div className="space-y-5">
              <Textarea
                label="자기 소개"
                placeholder="자신을 표현할 수 있는 멋진 소개글을 작성해주세요! (취미, 관심사, 성격 등)"
                value={formData.intro}
                onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
                maxLength={500}
                className="h-32"
              />

              <Textarea
                label="이상형"
                placeholder="어떤 사람을 찾고 계신가요? (원하는 성격, 스타일 등 자유롭게!)"
                value={formData.idealType}
                onChange={(e) => setFormData({ ...formData, idealType: e.target.value })}
                maxLength={500}
                className="h-32"
              />

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  💡 <strong>작성 팁:</strong> 상세하게 적을수록 나와 잘 맞는 사람을 만날 확률이 높아집니다!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {isPWA && (
        <div className="fixed bottom-0 w-full max-w-[430px] p-5 bg-white border-t border-slate-100 z-50">
        <div className="flex gap-3">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="flex-1 h-14 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
            >
              이전
            </button>
          )}
          <Button
            fullWidth
            size="lg"
            className="flex-[2] h-14 text-base font-bold"
            onClick={step === 3 ? handleSubmit : nextStep}
            disabled={
              isSubmitting ||
              (step === 1 && !isStep1Valid) ||
              (step === 2 && !isStep2Valid) ||
              (step === 3 && !isStep3Valid)
            }
          >
            {step === 3 ? (isSubmitting ? '가입 중...' : '가입 완료하기') : '다음 단계'}
          </Button>
        </div>
        </div>
      )}

      {/* 약관 상세 모달 - 모바일 */}
      {isPWA && openTerm && (
        <div className="fixed inset-0 z-50 flex justify-center items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpenTermKey(null)} />
          <div className="relative w-full bg-white flex flex-col max-h-[85vh] max-w-[430px] rounded-t-3xl">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{openTerm.label}</h3>
                <span className={`text-xs font-bold ${openTerm.required ? 'text-blue-500' : 'text-slate-400'}`}>
                  {openTerm.required ? '필수 동의' : '선택 동의'}
                </span>
              </div>
              <button
                onClick={() => setOpenTermKey(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 flex-1">
              {openTerm.content}
            </div>
            <div className="px-6 pb-8 pt-4 border-t border-slate-100 shrink-0">
              <button
                onClick={() => {
                  toggleTerm(openTerm.key);
                  setOpenTermKey(null);
                }}
                className={`w-full h-12 rounded-2xl font-semibold text-sm transition-colors ${
                  formData.terms[openTerm.key]
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {formData.terms[openTerm.key] ? '동의 취소' : '동의하기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
};

export default SignupPage;
