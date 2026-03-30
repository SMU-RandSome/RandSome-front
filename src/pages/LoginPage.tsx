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
import { motion } from 'motion/react';
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
        <label htmlFor="email-id" className="block text-sm font-semibold text-slate-700 mb-1.5">학교 이메일</label>
        <div className="flex items-center border-2 border-slate-200/80 rounded-2xl overflow-hidden focus-within:border-blue-500 focus-within:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] transition-all duration-200 bg-white/80 backdrop-blur-sm">
          <input
            id="email-id"
            type="text"
            placeholder="이메일 아이디"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="flex-1 min-w-0 px-4 py-3 text-sm outline-none bg-transparent"
          />
          <span className="shrink-0 px-3 py-3 text-sm text-slate-400 bg-slate-50/80 border-l border-slate-200/80 whitespace-nowrap">
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
        <header className="sticky top-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.03)] px-4 h-14 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            aria-label="뒤로 가기"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold text-slate-900 ml-2">로그인</h1>
        </header>
      )}

      <div className={`relative flex-1 flex flex-col justify-center p-6 ${isPWA ? 'pb-32' : 'max-w-md mx-auto w-full py-16'}`}>
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-20 w-56 h-56 bg-gradient-to-br from-blue-400/10 to-indigo-500/8 rounded-full blur-3xl animate-morph" />
          <div
            className="absolute bottom-1/4 -right-20 w-56 h-56 bg-gradient-to-br from-pink-400/10 to-rose-500/8 rounded-full blur-3xl animate-morph"
            style={{ animationDelay: '-4s' }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-violet-400/6 to-purple-500/4 rounded-full blur-2xl animate-morph"
            style={{ animationDelay: '-6s' }}
          />
        </div>

        {/* 로고 */}
        <motion.div
          className="relative flex flex-col items-center mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-300/30">
            <Heart size={30} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">다시 만나요!</h2>
          <p className="text-slate-400 text-sm mt-1.5">설레는 인연이 기다리고 있어요</p>
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {formContent}
        </motion.div>

        <motion.div
          className="relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
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

          <p className="text-center text-sm text-slate-400 mt-3">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="hover:text-slate-600 hover:underline transition-colors"
            >
              비밀번호를 잊으셨나요?
            </button>
          </p>
        </motion.div>
      </div>
    </MobileLayout>
  );
};

export default LoginPage;
