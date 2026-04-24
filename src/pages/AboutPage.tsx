import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import { ArrowLeft, Heart, Server, Sparkles, Cloud, Bot, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface HumanDeveloper {
  type: 'human';
  name: string;
  role: string | string[];
  major: string;
  highlight: string;
  accent: 'emerald' | 'rose' | 'sky';
}

interface AIDeveloper {
  type: 'ai';
  name: string;
  role: string;
  highlight: string;
}

type Developer = HumanDeveloper | AIDeveloper;

const DEVELOPERS: Developer[] = [
  {
    type: 'ai',
    name: 'Claude Code',
    role: 'Frontend Developer',
    highlight: 'UI/UX 구현 및 프론트엔드 아키텍처 전반',
  },
  {
    type: 'ai',
    name: 'Claude Design',
    role: 'Designer',
    highlight: '서비스 전체 UI 디자인 및 비주얼 아이덴티티',
  },
  {
    type: 'human',
    name: 'Taepung Kwak',
    role: ['Team Lead', 'Product Manager', 'Backend Developer'],
    major: '소프트웨어학과 22학번',
    highlight: '프로젝트 기획 및 팀 리딩',
    accent: 'emerald',
  },
  {
    type: 'human',
    name: 'Daniel Shin',
    role: 'Infrastructure Developer',
    major: '소프트웨어학과 22학번',
    highlight: '운영 환경 구성 및 배포 안정화',
    accent: 'rose',
  },
  {
    type: 'human',
    name: 'Mcdonald Oh',
    role: 'QA',
    major: '소프트웨어학과 22학번',
    highlight: '서비스 품질 검증 및 테스트',
    accent: 'sky',
  },
];

const TECH_STACK = [
  {
    label: 'Frontend',
    color: 'text-blue-600 bg-blue-50 border-blue-100',
    items: ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'TanStack Query'],
  },
  {
    label: 'Backend',
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    items: ['Spring Boot 3.5', 'Java 21', 'MySQL', 'Redis'],
  },
  {
    label: 'Infra',
    color: 'text-rose-600 bg-rose-50 border-rose-100',
    items: ['AWS ECS Fargate', 'Firebase FCM', 'Nginx'],
  },
];

