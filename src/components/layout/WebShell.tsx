import React from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { Footer } from '@/components/layout/Footer';
import { Heart } from 'lucide-react';

export const WebShell: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-surface flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/30 shadow-[0_1px_3px_rgba(0,0,0,0.04)] h-16">
        <div className="max-w-4xl mx-auto h-full px-6 flex items-center justify-between w-full">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group"
            aria-label="홈으로 이동"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-300/30 group-hover:shadow-blue-300/50 transition-shadow duration-300">
              <Heart size={18} fill="currentColor" />
            </div>
            <span className="font-display text-2xl tracking-tight">
              <span className="text-blue-600">Rand</span><span className="text-pink-500">some</span>
            </span>
          </button>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-sm font-medium text-slate-500 cursor-default">로그인</span>
            <span className="px-3 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg cursor-default">회원가입</span>
          </div>
        </div>
      </header>

      <main className="flex-1 mt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};
