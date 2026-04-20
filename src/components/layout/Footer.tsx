import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Github, Users } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {/* 브랜드 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-300/30">
                <Heart size={15} fill="currentColor" />
              </div>
              <span className="font-display text-xl tracking-tight">
                <span className="text-blue-600">Rand</span><span className="text-pink-500">some</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              상명대학교 축제 기간<br />
              이성 랜덤 매칭 서비스
            </p>
          </div>

          {/* 서비스 링크 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Service</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors duration-150"
                >
                  <Users size={12} />
                  개발자 소개
                </Link>
              </li>
              <li>
                <a
                  href="https://www.sangmyung.kr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors duration-150"
                >
                  <span className="w-3 h-3 inline-flex items-center justify-center text-[10px] font-bold leading-none">S</span>
                  상명대학교
                </a>
              </li>
            </ul>
          </div>

          {/* 연락처 */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:randsome@sangmyung.kr"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors duration-150"
                >
                  <Mail size={12} />
                  randsome@sangmyung.kr
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/kwakseobang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 transition-colors duration-150"
                >
                  <Github size={12} />
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px] text-slate-400">
            © 2026 Randsome. 상명대학교 소프트웨어학과 학생회.
          </p>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            Made with <Heart size={9} className="text-pink-400 mx-0.5" fill="currentColor" /> for 상명대학교 축제
          </p>
        </div>
      </div>
    </footer>
  );
};