const accentStyle: Record<HumanDeveloper['accent'], { card: string; badge: string }> = {
  emerald: {
    card: 'border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-teal-50/40',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  rose: {
    card: 'border-rose-200/60 bg-gradient-to-br from-rose-50/80 to-pink-50/40',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
  },
  sky: {
    card: 'border-sky-200/60 bg-gradient-to-br from-sky-50/80 to-blue-50/40',
    badge: 'bg-sky-100 text-sky-700 border-sky-200',
  },
};

const AICard: React.FC<{ dev: AIDeveloper; index: number }> = ({ dev, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
    className="relative rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden p-5 shadow-[0_8px_32px_rgba(15,23,42,0.15)]"
  >
    {/* 배경 그라디언트 */}
    <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-blue-600/10 to-cyan-500/10 pointer-events-none" />
    {/* 반짝임 */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-400/40 to-transparent" />

    <div className="relative flex items-start gap-4">
      {/* 아이콘 */}
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-violet-500/30">
        <Bot size={22} className="text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-bold text-white text-base">{dev.name}</p>
          <span className="px-1.5 py-0.5 bg-violet-500/20 border border-violet-400/30 text-violet-300 text-[10px] font-bold rounded-md tracking-wide">AI</span>
        </div>
        <p className="text-slate-400 text-xs mb-2">{dev.role} · Powered by Anthropic</p>
        <p className="text-[11px] text-violet-300 font-medium">{dev.highlight}</p>
      </div>
    </div>
  </motion.div>
);

const HumanCard: React.FC<{ dev: HumanDeveloper; index: number }> = ({ dev, index }) => {
  const style = accentStyle[dev.accent];
  const roles = Array.isArray(dev.role) ? dev.role : [dev.role];
  const hasRole = (keyword: string) => roles.some(r => r.includes(keyword));
  const Icon = hasRole('Backend') ? Server : hasRole('QA') ? ShieldCheck : Cloud;
  const iconColor = dev.accent === 'emerald' ? 'text-emerald-500' : dev.accent === 'sky' ? 'text-sky-500' : 'text-rose-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.08 }}
      className={`rounded-2xl border backdrop-blur-sm overflow-hidden p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)] ${style.card}`}
    >
      <div className="flex items-start gap-4">
        {/* 아이콘 */}
        <div className="w-12 h-12 rounded-2xl bg-white/80 border border-white/70 flex items-center justify-center shrink-0 shadow-sm">
          <Icon size={20} className={iconColor} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-bold text-slate-900 text-base">{dev.name}</p>
          </div>
          <div className="mb-2 flex flex-col items-start gap-1">
            <div className="flex flex-wrap gap-1">
              {roles.map(r => (
                <span key={r} className="px-2 py-0.5 rounded-md bg-white/70 border border-slate-200/70 text-[11px] text-slate-600 font-semibold">
                  {r}
                </span>
              ))}
            </div>
            <span className="px-2 py-0.5 rounded-md bg-white/70 border border-slate-200/70 text-[11px] text-slate-500">
              {dev.major}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 font-medium">{dev.highlight}</p>
        </div>
      </div>
    </motion.div>
  );
};

const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();

  const content = (
    <div className="pb-10 relative">
      {/* 배경 orbs */}
      <div className="pointer-events-none absolute -top-10 right-0 w-52 h-52 rounded-full bg-gradient-to-br from-violet-300/20 to-blue-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-96 -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-rose-300/15 to-orange-300/10 blur-3xl" />

      {/* 헤더 */}
      <motion.div
        className="flex items-center gap-3 mb-8 relative"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="뒤로 가기"
          className="w-9 h-9 rounded-xl bg-white/70 border border-slate-200/60 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-white transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="font-display text-2xl text-slate-900">팀원 소개</h1>
      </motion.div>

      {/* 히어로 */}
      <motion.div
        className="relative rounded-3xl bg-slate-950 overflow-hidden mb-7 border border-slate-800"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-rose-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute -right-8 -bottom-8 opacity-[0.05] pointer-events-none">
          <Heart size={140} fill="currentColor" className="text-white" />
        </div>
        {/* 장식 원 */}
        <div className="absolute top-5 right-5 w-20 h-20 border border-white/10 rounded-full" />
        <div className="absolute top-9 right-9 w-10 h-10 border border-white/8 rounded-full" />

        <div className="relative p-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/80 text-xs font-semibold rounded-full mb-5 border border-white/10">
            <Sparkles size={11} className="text-amber-300" />
            2026 상명대학교 축제 프로젝트
          </span>
          <h2 className="font-display text-4xl text-white leading-tight mb-2">
            <span className="text-blue-400">Rand</span><span className="text-pink-400">some</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-5">
            설레는 축제, 새로운 인연을 이어주는<br />
            상명대학교 랜덤 매칭 서비스
          </p>
          <div className="flex gap-3">
            {[
              { label: '총 인원', value: '4명' },
              { label: '플랫폼', value: 'Web + PWA' },
            ].map(({ label, value }) => (
              <div key={label} className="flex-1 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-center">
                <p className="text-white text-sm font-bold">{value}</p>
                <p className="text-slate-500 text-[10px] mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 팀원 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="mb-7"
      >
        <h2 className="font-bold text-slate-800 text-sm mb-3">팀원</h2>
        <div className="space-y-3">
          {DEVELOPERS.map((dev, i) =>
            dev.type === 'ai'
              ? <AICard key={dev.role} dev={dev} index={i} />
              : <HumanCard key={dev.name} dev={dev} index={i} />
          )}
        </div>
      </motion.div>

      {/* 기술 스택 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
      >
        <h2 className="font-bold text-slate-800 text-sm mb-3">기술 스택</h2>
        <div className="space-y-2">
          {TECH_STACK.map((stack) => (
            <div
              key={stack.label}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 px-4 py-3.5 flex items-start gap-3"
            >
              <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0 mt-0.5 ${stack.color}`}>
                {stack.label}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stack.items.map((item) => (
                  <span key={item} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] rounded-lg font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="mt-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 px-4 py-3.5"
      >
        <p className="text-[11px] font-semibold text-slate-500">서비스 관리자</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5">소프트웨어학과 학생회</p>
      </motion.div>

      {/* 푸터 */}
      <motion.p
        className="text-center text-xs text-slate-400 mt-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.35 }}
      >
        Made with <Heart size={10} className="inline text-pink-400 mx-0.5" fill="currentColor" /> for 상명대학교 축제
      </motion.p>
    </div>
  );

  return (
    <MobileLayout className="bg-[#F8FAFF]">
      <div className={isPWA ? 'px-5 pt-5' : 'mx-auto max-w-2xl px-5 py-5'}>
        {content}
      </div>
    </MobileLayout>
  );
};

export default AboutPage;
