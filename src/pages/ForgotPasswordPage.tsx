import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
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

  // 웹 환경에서의 레이아웃
  if (!isPWA) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* 배경 그라데이션 오브 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-100/40 to-pink-100/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-purple-100/20 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-6xl relative z-10">
          <div className="grid grid-cols-2 gap-16 items-start">
            {/* 좌측: 안내 영역 */}
            <motion.div
              className="flex flex-col items-start pt-8"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-purple-300/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <KeyRound size={32} />
              </motion.div>
              <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight">
                계정을<br />복구하세요
              </h1>
              <p className="text-lg text-slate-600 mb-12">
                {step === 1
                  ? '등록된 이메일로 인증 코드를 받아\n비밀번호를 재설정하세요'
                  : '새로운 비밀번호를 설정해\n계정을 복구하세요'}
              </p>

              <div className="w-full space-y-3">
                <div className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  step > 0
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <CheckCircle2
                    size={20}
                    className={step > 0 ? 'text-blue-600' : 'text-slate-400'}
                  />
                  <span className={step > 0 ? 'text-slate-900 font-semibold' : 'text-slate-600'}>
                    이메일 인증
                  </span>
                </div>
                <div className={`flex items-center gap-3 p-4 rounded-xl transition-all ${
                  step > 1
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-slate-50 border border-slate-200'
                }`}>
                  <CheckCircle2
                    size={20}
                    className={step > 1 ? 'text-blue-600' : 'text-slate-400'}
                  />
                  <span className={step > 1 ? 'text-slate-900 font-semibold' : 'text-slate-600'}>
                    새 비밀번호 설정
                  </span>
                </div>
              </div>
            </motion.div>

            {/* 우측: 폼 영역 */}
            <motion.div
              className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            >
              <h2 className="text-3xl font-black text-slate-900 mb-2">
                {stepTitles[step]}
              </h2>
              <p className="text-slate-600 mb-8">진행 상태: Step {step} / 2</p>
              {/* Step 1: 이메일 입력 + 인증 코드 (웹) */}
              {step === 1 && (
                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="email-id-web"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      학교 이메일
                    </label>
                    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all duration-200">
                      <input
                        id="email-id-web"
                        type="text"
                        placeholder="이메일 아이디"
                        value={emailId}
                        onChange={(e) => setEmailId(e.target.value)}
                        disabled={codeSent}
                        className="flex-1 min-w-0 px-4 py-3.5 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400 disabled:text-slate-500"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && emailId && !codeSent)
                            void handleSendCode();
                        }}
                      />
                      <span className="shrink-0 px-3.5 py-3.5 text-sm text-slate-600 bg-slate-100 border-l border-slate-200 whitespace-nowrap">
                        @sangmyung.kr
                      </span>
                    </div>
                  </div>

                  {!codeSent && (
                    <button
                      type="button"
                      onClick={() => void handleSendCode()}
                      disabled={!emailId || isLoading}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200/50"
                    >
                      {isLoading ? '발송 중...' : '인증 코드 받기'}
                    </button>
                  )}

                  {codeSent && !codeVerified && (
                    <div className="space-y-3">
                      <p className="text-sm text-blue-600 font-medium">
                        ✓ 인증 메일이 발송되었습니다. 코드를 입력해주세요.
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="인증 코드 6자리"
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && code)
                              void handleVerifyCode();
                          }}
                          className="flex-1 px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => void handleVerifyCode()}
                          disabled={!code || isLoading}
                          className="shrink-0 px-6 py-3.5 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all"
                        >
                          확인
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => void handleSendCode()}
                        disabled={isLoading}
                        className="text-xs text-slate-600 hover:text-slate-900 transition-colors disabled:pointer-events-none"
                      >
                        코드 재발송
                      </button>
                    </div>
                  )}

                  {codeVerified && (
                    <p className="text-sm text-green-600 font-semibold flex items-center gap-2">
                      <CheckCircle2 size={16} /> 인증이 완료되었습니다!
                    </p>
                  )}
                </div>
              )}

              {/* Step 2: 새 비밀번호 입력 (웹) */}
              {step === 2 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleResetPassword();
                  }}
                  className="space-y-5"
                >
                  <div>
                    <label
                      htmlFor="new-password-web"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      새 비밀번호
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all duration-200">
                      <input
                        id="new-password-web"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="8자 이상 입력해주세요"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="flex-1 min-w-0 px-4 py-3.5 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="px-4 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label={
                          showPassword
                            ? '비밀번호 숨기기'
                            : '비밀번호 보기'
                        }
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="new-password-confirm-web"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      새 비밀번호 확인
                    </label>
                    <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all duration-200">
                      <input
                        id="new-password-confirm-web"
                        type={showPasswordConfirm ? 'text' : 'password'}
                        placeholder="비밀번호를 다시 입력해주세요"
                        value={newPasswordConfirm}
                        onChange={(e) =>
                          setNewPasswordConfirm(e.target.value)
                        }
                        className="flex-1 min-w-0 px-4 py-3.5 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowPasswordConfirm((v) => !v)
                        }
                        className="px-4 text-slate-600 hover:text-slate-900 transition-colors"
                        aria-label={
                          showPasswordConfirm
                            ? '비밀번호 숨기기'
                            : '비밀번호 보기'
                        }
                      >
                        {showPasswordConfirm ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                    {newPasswordConfirm &&
                      newPassword !== newPasswordConfirm && (
                        <p className="text-xs text-red-600 mt-2 font-medium">
                          ✗ 비밀번호가 일치하지 않습니다.
                        </p>
                      )}
                    {newPasswordConfirm &&
                      newPassword === newPasswordConfirm &&
                      newPassword.length >= 8 && (
                        <p className="text-xs text-green-600 mt-2 font-medium">
                          ✓ 비밀번호가 일치합니다.
                        </p>
                      )}
                  </div>

                  <button
                    type="submit"
                    disabled={
                      !newPassword ||
                      !newPasswordConfirm ||
                      newPassword !== newPasswordConfirm ||
                      isLoading
                    }
                    className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200/50"
                  >
                    {isLoading ? '변경 중...' : '비밀번호 변경하기'}
                  </button>
                </form>
              )}

              <div className="mt-8 pt-6 border-t border-slate-200">
                {step === 1 && (
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    로그인으로 돌아가기
                  </button>
                )}
                {step === 2 && (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    ← 이전 단계로
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // 모바일 환경에서의 레이아웃
  return (
    <MobileLayout>
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

      <div className="flex-1 flex flex-col justify-center p-6 pb-32">
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
