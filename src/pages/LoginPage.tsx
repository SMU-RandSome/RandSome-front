import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { ChevronLeft, Heart } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isPWA } = useDisplayMode();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (!email || !password) return;

    login({
      id: 1,
      email,
      nickname: '행복한 쿼카',
      mbti: 'ENFP',
      intro: '안녕하세요! 새로운 인연을 찾고 있어요.',
      gender: 'male',
      role: 'ROLE_MEMBER',
      instagramId: 'happy_quokka',
    });
    navigate('/home');
  };

  const handleAdminLogin = (): void => {
    login({
      id: 0,
      email: 'admin@sangmyung.kr',
      nickname: '관리자',
      mbti: 'INTJ',
      intro: '',
      gender: 'male',
      role: 'ROLE_ADMIN',
    });
    navigate('/admin');
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="학교 이메일"
        type="email"
        placeholder="example@sangmyung.kr"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        label="비밀번호"
        type="password"
        placeholder="비밀번호를 입력해주세요"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div className="pt-2">
        <Button fullWidth size="lg" disabled={!email || !password}>
          로그인하기
        </Button>
      </div>
    </form>
  );

  return (
    <div className="relative">
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

      {/* 관리자 숨김 버튼 — 개발 환경 전용 */}
      {import.meta.env.DEV && (
        <button
          onClick={handleAdminLogin}
          className="absolute top-0 right-0 p-4 w-16 h-16 opacity-0 z-50"
          aria-label="Admin Access"
          tabIndex={-1}
        />
      )}
    </div>
  );
};

export default LoginPage;
