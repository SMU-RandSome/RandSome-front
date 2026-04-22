import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Orbs } from '@/components/ui/Orbs';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { sendEmailVerificationCode, verifyEmailCode } from '@/features/auth/api';
import { login as loginApi } from '@/features/auth/api';
import { getMyProfile } from '@/features/member/api';
import { apiClient, getApiErrorMessage } from '@/lib/axios';
import { DEPARTMENT_OPTIONS } from '@/constants/departments';
import { MBTI_OPTIONS, PERSONALITY_TAGS, FACE_TYPE_TAGS, DATING_STYLE_TAGS } from '@/constants/tags';
import type { MemberCreateRequest, Gender, Mbti, Department, PersonalityTag, FaceTypeTag, DatingStyleTag } from '@/types';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Check,
  X,
  ChevronRight,
  ExternalLink,
  Heart,
  AlertCircle,
} from 'lucide-react';
import { MobileHeader } from '@/components/layout/MobileHeader';

type SignupStep = 1 | 2 | 3;

type TermsKey = 'service' | 'privacy' | 'thirdParty' | 'disclaimer' | 'profilePublic';

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
          <li>• 본 서비스는 <strong>비영리 목적의 이벤트성 서비스</strong>로, 학생 간 교류 및 인연 형성을 지원하기 위해 제공됩니다.</li>
          <li>• 이용 대상은 <strong>상명대학교 천안캠퍼스 재학생 및 휴학생</strong>으로 제한됩니다.</li>
          <li>• 회원은 매칭 후보 등록 및 랜덤 매칭 신청 기능을 이용할 수 있습니다.</li>
          <li>• 매칭은 <strong>랜덤 알고리즘 또는 추천 방식</strong>으로 진행되며, 결과에 대한 개인적 만족도는 보장되지 않습니다.</li>
          <li>• 허위 정보 입력, 타인 정보 도용, 부적절한 프로필 작성 등 이용 목적에 어긋나는 행위가 확인될 경우 서비스 이용이 제한되거나 계정이 정지될 수 있습니다.</li>
          <li>• 본 서비스는 <strong>축제 기간 동안 한시적으로 운영</strong>되며, 행사 종료 후 서비스 운영이 종료됩니다.</li>
          <li>• 본 서비스는 <strong>무료로 제공</strong>되며, 별도의 결제 또는 환불 절차는 존재하지 않습니다.</li>
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
        <p>본 서비스는 개인정보 보호법에 따라 다음과 같이 개인정보를 수집·이용합니다.</p>
        <div>
          <p className="font-semibold text-slate-800 mb-1">수집 항목</p>
          <p>학교 이메일, 성별, MBTI, 자기소개, 이상형 정보</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">수집 및 이용 목적</p>
          <ul className="space-y-1 list-none">
            <li>• 회원 식별 및 서비스 이용 관리</li>
            <li>• 매칭 서비스 제공</li>
            <li>• 부정 이용 방지 및 서비스 운영 관리</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">보유 및 이용 기간</p>
          <p>서비스 종료 시 지체 없이 파기를 원칙으로 합니다. 단, 관련 법령에 따라 보존이 필요한 경우 해당 기간 동안 보관 후 파기합니다.</p>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">이용자 권리</p>
          <ul className="space-y-1 list-none">
            <li>• 개인정보 열람</li>
            <li>• 정정 및 삭제</li>
            <li>• 처리 정지 요청</li>
          </ul>
        </div>
        <p className="text-xs text-slate-400">※ 이용자는 개인정보 수집 및 이용에 동의하지 않을 권리가 있으며, 동의하지 않을 경우 서비스 이용이 제한됩니다.</p>
      </div>
    ),
  },
  {
    key: 'thirdParty',
    label: '개인정보 처리 위탁 및 제3자 제공 동의',
    required: true,
    content: (
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>본 서비스는 이용자의 개인정보를 외부에 제공하지 않습니다.</p>
        <p>다만, 서비스 운영을 위해 다음과 같은 업무를 위탁할 수 있습니다.</p>
        <ul className="space-y-1 list-none">
          <li>• 서버 및 데이터 저장 (클라우드 서비스)</li>
          <li>• 이메일 발송 서비스</li>
        </ul>
        <p className="text-xs text-slate-400">※ 위탁된 업무는 관련 법령에 따라 안전하게 관리됩니다.</p>
      </div>
    ),
  },
  {
    key: 'disclaimer',
    label: '운영 정책 및 책임 범위 동의',
    required: true,
    content: (
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>본 서비스는 <strong>축제 이벤트 성격의 매칭 서비스</strong>로 다음 사항을 안내드립니다.</p>
        <ul className="space-y-2 list-none">
          <li>• 매칭은 <strong>시스템에 의해 자동</strong>으로 이루어지며, 결과의 정확성 또는 만족도를 보장하지 않습니다.</li>
          <li>• 이용자 간의 대화, 만남 등에서 발생하는 문제는 <strong>당사자 간 해결</strong>을 원칙으로 합니다.</li>
          <li>• 운영자는 이용자 간 분쟁에 직접 개입하지 않습니다. 단, 운영자의 고의 또는 중대한 과실이 있는 경우에는 관련 법령에 따라 책임을 질 수 있습니다.</li>
        </ul>
        <div>
          <p className="font-semibold text-slate-800 mb-1">서비스 이용 제한 사유</p>
          <ul className="space-y-1 list-none">
            <li>• 허위 정보 입력 또는 타인 사칭</li>
            <li>• 타인에게 불쾌감을 주는 행위 (욕설, 성희롱 등)</li>
            <li>• 서비스 목적에 부합하지 않는 이용</li>
            <li>• 기타 운영 정책 위반</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    key: 'profilePublic',
    label: '프로필 정보 공개 동의',
    required: true,
    content: (
      <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
        <p>서비스 특성상 매칭된 상대방에게 다음 정보가 공개될 수 있습니다.</p>
        <div>
          <p className="font-semibold text-slate-800 mb-1">공개 항목</p>
          <ul className="space-y-1 list-none">
            <li>• 닉네임</li>
            <li>• 인스타그램 ID (선택 입력)</li>
            <li>• 자기소개</li>
            <li>• MBTI</li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-slate-800 mb-1">공개 범위</p>
          <p>해당 정보는 <strong>매칭이 성사된 사용자에게만</strong> 제한적으로 공개되며, 제3자에게 별도로 제공되지 않습니다.</p>
        </div>
        <p className="text-xs text-slate-400">※ 이용자는 프로필 작성 시 타인의 개인정보를 포함하지 않아야 하며, 이를 위반할 경우 운영자는 해당 정보를 수정·삭제하거나 서비스 이용을 제한할 수 있습니다.</p>
      </div>
    ),
  },
];

