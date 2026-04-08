import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useToast } from '@/components/ui/Toast';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { login as loginApi } from '@/features/auth/api';
import { getMyProfile } from '@/features/member/api';
import { getApiErrorMessage } from '@/lib/axios';
import { ChevronLeft, Heart } from 'lucide-react';
import { motion } from 'motion/react';

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

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email-id" className="block text-sm font-semibold text-slate-700 mb-2">학교 이메일</label>
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-100 transition-all duration-200">
          <input
            id="email-id"
            type="text"
            placeholder="이메일 아이디"
            value={emailId}
            onChange={(e) => setEmailId(e.target.value)}
            className="flex-1 min-w-0 px-4 py-3.5 text-sm outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
          />
          <span className="shrink-0 px-3.5 py-3.5 text-sm text-slate-600 bg-slate-100 border-l border-slate-200 whitespace-nowrap">
            @sangmyung.kr
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">비밀번호</label>
        <input
          id="password"
          type="password"
          placeholder="비밀번호를 입력해주세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all duration-200"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={!emailId || !password || isLoading}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-200/50"
        >
          {isLoading ? '로그인 중...' : '로그인하기'}
        </button>
      </div>
    </form>
  );

  // 웹 환경에서의 레이아웃
  if (!isPWA) {
    return (
      <div className="w-full min-h-screen bg-white flex items-center justify-center py-16 px-4 relative overflow-hidden">
        {/* 배경 그라데이션 오브 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-100/40 to-purple-100/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-100/40 to-purple-100/20 rounded-full blur-3xl" />
        </div>

        <div className="w-full max-w-6xl relative z-10">
          <div className="grid grid-cols-2 gap-16 items-center">
            {/* 좌측: 브랜드 영역 */}
            <motion.div
              className="flex flex-col items-start"
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-blue-300/30"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Heart size={32} fill="currentColor" />
              </motion.div>
              <h1 className="text-5xl font-black text-slate-900 mb-4 leading-tight">
                설레는<br />인연을<br />찾아보세요
              </h1>
              <p className="text-lg text-slate-600 mb-12 leading-relaxed">
                상명대학교 축제 기간,<br />특별한 만남이 시작됩니다
              </p>

              <div className="space-y-4 w-full">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">🎓</span>
                  <div>
                    <p className="text-slate-900 font-semibold">상명대 학생만</p>
                    <p className="text-sm text-slate-600">19학번 이상, @sangmyung.kr</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">💌</span>
                  <div>
                    <p className="text-slate-900 font-semibold">이메일 인증</p>
                    <p className="text-sm text-slate-600">안전한 가입 및 본인 확인</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-2xl">❤️</span>
                  <div>
                    <p className="text-slate-900 font-semibold">특별한 경험</p>
                    <p className="text-sm text-slate-600">더 나은 매칭, 더 좋은 인연</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 우측: 로그인 폼 */}
            <motion.div
              className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xl"
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
            >
              <h2 className="text-3xl font-black text-slate-900 mb-2">로그인</h2>
              <p className="text-slate-600 mb-8">계정으로 로그인하여 인연을 찾아보세요</p>

              {formContent}

              <div className="mt-8 pt-6 border-t border-slate-200 space-y-4">
                <p className="text-sm text-slate-600">
                  아직 계정이 없으신가요?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                  >
                    회원가입하기
                  </button>
                </p>

                <p className="text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    className="text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </p>
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

      <div className="relative flex-1 flex flex-col justify-center p-6 pb-32">
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
