import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { useDisplayMode } from '@/store/displayModeStore';
import { sendEmailVerificationCode, verifyEmailCode } from '@/features/auth/api';
import { updatePassword } from '@/features/member/api';
import { getApiErrorMessage } from '@/lib/axios';
import { ChevronLeft, KeyRound, Eye, EyeOff, ExternalLink, CheckCircle2 } from 'lucide-react';

type Step = 1 | 2;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();

  const [step, setStep] = useState<Step>(1);
  const [emailId, setEmailId] = useState('');
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
      if (res.result === 'ERROR') {
        toast(res.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }
      toast('인증 코드를 발송했습니다. 이메일을 확인해주세요.', 'success');
      setCodeSent(true);
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
      const res = await verifyEmailCode({ email, code }, 'PASSWORD_RESET');
      if (res.result === 'ERROR' || !res.data) {
        toast(res.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }
      setEmailVerificationToken(res.data.emailVerificationToken);
      setCodeVerified(true);
      setStep(2);
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (): Promise<void> => {
    if (!newPassword || !newPasswordConfirm) return;
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
      const res = await updatePassword({ email, emailVerificationToken, newPassword });
      if (res.result === 'ERROR') {
        toast(res.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }
      toast('비밀번호가 변경되었습니다. 다시 로그인해주세요.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const stepTitles: Record<Step, string> = {
    1: '이메일 인증',
    2: '새 비밀번호 설정',
  };

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center">
          <button
            onClick={() => (step > 1 ? setStep(1) : navigate(-1))}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 ml-2">비밀번호 찾기</h1>
        </header>
      )}

      <div className={`flex-1 flex flex-col justify-center p-6 ${isPWA ? 'pb-32' : 'max-w-md mx-auto w-full py-16'}`}>
        {/* 아이콘 + 타이틀 */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-500 rounded-3xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
            <KeyRound size={30} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">비밀번호 찾기</h2>
          <p className="text-slate-500 text-sm mt-1">{stepTitles[step]}</p>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {([1, 2] as Step[]).map((s) => (
            <div
              key={s}
              className={`h-2 rounded-full transition-all ${
                s === step ? 'w-8 bg-blue-500' : s < step ? 'w-2 bg-blue-300' : 'w-2 bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step 1: 이메일 입력 + 인증 코드 */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="email-id" className="block text-sm font-semibold text-slate-700 mb-1">
                학교 이메일
              </label>
              <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
                <input
                  id="email-id"
                  type="text"
                  placeholder="이메일 아이디"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                  disabled={codeSent}
                  className="flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-white disabled:text-slate-400 disabled:bg-slate-50"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && emailId && !codeSent) void handleSendCode();
                  }}
                />
                <span className="shrink-0 px-3 py-3 text-sm text-slate-400 bg-slate-50 border-l border-slate-200 whitespace-nowrap">
                  @sangmyung.kr
                </span>
              </div>
            </div>

            {/* 웹메일 바로가기 */}
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

            {/* 코드 발송 전: 버튼 */}
            {!codeSent && (
              <div className="pt-1">
                <Button
                  fullWidth
                  size="lg"
                  disabled={!emailId || isLoading}
                  onClick={() => void handleSendCode()}
                >
                  {isLoading ? '발송 중...' : '인증 코드 받기'}
                </Button>
              </div>
            )}

            {/* 코드 발송 후: 인증 코드 입력란 */}
            {codeSent && !codeVerified && (
              <div className="space-y-3">
                <p className="text-xs text-blue-600 font-medium">
                  인증 메일이 발송되었습니다. 코드를 입력해주세요.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="인증 코드 6자리"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && code) void handleVerifyCode();
                    }}
                    className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    autoFocus
                  />
                  <button
                    type="button"
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
              </div>
            )}

            {codeVerified && (
              <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> 인증이 완료되었습니다.
              </p>
            )}
          </div>
        )}

        {/* Step 2: 새 비밀번호 입력 */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); void handleResetPassword(); }} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-1">
                새 비밀번호
              </label>
              <div className="relative flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="8자 이상 입력해주세요"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="px-3 text-slate-400"
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new-password-confirm" className="block text-sm font-semibold text-slate-700 mb-1">
                새 비밀번호 확인
              </label>
              <div className="relative flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
                <input
                  id="new-password-confirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="비밀번호를 다시 입력해주세요"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm((v) => !v)}
                  className="px-3 text-slate-400"
                  aria-label={showPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPasswordConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {newPasswordConfirm && newPassword !== newPasswordConfirm && (
                <p className="text-xs text-red-500 mt-1">비밀번호가 일치하지 않습니다.</p>
              )}
            </div>

            <div className="pt-2">
              <Button
                fullWidth
                size="lg"
                type="submit"
                disabled={
                  !newPassword ||
                  !newPasswordConfirm ||
                  newPassword !== newPasswordConfirm ||
                  isLoading
                }
              >
                {isLoading ? '변경 중...' : '비밀번호 변경하기'}
              </Button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-blue-600 font-bold hover:underline"
          >
            로그인으로 돌아가기
          </button>
        </p>
      </div>
    </MobileLayout>
  );
};

export default ForgotPasswordPage;
