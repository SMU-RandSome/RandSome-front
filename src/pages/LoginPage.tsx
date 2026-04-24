import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import { login as loginApi } from '@/features/auth/api';
import { getMyProfile } from '@/features/member/api';
import { getApiErrorMessage } from '@/lib/axios';
import { Orbs } from '@/components/ui/Orbs';
import { Logo } from '@/components/ui/Logo';
import { MobileHeader } from '@/components/layout/MobileHeader';

const inputStyle: React.CSSProperties = {
  padding: '13px 16px',
  borderRadius: 14,
  background: 'rgba(255,255,255,.85)',
  backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(219,234,254,.9)',
  fontSize: 16,
  color: '#0f172a',
};

const gradientButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #2563eb, #6366f1)',
  boxShadow: '0 8px 32px rgba(59,130,246,.38)',
};

const sheenStyle: React.CSSProperties = {
  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent)',
  animation: 'sheen 2.8s ease-in-out infinite',
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const [emailId, setEmailId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!emailId || !password) return;

    const email = `${emailId}@sangmyung.kr`;

    setIsLoading(true);
    try {
      const tokenRes = await loginApi({ email, password });
      if (!tokenRes.data) {
        toast(tokenRes.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }

      localStorage.setItem('accessToken', tokenRes.data.accessToken);
      localStorage.setItem('refreshToken', tokenRes.data.refreshToken);

      const profileRes = await getMyProfile();
      if (!profileRes.data) {
        toast(profileRes.error?.message ?? '오류가 발생했습니다.', 'error');
        return;
      }

      setUser(profileRes.data);

      if (profileRes.data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      toast(getApiErrorMessage(err), 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MobileLayout className="!bg-transparent">
      <div className="flex-1 flex flex-col bg-member relative overflow-hidden min-h-screen">
        <Orbs />

        <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col relative z-10">
        <MobileHeader title="로그인" onBack={() => navigate(-1)} />

        <div className="flex-1 flex flex-col justify-center p-5 relative z-10">
          <div className="flex flex-col items-center mb-10">
            <Logo />
            <h2 className="font-display text-[28px] text-slate-900 mt-4">다시 만나요!</h2>
            <p className="text-[13px] text-slate-500 mt-1">설레는 인연이 기다리고 있어요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email-id" className="block text-sm font-semibold text-slate-700 mb-2">학교 이메일</label>
              <div className="flex items-center overflow-hidden" style={{ borderRadius: 14, border: '1px solid rgba(219,234,254,.9)' }}>
                <input id="email-id" type="text" placeholder="이메일 아이디" value={emailId} onChange={(e) => setEmailId(e.target.value)} style={{ ...inputStyle, width: undefined, flex: 1, minWidth: 0, borderRadius: 0, border: 'none' }} className="outline-none focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)] transition-all placeholder:text-slate-400" />
                <span className="shrink-0 text-sm text-slate-500 whitespace-nowrap" style={{ padding: '13px 14px', background: 'rgba(241,245,249,.9)', borderLeft: '1px solid rgba(219,234,254,.9)' }}>@sangmyung.kr</span>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
              <input id="password" type="password" placeholder="비밀번호를 입력해주세요" value={password} onChange={(e) => setPassword(e.target.value)} style={{ ...inputStyle, width: '100%' }} className="outline-none focus:border-blue-500/50 focus:shadow-[0_0_0_3px_rgba(59,130,246,.12)] transition-all placeholder:text-slate-400" />
            </div>

            <div className="pt-2">
              <button type="submit" disabled={!emailId || !password || isLoading} style={gradientButtonStyle} className="w-full py-[15px] rounded-[18px] text-white text-[15px] font-bold relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed">
                <div className="absolute top-0 bottom-0 w-[40%] -left-[60%]" style={sheenStyle} />
                {isLoading ? '로그인 중...' : '로그인하기'}
              </button>
            </div>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            아직 계정이 없으신가요?{' '}
            <button type="button" onClick={() => navigate('/signup')} className="text-blue-600 font-bold hover:underline">회원가입</button>
          </p>
          <p className="text-center text-sm text-slate-400 mt-3">
            <button type="button" onClick={() => navigate('/forgot-password')} className="hover:text-slate-600 hover:underline transition-colors">비밀번호를 잊으셨나요?</button>
          </p>
        </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default LoginPage;