/* Glass input inline style */
const glassInputStyle: React.CSSProperties = {
  padding: '13px 16px',
  borderRadius: 14,
  background: 'rgba(255,255,255,.85)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(219,234,254,.9)',
  fontSize: 14,
  color: '#1e293b',
  outline: 'none',
  width: '100%',
  transition: 'border-color .2s, box-shadow .2s',
};

const glassInputFocusRing = '0 0 0 3px rgba(59,130,246,.12)';

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#94a3b8',
  fontWeight: 700,
  letterSpacing: '.08em',
  textTransform: 'uppercase' as const,
  marginBottom: 6,
  display: 'block',
};

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { isPWA } = useDisplayMode();
  const { toast } = useToast();

  const [step, setStep] = useState<SignupStep>(1);
  const [formData, setFormData] = useState<{
    realName: string;
    gender: string;
    mbti: string;
    department: string;
    intro: string;
    idealType: string;
    emailUsername: string;
    instagramId: string;
    password: string;
    passwordConfirm: string;
    personalityTag: PersonalityTag | '';
    faceTypeTag: FaceTypeTag | '';
    datingStyleTag: DatingStyleTag | '';
    terms: { service: boolean; privacy: boolean; thirdParty: boolean; disclaimer: boolean; profilePublic: boolean };
  }>({
    realName: '',
    gender: '',
    mbti: '',
    department: '',
    intro: '',
    idealType: '',
    emailUsername: '',
    instagramId: '',
    password: '',
    passwordConfirm: '',
    personalityTag: '',
    faceTypeTag: '',
    datingStyleTag: '',
    terms: { service: false, privacy: false, thirdParty: false, disclaimer: false, profilePublic: false },
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
    if (!formData.emailUsername.trim()) { toast('이메일 아이디를 입력해주세요.', 'error'); return; }
    try {
      await sendEmailVerificationCode({ email: `${formData.emailUsername}@sangmyung.kr` });
      setEmailSent(true); setVerificationCode(''); toast('인증 메일이 발송되었습니다.', 'info');
    } catch (err) { toast(getApiErrorMessage(err), 'error'); }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!verificationCode.trim()) { toast('인증코드를 입력해주세요.', 'error'); return; }
    try {
      const res = await verifyEmailCode({ email: `${formData.emailUsername}@sangmyung.kr`, code: verificationCode }, 'SIGN_UP');
      if (!res.data) { toast(res.error?.message ?? '오류가 발생했습니다.', 'error'); return; }
      setEmailVerificationToken(res.data.emailVerificationToken); setEmailVerified(true); toast('이메일 인증이 완료되었습니다!', 'success');
    } catch (err) { toast(getApiErrorMessage(err), 'error'); }
  };

  const requiredTermsAgreed = formData.terms.service && formData.terms.privacy && formData.terms.thirdParty && formData.terms.disclaimer && formData.terms.profilePublic;
  const allTermsAgreed = requiredTermsAgreed;

  const toggleAllTerms = (): void => {
    const next = !allTermsAgreed;
    setFormData((prev) => ({ ...prev, terms: { service: next, privacy: next, thirdParty: next, disclaimer: next, profilePublic: next } }));
  };

  const toggleTerm = (key: TermsKey): void => {
    setFormData((prev) => ({ ...prev, terms: { ...prev.terms, [key]: !prev.terms[key] } }));
  };

  const passwordsMatch = formData.password === formData.passwordConfirm;
  const isStep1Valid = emailVerified && formData.password.length >= 8 && passwordsMatch && requiredTermsAgreed;
  const isStep2Valid = !!formData.realName && !!formData.gender && !!formData.mbti && !!formData.department;
  const isStep3Valid = !!formData.intro && !!formData.idealType && !!formData.personalityTag && !!formData.faceTypeTag && !!formData.datingStyleTag;

  const nextStep = (): void => {
    if (step === 1 && !isStep1Valid) {
      if (!emailVerified) return void toast('이메일 인증이 필요합니다.', 'error');
      if (formData.password.length < 8) return void toast('비밀번호를 8자 이상 입력해주세요.', 'error');
      if (!passwordsMatch) return void toast('비밀번호가 일치하지 않습니다.', 'error');
      if (!requiredTermsAgreed) return void toast('필수 약관에 동의해주세요.', 'error');
      return;
    }
    if (step === 2 && !isStep2Valid) return void toast('모든 정보를 올바르게 입력해주세요.', 'error');
    setStep((s) => (s + 1) as SignupStep);
  };

  const prevStep = (): void => { if (step === 1) { navigate(-1); return; } setStep((s) => (s - 1) as SignupStep); };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!isStep3Valid) { toast('자기소개와 이상형을 모두 입력해주세요.', 'error'); return; }
    setIsSubmitting(true);
    try {
      const body: MemberCreateRequest = {
        emailVerificationToken, email: `${formData.emailUsername}@sangmyung.kr`, password: formData.password,
        legalName: formData.realName, gender: formData.gender as Gender, mbti: formData.mbti as Mbti,
        department: formData.department as Department, instagramId: formData.instagramId || undefined,
        selfIntroduction: formData.intro || undefined, idealDescription: formData.idealType || undefined,
        personalityTag: formData.personalityTag || undefined, faceTypeTag: formData.faceTypeTag || undefined,
        datingStyleTag: formData.datingStyleTag || undefined, agreedToTerms: requiredTermsAgreed,
      };
      await apiClient.post('/v1/members/sign-up', body);
      try {
        const tokenRes = await loginApi({ email: body.email, password: body.password });
        if (!tokenRes.data) { toast('회원가입이 완료되었습니다. 로그인해주세요.', 'success'); navigate('/login'); return; }
        localStorage.setItem('accessToken', tokenRes.data.accessToken);
        localStorage.setItem('refreshToken', tokenRes.data.refreshToken);
        const profileRes = await getMyProfile();
        if (profileRes.data) setUser(profileRes.data);
        toast('회원가입이 완료되었습니다! 환영합니다.', 'success'); navigate('/home');
      } catch { toast('회원가입이 완료되었습니다. 로그인해주세요.', 'success'); navigate('/login'); }
    } catch (err) { toast(getApiErrorMessage(err), 'error'); } finally { setIsSubmitting(false); }
  };

  const openTerm = TERMS_ITEMS.find((t) => t.key === openTermKey);

  const gradientBtnBase: React.CSSProperties = {
    background: 'linear-gradient(135deg, #2563eb, #6366f1)', color: '#fff', borderRadius: 16, fontWeight: 700,
    border: 'none', cursor: 'pointer', position: 'relative', overflow: 'hidden',
  };

  return (
    <MobileLayout className="!bg-transparent">
      <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
        <Orbs />

        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <MobileHeader
          title="회원가입"
          onBack={prevStep}
          right={<span className="text-xs font-bold text-blue-600">Step {step} / 3</span>}
        />

        <div className="flex gap-2 px-4 sm:px-5 py-3">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 rounded-full" style={{ height: 4, background: s <= step ? 'linear-gradient(135deg, #2563eb, #6366f1)' : 'rgba(226,232,240,.8)', transition: 'background .3s' }} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-5 pb-36 sm:pb-40 relative z-10">
          {step === 1 && (
            <div className="space-y-6 pt-4">
              <div>
                <h2 className="font-display text-[22px] text-slate-900">🗂 계정 정보를 입력해주세요</h2>
                <p className="text-[13px] text-slate-500 mt-1">상명대 학생 인증이 필요합니다.</p>
              </div>

              <div className="space-y-3">
                <span style={labelStyle}>학교 이메일</span>
                <div className="flex items-center gap-2">
                  <div className="flex flex-1 items-center overflow-hidden" style={{ borderRadius: 14, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(10px)', border: emailVerified ? '1px solid rgba(34,197,94,.4)' : '1px solid rgba(219,234,254,.9)' }}>
                    <input type="text" placeholder="이메일 아이디" value={formData.emailUsername} onChange={(e) => setFormData({ ...formData, emailUsername: e.target.value })} disabled={emailVerified} className="flex-1 min-w-0 bg-transparent placeholder:text-slate-300 disabled:text-slate-400" style={{ padding: '13px 16px', fontSize: 14, color: '#1e293b', outline: 'none' }} />
                    <span className="shrink-0 whitespace-nowrap text-xs font-bold text-slate-400 px-3" style={{ borderLeft: '1px solid rgba(219,234,254,.9)', background: 'rgba(248,250,255,.6)', padding: '13px 12px' }}>@sangmyung.kr</span>
                  </div>
                  <button type="button" onClick={handleSendEmail} disabled={emailVerified || !formData.emailUsername.trim()} className="shrink-0 text-sm font-bold text-white disabled:opacity-50 transition-all" style={{ ...gradientBtnBase, height: 48, padding: '0 16px', ...(emailVerified ? { background: 'linear-gradient(135deg, #22c55e, #16a34a)' } : {}) }}>
                    {emailVerified ? <Check size={20} /> : emailSent ? '재전송' : '인증'}
                  </button>
                </div>
                <a href="https://cloud.smu.ac.kr/t/smu.ac.kr" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">🏫 학교 웹메일 바로가기 <ExternalLink size={12} /></a>
                {emailVerified ? (
                  <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> 인증이 완료되었습니다.</p>
                ) : emailSent && (
                  <div className="space-y-2">
                    <p className="text-xs text-blue-600 font-medium">인증 메일이 발송되었습니다. 코드를 입력해주세요.</p>
                    <div className="flex items-center gap-2">
                      <input type="text" placeholder="인증코드 입력" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} style={glassInputStyle} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,.5)'; e.currentTarget.style.boxShadow = glassInputFocusRing; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(219,234,254,.9)'; e.currentTarget.style.boxShadow = 'none'; }} />
                      <button type="button" onClick={handleVerifyCode} disabled={!verificationCode.trim()} className="shrink-0 text-sm font-bold text-white disabled:opacity-50 transition-all" style={{ ...gradientBtnBase, height: 46, padding: '0 16px' }}>확인</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="signup-password" style={labelStyle}>비밀번호</label>
                  <div className="relative">
                    <input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="8자 이상 입력해주세요" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="placeholder:text-slate-300" style={glassInputStyle} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,.5)'; e.currentTarget.style.boxShadow = glassInputFocusRing; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(219,234,254,.9)'; e.currentTarget.style.boxShadow = 'none'; }} />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
                <div>
                  <label htmlFor="signup-password-confirm" style={labelStyle}>비밀번호 확인</label>
                  <div className="relative">
                    <input id="signup-password-confirm" type={showPasswordConfirm ? 'text' : 'password'} placeholder="다시 한번 입력해주세요" value={formData.passwordConfirm} onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })} className="placeholder:text-slate-300" style={glassInputStyle} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,.5)'; e.currentTarget.style.boxShadow = glassInputFocusRing; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(219,234,254,.9)'; e.currentTarget.style.boxShadow = 'none'; }} />
                    <button type="button" onClick={() => setShowPasswordConfirm((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">{showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
                {formData.passwordConfirm.length > 0 && (
                  <div className="flex items-center gap-1.5 px-1">
                    {passwordsMatch && formData.password.length >= 8
                      ? <span className="text-[11px] text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> 비밀번호가 일치합니다.</span>
                      : <span className="text-[11px] text-red-500 font-bold">{!passwordsMatch ? '비밀번호가 일치하지 않습니다.' : '8자 이상 입력해주세요.'}</span>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <button type="button" onClick={toggleAllTerms} className="w-full flex items-center gap-3 p-4 transition-colors" style={{ borderRadius: 16, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(10px)', border: allTermsAgreed ? '2px solid #6366f1' : '2px solid rgba(219,234,254,.9)' }}>
                  <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors" style={{ background: allTermsAgreed ? 'linear-gradient(135deg, #2563eb, #6366f1)' : 'rgba(255,255,255,.6)', border: allTermsAgreed ? 'none' : '2px solid rgba(203,213,225,.6)' }}>
                    {allTermsAgreed && <Check size={13} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className="font-bold text-slate-900 text-sm">전체 동의</span>
                </button>
                <div className="overflow-hidden divide-y" style={{ borderRadius: 16, background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(219,234,254,.9)' }}>
                  {TERMS_ITEMS.map((item) => (
                    <div key={item.key} className="flex items-center gap-3 px-4 py-3" style={{ borderColor: 'rgba(219,234,254,.5)' }}>
                      <button type="button" onClick={() => toggleTerm(item.key)} className="flex items-center gap-3 flex-1 text-left">
                        <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-colors" style={{ background: formData.terms[item.key] ? 'linear-gradient(135deg, #2563eb, #6366f1)' : 'rgba(255,255,255,.6)', border: formData.terms[item.key] ? 'none' : '2px solid rgba(203,213,225,.6)' }}>
                          {formData.terms[item.key] && <Check size={10} className="text-white" strokeWidth={3} />}
                        </div>
                        <span className="text-xs text-slate-700">{item.label} <span className={`font-bold ${item.required ? 'text-blue-500' : 'text-slate-400'}`}>({item.required ? '필수' : '선택'})</span></span>
                      </button>
                      <button type="button" onClick={() => setOpenTermKey(item.key)} className="shrink-0 text-slate-400 hover:text-slate-600" aria-label="약관 내용 보기"><ChevronRight size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 pt-4">
              <div>
                <h2 className="font-display text-[22px] text-slate-900">👤 프로필을 설정해요</h2>
                <p className="text-[13px] text-slate-500 mt-1">매칭 및 본인 확인을 위해 사용됩니다.</p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.15)' }}>
                <AlertCircle size={14} className="text-red-400 shrink-0" />
                <p className="text-xs font-medium text-red-500">허위 프로필 작성 시 신고 및 서비스 이용 제한을 받을 수 있습니다.</p>
              </div>
              <div className="space-y-5">
                <div>
                  <span style={labelStyle}>실명</span>
                  <input type="text" placeholder="홍길동" value={formData.realName} onChange={(e) => setFormData({ ...formData, realName: e.target.value })} className="placeholder:text-slate-300" style={glassInputStyle} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,.5)'; e.currentTarget.style.boxShadow = glassInputFocusRing; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(219,234,254,.9)'; e.currentTarget.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <span style={labelStyle}>학과</span>
                  <SearchableSelect options={DEPARTMENT_OPTIONS} value={formData.department} onChange={(value) => setFormData({ ...formData, department: value })} placeholder="학과를 선택해주세요" searchPlaceholder="학과명 검색..." />
                </div>
                <div>
                  <span style={labelStyle}>성별</span>
                  <div className="flex gap-3">
                    {(['MALE', 'FEMALE'] as const).map((g) => {
                      const selected = formData.gender === g;
                      return (
                        <button key={g} type="button" onClick={() => setFormData({ ...formData, gender: g })} className="flex-1 h-12 font-bold text-sm transition-all" style={{ borderRadius: 14, background: selected ? 'linear-gradient(135deg, #2563eb, #6366f1)' : 'rgba(255,255,255,.85)', color: selected ? '#fff' : '#94a3b8', border: selected ? 'none' : '1px solid rgba(219,234,254,.9)' }}>
                          {g === 'MALE' ? '남성' : '여성'}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span style={labelStyle}>MBTI</span>
                  <div className="grid grid-cols-4 gap-2">
                    {MBTI_OPTIONS.map(({ value, label }) => {
                      const selected = formData.mbti === value;
                      return (
                        <button key={value} type="button" onClick={() => setFormData({ ...formData, mbti: value })} className="py-2.5 text-sm font-bold transition-all" style={{ borderRadius: 12, background: selected ? 'linear-gradient(135deg, #2563eb, #6366f1)' : 'rgba(255,255,255,.85)', color: selected ? '#fff' : '#64748b', border: selected ? 'none' : '1px solid rgba(219,234,254,.9)' }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <span style={labelStyle}>인스타그램 ID</span>
                  <input type="text" placeholder="아이디만 입력해주세요 (예: randsome_official)" value={formData.instagramId} onChange={(e) => setFormData({ ...formData, instagramId: e.target.value })} className="placeholder:text-slate-300" style={glassInputStyle} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,.5)'; e.currentTarget.style.boxShadow = glassInputFocusRing; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(219,234,254,.9)'; e.currentTarget.style.boxShadow = 'none'; }} />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 pt-4">
              <div>
                <h2 className="font-display text-[22px] text-slate-900">💝 이상형 스타일을 선택해요</h2>
                <p className="text-[13px] text-slate-500 mt-1">매칭 성공률을 높이는 핵심 정보입니다!</p>
              </div>
              <div className="space-y-6">
                <div>
                  <span style={labelStyle}>자기 소개</span>
                  <textarea placeholder="자신을 표현할 수 있는 멋진 소개글을 작성해주세요!" value={formData.intro} onChange={(e) => setFormData({ ...formData, intro: e.target.value })} maxLength={500} className="placeholder:text-slate-300 resize-none" style={{ ...glassInputStyle, minHeight: 112 }} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,.5)'; e.currentTarget.style.boxShadow = glassInputFocusRing; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(219,234,254,.9)'; e.currentTarget.style.boxShadow = 'none'; }} />
                </div>
                <div>
                  <span style={labelStyle}>이상형</span>
                  <textarea placeholder="어떤 사람을 찾고 계신가요?" value={formData.idealType} onChange={(e) => setFormData({ ...formData, idealType: e.target.value })} maxLength={500} className="placeholder:text-slate-300 resize-none" style={{ ...glassInputStyle, minHeight: 112 }} onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(59,130,246,.5)'; e.currentTarget.style.boxShadow = glassInputFocusRing; }} onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(219,234,254,.9)'; e.currentTarget.style.boxShadow = 'none'; }} />
                </div>
                <div className="p-4 space-y-4" style={{ borderRadius: 16, background: 'rgba(255,255,255,.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(219,234,254,.9)' }}>
                  <div className="mb-2">
                    <p className="text-sm font-bold text-slate-900 mb-1">나를 표현하는 태그</p>
                    <p className="text-xs text-slate-500">이상형 매칭에 사용됩니다 (각 카테고리에서 1개 선택)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 mb-2">성격</p>
                    <div className="flex flex-wrap gap-2">
                      {PERSONALITY_TAGS.map(({ value, label }) => {
                        const selected = formData.personalityTag === value;
                        return <button key={value} type="button" onClick={() => setFormData({ ...formData, personalityTag: value })} className="px-3.5 py-1.5 text-xs font-bold transition-all" style={{ borderRadius: 999, background: selected ? '#0c1535' : 'rgba(255,255,255,.85)', color: selected ? '#fff' : '#64748b', border: selected ? 'none' : '1px solid rgba(219,234,254,.9)' }}>{label}</button>;
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 mb-2">외모 스타일</p>
                    <div className="flex flex-wrap gap-2">
                      {FACE_TYPE_TAGS.map(({ value, label }) => {
                        const selected = formData.faceTypeTag === value;
                        return <button key={value} type="button" onClick={() => setFormData({ ...formData, faceTypeTag: value })} className="px-3.5 py-1.5 text-xs font-bold transition-all" style={{ borderRadius: 999, background: selected ? 'linear-gradient(135deg, #ec4899, #f43f5e)' : 'rgba(255,255,255,.85)', color: selected ? '#fff' : '#64748b', border: selected ? 'none' : '1px solid rgba(219,234,254,.9)' }}>{label}</button>;
                      })}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-800 mb-2">연애 스타일</p>
                    <div className="flex flex-wrap gap-2">
                      {DATING_STYLE_TAGS.map(({ value, label }) => {
                        const selected = formData.datingStyleTag === value;
                        return <button key={value} type="button" onClick={() => setFormData({ ...formData, datingStyleTag: value })} className="px-3.5 py-1.5 text-xs font-bold transition-all" style={{ borderRadius: 999, background: selected ? '#0c1535' : 'rgba(255,255,255,.85)', color: selected ? '#fff' : '#64748b', border: selected ? 'none' : '1px solid rgba(219,234,254,.9)' }}>{label}</button>;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full ${isPWA ? 'max-w-[430px]' : 'max-w-2xl'} z-50 px-4 sm:px-5 pb-6 sm:pb-8 pt-4`} style={{ background: 'linear-gradient(to top, #edf3ff 60%, transparent)' }}>
          <div className="flex gap-3">
            {step > 1 && (
              <button onClick={prevStep} className="flex-1 h-14 font-bold text-slate-600 transition-all" style={{ borderRadius: 16, background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(10px)', border: '1px solid rgba(219,234,254,.9)' }}>이전</button>
            )}
            <button onClick={step === 3 ? handleSubmit : nextStep} disabled={isSubmitting || (step === 1 && !isStep1Valid) || (step === 2 && !isStep2Valid) || (step === 3 && !isStep3Valid)} className="flex-[2] h-14 text-base font-bold text-white disabled:opacity-50 transition-all relative overflow-hidden" style={{ ...gradientBtnBase, fontSize: 16 }}>
              <span aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-[inherit] pointer-events-none">
                <span className="absolute top-0 h-full w-[55%] bg-gradient-to-r from-transparent via-white/25 to-transparent animate-sheen" />
              </span>
              <span className="relative z-10 flex items-center justify-center gap-2">
                {step === 3 ? (isSubmitting ? '가입 중...' : <><Heart size={18} fill="currentColor" />가입 완료!</>) : '다음 단계'}
              </span>
            </button>
          </div>
        </div>
        </div>

        {openTerm && (
          <div className="fixed inset-0 z-50 flex justify-center items-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpenTermKey(null)} />
            <div className="relative w-full max-w-2xl flex flex-col max-h-[85vh]" style={{ borderRadius: '24px 24px 0 0', background: 'rgba(255,255,255,.95)', backdropFilter: 'blur(24px)' }}>
              <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0" style={{ borderBottom: '1px solid rgba(219,234,254,.9)' }}>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{openTerm.label}</h3>
                  <span className={`text-xs font-bold ${openTerm.required ? 'text-blue-500' : 'text-slate-400'}`}>{openTerm.required ? '필수 동의' : '선택 동의'}</span>
                </div>
                <button onClick={() => setOpenTermKey(null)} className="p-1 text-slate-400 hover:text-slate-700" aria-label="닫기"><X size={20} /></button>
              </div>
              <div className="overflow-y-auto px-6 py-4 flex-1">{openTerm.content}</div>
              <div className="px-6 pb-8 pt-4 shrink-0" style={{ borderTop: '1px solid rgba(219,234,254,.9)' }}>
                <button onClick={() => { toggleTerm(openTerm.key); setOpenTermKey(null); }} className="w-full h-12 font-semibold text-sm transition-colors text-white" style={{ borderRadius: 16, background: formData.terms[openTerm.key] ? 'rgba(226,232,240,.8)' : 'linear-gradient(135deg, #2563eb, #6366f1)', color: formData.terms[openTerm.key] ? '#475569' : '#fff' }}>
                  {formData.terms[openTerm.key] ? '동의 취소' : '동의하기'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MobileLayout>
  );
};

export default SignupPage;
