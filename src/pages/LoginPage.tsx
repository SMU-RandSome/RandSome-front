import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { login as loginApi } from '@/features/auth/api';
import { getMyProfile } from '@/features/member/api';
import { ChevronLeft, Heart } from 'lucide-react';
import axios from 'axios';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { toast } = useToast();
  const { isPWA } = useDisplayMode();
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
        toast(tokenRes.error?.message ?? '로그인에 실패했습니다.', 'error');
        return;
      }

      localStorage.setItem('accessToken', tokenRes.data.accessToken);
      localStorage.setItem('refreshToken', tokenRes.data.refreshToken);

      const profileRes = await getMyProfile();
      if (!profileRes.data) {
        toast('사용자 정보를 불러오는 데 실패했습니다.', 'error');
        return;
      }

      setUser(profileRes.data);

      if (profileRes.data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error?.message;
        toast(message ?? '로그인 중 오류가 발생했습니다.', 'error');
      } else {
        toast('로그인 중 오류가 발생했습니다.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email-id" className="block text-sm font-semibold text-slate-700 mb-1">학교 이메일</label>
        <div className="flex items-center border-2 border-slate-200 rounded-2xl overflow-hidden focus-within:border-blue-500 transition-colors">
          <input
            id="email-id"
            type="text"
            placeholder="이메일 아이디"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="flex-1 px-4 py-3 text-sm outline-none bg-white"
          />
          <span className="px-3 py-3 text-sm text-slate-400 bg-slate-50 border-l border-slate-200 shrink-0">
            @sangmyung.kr
          </span>
        </div>
      </div>
      <Input
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="pt-2">
        <Button fullWidth size="lg" disabled={!emailId || !password || isLoading}>
          {isLoading ? '로그인 중...' : '로그인하기'}
        </Button>
      </div>
    </form>
  );

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 ml-2">로그인</h1>
        </header>
      )}

      <div className={`flex-1 flex flex-col justify-center p-6 ${isPWA ? 'pb-32' : 'max-w-md mx-auto w-full py-16'}`}>
        {/* 로고 */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-pink-500 rounded-3xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200">
            <Heart size={30} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">다시 만나요! 👋</h2>
          <p className="text-slate-500 text-sm mt-1">설레는 인연이 기다리고 있어요</p>
        </div>

        {formContent}

        <p className="text-center text-sm text-slate-500 mt-6">
          아직 계정이 없으신가요?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className="text-blue-600 font-bold hover:underline"
          >
            회원가입
          </button>
        </p>
      </div>
    </MobileLayout>
  );
};

export default LoginPage;
