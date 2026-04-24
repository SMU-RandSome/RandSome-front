import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { sendEmailVerificationCode, verifyEmailCode } from '@/features/auth/api';
import { updatePassword } from '@/features/member/api';
import { getApiErrorMessage } from '@/lib/axios';
import { ChevronLeft, Eye, EyeOff, ExternalLink, CheckCircle2 } from 'lucide-react';
import { Orbs } from '@/components/ui/Orbs';

type Step = 1 | 2;

const inputStyle: React.CSSProperties = {
  padding: '13px 16px',
  borderRadius: 14,
  background: 'rgba(255,255,255,.85)',
  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(219,234,254,.9)',
  fontSize: 16,
  color: '#0f172a',
};

const glassHeaderStyle: React.CSSProperties = {
  background: 'rgba(237,243,255,.9)',
  backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  borderBottom: '1px solid rgba(59,130,246,.1)',
};

const gradientButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #2563eb, #6366f1)',
  boxShadow: '0 8px 32px rgba(59,130,246,.38)',
};

const sheenStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)',
  animation: 'sheen 2.8s ease-in-out infinite',
};

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [emailId, setEmailId] = useState(sessionStorage.getItem('forgot_email') ?? '');
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState('');
  const [codeVerified, setCodeVerified] = useState(false);
  const [emailVerificationToken, setEmailVerificationToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const email = `${emailId}@sangmyung.kr`;

  const handleSendCode = async (): Promise<void> => {
    if (!emailId) return;
    setIsLoading(true);
    try {
      const res = await sendEmailVerificationCode({ email });
      if (res.result === 'ERROR') { toast(res.error?.message ?? '오류가 발생했습니다.', 'error'); return; }
      toast('인증 코드를 발송했습니다. 이메일을 확인해주세요.', 'success');
      setCodeSent(true);
    } catch (err) { toast(getApiErrorMessage(err), 'error'); } finally { setIsLoading(false); }
  };

  const handleVerifyCode = async (): Promise<void> => {
    if (!code) return;
    setIsLoading(true);
    try {
      const res = await verifyEmailCode({ email, code }, 'PASSWORD_RESET');
      if (res.result === 'ERROR' || !res.data) { toast(res.error?.message ?? '오류가 발생했습니다.', 'error'); return; }
      setEmailVerificationToken(res.data.emailVerificationToken);
      setCodeVerified(true); setStep(2);
    } catch (err) { toast(getApiErrorMessage(err), 'error'); } finally { setIsLoading(false); }
  };

  const handleResetPassword = async (): Promise<void> => {
    if (!newPassword || !newPasswordConfirm) return;
    if (newPassword !== newPasswordConfirm) { toast('비밀번호가 일치하지 않습니다.', 'error'); return; }
    if (newPassword.length < 8) { toast('비밀번호는 8자 이상이어야 합니다.', 'error'); return; }
    setIsLoading(true);
    try {
      const res = await updatePassword({ email, emailVerificationToken, newPassword });
      if (res.result === 'ERROR') { toast(res.error?.message ?? '오류가 발생했습니다.', 'error'); return; }
      sessionStorage.removeItem('forgot_email');
      toast('비밀번호가 변경되었습니다. 다시 로그인해주세요.', 'success');
      navigate('/login', { replace: true });
    } catch (err) { toast(getApiErrorMessage(err), 'error'); } finally { setIsLoading(false); }
  };

  const stepTitles: Record<Step, string> = { 1: '이메일 인증', 2: '새 비밀번호 설정' };

  return (
    <MobileLayout className="!bg-transparent">
      <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
        <Orbs />

        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <header className="sticky top-0 z-50 px-4 flex items-center gap-3" style={{ ...glassHeaderStyle, paddingTop: 'env(safe-area-inset-top, 0px)', minHeight: 'calc(3.5rem + env(safe-area-inset-top, 0px))' }}>
          <button onClick={() => (step > 1 ? setStep(1) : navigate(-1))} className="p-1.5 -ml-1 rounded-xl hover:bg-white/50 transition-colors" aria-label="뒤로가기">
            <ChevronLeft size={22} className="text-slate-700" />
          </button>
          <h1 className="text-lg font-bold text-slate-900">비밀번호 찾기</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-5 relative z-10">
          <div className="flex items-center justify-center gap-2 mb-8 mt-4">
            {([1, 2] as Step[]).map((s) => (
              <div key={s} className={`h-2 rounded-full transition-all ${s === step ? 'w-8 bg-blue-500' : s < step ? 'w-2 bg-blue-300' : 'w-2 bg-slate-200'}`} />
            ))}
          </div>

          <div className="text-center mb-8">
            <h2 className="font-display text-[24px] text-slate-900">{stepTitles[step]}</h2>
            <p className="text-[13px] text-slate-500 mt-1">{step === 1 ? '등록된 이메일로 인증 코드를 받으세요' : '새로운 비밀번호를 설정하세요'}</p>
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="email-id" className="block text-sm font-semibold text-slate-700 mb-2">학교 이메일</label>
                <div className="flex items-center overflow-hidden" style={{ borderRadius: 14, border: '1px solid rgba(219,234,254,.9)' }}>
                  <input id="email-id" type="text" placeholder="이메일 아이디" value={emailId} onChange={(e) => { sessionStorage.setItem('forgot_email', e.target.value); setEmailId(e.target.value); }} disabled={codeSent} style={{ ...inputStyle, flex: 1, minWidth: 0, borderRadius: 0, border: 'none' }} className="outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)] transition-all placeholder:text-slate-400 disabled:text-slate-400 disabled:opacity-70" onKeyDown={(e) => { if (e.key === 'Enter' && emailId && !codeSent) void handleSendCode(); }} />
                  <span className="shrink-0 text-sm text-slate-500 whitespace-nowrap" style={{ padding: '13px 14px', background: 'rgba(241,245,249,.9)', borderLeft: '1px solid rgba(219,234,254,.9)' }}>@sangmyung.kr</span>
                </div>
              </div>
              <a href="https://cloud.smu.ac.kr/t/smu.ac.kr" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors">학교 웹메일 바로가기 <ExternalLink size={12} /></a>

              {!codeSent && (
                <div className="pt-1">
                  <button type="button" onClick={() => void handleSendCode()} disabled={!emailId || isLoading} style={gradientButtonStyle} className="w-full py-[15px] rounded-[18px] text-white text-[15px] font-bold relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                    <div className="absolute top-0 bottom-0 w-[40%] -left-[60%]" style={sheenStyle} />
                    {isLoading ? '발송 중...' : '인증 코드 받기'}
                  </button>
                </div>
              )}

              {codeSent && !codeVerified && (
                <div className="space-y-3">
                  <p className="text-xs text-blue-600 font-medium">인증 메일이 발송되었습니다. 코드를 입력해주세요.</p>
                  <div className="flex items-center gap-2">
                    <input type="text" placeholder="인증 코드 6자리" value={code} onChange={(e) => setCode(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && code) void handleVerifyCode(); }} style={{ ...inputStyle, flex: 1, minWidth: 0 }} className="outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)] transition-all placeholder:text-slate-400" autoFocus />
                    <button type="button" onClick={() => void handleVerifyCode()} disabled={!code || isLoading} style={gradientButtonStyle} className="shrink-0 px-5 py-[13px] rounded-[14px] text-sm font-bold text-white disabled:opacity-50 transition-all">{isLoading ? '확인 중...' : '확인'}</button>
                  </div>
                  <button type="button" onClick={() => void handleSendCode()} disabled={isLoading} className="text-xs text-slate-400 hover:text-blue-500 hover:underline disabled:pointer-events-none transition-colors">인증 코드 재발송</button>
                </div>
              )}

              {codeVerified && <p className="text-xs text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={12} /> 인증이 완료되었습니다.</p>}
            </div>
          )}

          {step === 2 && (
            <form onSubmit={(e) => { e.preventDefault(); void handleResetPassword(); }} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-2">새 비밀번호</label>
                <div className="flex items-center overflow-hidden" style={{ borderRadius: 14, border: '1px solid rgba(219,234,254,.9)', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                  <input id="new-password" type={showPassword ? 'text' : 'password'} placeholder="8자 이상 입력해주세요" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} style={{ flex: 1, minWidth: 0, padding: '13px 16px', fontSize: 16, color: '#0f172a', background: 'transparent', border: 'none' }} className="outline-none placeholder:text-slate-400" />
                  <button type="button" onClick={() => setShowPassword((v) => !v)} className="px-3 text-slate-400 hover:text-slate-600 transition-colors" aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              <div>
                <label htmlFor="new-password-confirm" className="block text-sm font-semibold text-slate-700 mb-2">새 비밀번호 확인</label>
                <div className="flex items-center overflow-hidden" style={{ borderRadius: 14, border: '1px solid rgba(219,234,254,.9)', background: 'rgba(255,255,255,.85)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}>
                  <input id="new-password-confirm" type={showPasswordConfirm ? 'text' : 'password'} placeholder="비밀번호를 다시 입력해주세요" value={newPasswordConfirm} onChange={(e) => setNewPasswordConfirm(e.target.value)} style={{ flex: 1, minWidth: 0, padding: '13px 16px', fontSize: 16, color: '#0f172a', background: 'transparent', border: 'none' }} className="outline-none placeholder:text-slate-400" />
                  <button type="button" onClick={() => setShowPasswordConfirm((v) => !v)} className="px-3 text-slate-400 hover:text-slate-600 transition-colors" aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}>{showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {newPasswordConfirm && newPassword !== newPasswordConfirm && <p className="text-xs text-red-500 mt-1.5">비밀번호가 일치하지 않습니다.</p>}
                {newPasswordConfirm && newPassword === newPasswordConfirm && newPassword.length >= 8 && <p className="text-xs text-green-600 mt-1.5 font-medium">비밀번호가 일치합니다.</p>}
              </div>
              <div className="pt-2">
                <button type="submit" disabled={!newPassword || !newPasswordConfirm || newPassword !== newPasswordConfirm || isLoading} style={gradientButtonStyle} className="w-full py-[15px] rounded-[18px] text-white text-[15px] font-bold relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                  <div className="absolute top-0 bottom-0 w-[40%] -left-[60%]" style={sheenStyle} />
                  {isLoading ? '변경 중...' : '비밀번호 변경하기'}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm mt-6">
            <button type="button" onClick={() => navigate('/login')} className="px-6 py-2.5 rounded-[14px] text-sm font-semibold hover:bg-blue-50/50 transition-colors" style={{ border: '1px solid #dde8ff', background: 'transparent', color: '#2563eb' }}>로그인으로 돌아가기</button>
          </p>
        </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default ForgotPasswordPage;
