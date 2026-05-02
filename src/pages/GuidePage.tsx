import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { useDisplayMode } from '@/store/displayModeStore';
import {
  ArrowLeft,
  Heart,
  Mail,
  UserCheck,
  UserPlus,
  Shuffle,
  Sparkles,
  Eye,
  AlertTriangle,
  Calendar,
  QrCode,
  Gift,
  Ticket,
  CheckCircle2,
} from 'lucide-react';
import { motion } from 'motion/react';

const SIGNUP_STEPS = [
  {
    num: '01',
    icon: Mail,
    color: 'text-blue-500 bg-blue-50 border-blue-100',
    badge: 'bg-blue-100 text-blue-700',
    title: '이메일 인증',
    desc: '학교 웹메일(@sangmyung.kr)로 인증 코드를 받아 본인 확인을 완료해요.',
  },
  {
    num: '02',
    icon: UserCheck,
    color: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    badge: 'bg-emerald-100 text-emerald-700',
    title: '프로필 설정',
    desc: '이름, 학과, 성별, MBTI, 인스타그램 ID(필수)를 입력해요.',
  },
  {
    num: '03',
    icon: Sparkles,
    color: 'text-pink-500 bg-pink-50 border-pink-100',
    badge: 'bg-pink-100 text-pink-700',
    title: '이상형 & 태그',
    desc: '자기소개, 이상형 설명, 나를 표현하는 태그를 선택해요. 매칭 알고리즘에 활용돼요.',
  },
] as const;

const EARN_METHODS = [
  { icon: Gift, label: '회원가입 보상', desc: '가입 시 자동 지급', color: 'text-violet-500', bg: 'bg-violet-50 border-violet-100' },
  { icon: Calendar, label: '매일 출석 체크', desc: '랜덤권 1장/일', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
  { icon: QrCode, label: '축제 부스 QR', desc: '랜덤권 2장 or 이상형권 1장', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
  { icon: Ticket, label: '쿠폰 이벤트', desc: '이벤트별 상이', color: 'text-orange-500', bg: 'bg-orange-50 border-orange-100' },
] as const;

const WARNINGS = [
  '허위 프로필 작성 시 신고 및 서비스 이용 제한을 받을 수 있어요.',
  '매칭 결과는 환불되지 않아요. 매칭 불발 시에만 티켓이 환불돼요.',
  '관리자 승인까지 최대 약 10분 소요될 수 있어요.',
  '매칭 후보 등록 취소 후 재등록도 가능해요.',
];

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="font-bold text-slate-800 text-sm mb-3">{children}</h2>
);

const GuidePage: React.FC = () => {
  const navigate = useNavigate();
  const { isPWA } = useDisplayMode();

  const content = (
    <div className="pb-10 relative">
      {/* 배경 orbs */}
      <div className="pointer-events-none absolute -top-10 right-0 w-52 h-52 rounded-full bg-gradient-to-br from-blue-300/20 to-pink-400/10 blur-3xl" />
      <div className="pointer-events-none absolute top-[600px] -left-10 w-40 h-40 rounded-full bg-gradient-to-br from-violet-300/15 to-indigo-300/10 blur-3xl" />

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
        <h1 className="font-display text-2xl text-slate-900">이용 가이드</h1>
      </motion.div>

      {/* Hero */}
      <motion.div
        className="relative rounded-3xl bg-slate-950 overflow-hidden mb-7 border border-slate-800"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-pink-500/20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute -right-8 -bottom-8 opacity-[0.05] pointer-events-none">
          <Heart size={140} fill="currentColor" className="text-white" />
        </div>
        <div className="absolute top-5 right-5 w-20 h-20 border border-white/10 rounded-full" />
        <div className="absolute top-9 right-9 w-10 h-10 border border-white/8 rounded-full" />

        <div className="relative p-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 text-white/80 text-xs font-semibold rounded-full mb-5 border border-white/10">
            <Sparkles size={11} className="text-amber-300" />
            2026 상명대학교 축제 서비스
          </span>
          <h2 className="font-display text-4xl text-white leading-tight mb-2">
            <span className="text-blue-400">Rand</span><span className="text-pink-400">some</span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            복잡한 부스 없이, 온라인으로 간편하게.<br />
            새로운 인연을 만드는 랜덤 매칭 서비스예요.
          </p>
        </div>
      </motion.div>

      {/* 이용 자격 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.1 }}
        className="mb-7"
      >
        <SectionTitle>이용 자격</SectionTitle>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <UserCheck size={18} className="text-emerald-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm mb-0.5">상명대학교 학생만 이용 가능해요</p>
              <p className="text-xs text-slate-500">21학번 이상 · @sangmyung.kr 이메일 필요</p>
            </div>
          </div>
          <div className="space-y-2 pt-3 border-t border-slate-100">
            {[
              '상명대학교 학생 (21학번 이상, 2021년 이후 입학)',
              '@sangmyung.kr 학교 이메일 보유',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                <p className="text-xs text-slate-600">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 회원가입 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15 }}
        className="mb-7"
      >
        <SectionTitle>회원가입 방법</SectionTitle>
        <div className="space-y-3">
          {SIGNUP_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4 flex items-start gap-4"
              >
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${step.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${step.badge}`}>
                      STEP {step.num}
                    </span>
                    <p className="font-bold text-slate-800 text-sm">{step.title}</p>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 티켓 시스템 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.2 }}
        className="mb-7"
      >
        <SectionTitle>티켓 시스템</SectionTitle>
        {/* 티켓 타입 */}
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div className="relative rounded-2xl overflow-hidden p-4 border border-blue-200/60" style={{ background: 'linear-gradient(135deg, #eff6ff, #eef2ff)' }}>
            <div className="absolute -right-3 -bottom-3 opacity-10">
              <Shuffle size={48} className="text-blue-600" />
            </div>
            <p className="text-[10px] font-bold text-blue-500 mb-1">랜덤권</p>
            <p className="text-xs font-bold text-slate-800 leading-snug">무작위 매칭</p>
            <p className="text-[10px] text-slate-500 mt-1">성별이 다른 후보자 중 랜덤 선택</p>
          </div>
          <div className="relative rounded-2xl overflow-hidden p-4 border border-pink-200/60" style={{ background: 'linear-gradient(135deg, #fdf2f8, #faf5ff)' }}>
            <div className="absolute -right-3 -bottom-3 opacity-10">
              <Sparkles size={48} className="text-pink-600" />
            </div>
            <p className="text-[10px] font-bold text-pink-500 mb-1">이상형권</p>
            <p className="text-xs font-bold text-slate-800 leading-snug">이상형 기반 매칭</p>
            <p className="text-[10px] text-slate-500 mt-1">취향·태그 기반 추천 알고리즘</p>
          </div>
        </div>
        {/* 티켓 획득 방법 */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4">
          <p className="text-xs font-bold text-slate-600 mb-3">티켓 획득 방법</p>
          <div className="grid grid-cols-2 gap-2">
            {EARN_METHODS.map(({ icon: Icon, label, desc, color, bg }) => (
              <div key={label} className={`rounded-xl border px-3 py-2.5 ${bg}`}>
                <Icon size={14} className={`${color} mb-1.5`} />
                <p className="text-[11px] font-bold text-slate-700">{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 매칭 후보 등록 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.25 }}
        className="mb-7"
      >
        <SectionTitle>매칭 후보 등록 (선택)</SectionTitle>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
              <UserPlus size={18} className="text-indigo-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm mb-0.5">다른 사람이 나를 매칭할 수 있어요</p>
              <p className="text-xs text-slate-500">후보로 등록하면 매칭 풀에 노출돼요</p>
            </div>
          </div>
          {/* 플로우 */}
          <div className="flex items-center gap-1.5">
            {[
              { label: '등록 신청', color: 'bg-indigo-100 text-indigo-700' },
              { label: '승인 대기', color: 'bg-amber-100 text-amber-700' },
              { label: '매칭 풀 등록', color: 'bg-emerald-100 text-emerald-700' },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                <span className={`flex-1 text-center text-[10px] font-bold px-2 py-1.5 rounded-lg ${item.color}`}>
                  {item.label}
                </span>
                {i < 2 && <span className="text-slate-300 text-xs">›</span>}
              </React.Fragment>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-2.5 text-center">승인까지 최대 약 10분 소요 · 언제든 철회 가능</p>
        </div>
      </motion.div>

      {/* 매칭 신청 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.3 }}
        className="mb-7"
      >
        <SectionTitle>매칭 신청 방법</SectionTitle>
        <div className="space-y-2.5">
          {/* 핵심 정책 강조 배너 */}
          <div className="rounded-2xl border border-indigo-200/70 overflow-hidden" style={{ background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)' }}>
            <div className="px-4 pt-3 pb-2 border-b border-indigo-100/60">
              <p className="text-[11px] font-bold text-indigo-500 tracking-wide">매칭 핵심 규칙</p>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="text-base leading-none mt-0.5">🏫</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">같은 학과끼리는 매칭되지 않아요</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">자율전공학부는 예외로 같은 학부 내에서 매칭될 수 있어요</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="text-base leading-none mt-0.5">🔒</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">실명과 학과는 상대방에게 공개되지 않아요</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">닉네임, MBTI, 태그, 자기소개만 공개돼요</p>
                </div>
              </div>
            </div>
          </div>
          {/* 무작위 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Shuffle size={18} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">랜덤권 사용</span>
                <p className="font-bold text-slate-800 text-sm">무작위 매칭</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">성별이 다른 후보자 중 랜덤으로 매칭해요. 1~5명까지 신청 가능해요.</p>
            </div>
          </div>
          {/* 이상형 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-4 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-100 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-pink-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-700">이상형권 사용</span>
                <p className="font-bold text-slate-800 text-sm">이상형 기반 매칭</p>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">성격·외모·연애스타일·MBTI 태그를 선택하면 알고리즘이 추천해요. 1~5명까지 신청 가능해요.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-1">
            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
            <p className="text-[11px] text-slate-500">매칭 불발 또는 부분 매칭 시 해당 티켓은 자동 환불돼요</p>
          </div>
        </div>
      </motion.div>

      {/* 결과 확인 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.35 }}
        className="mb-7"
      >
        <SectionTitle>결과 확인</SectionTitle>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/80 p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <Eye size={18} className="text-rose-500" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-sm mb-1">신청내역에서 카드 형태로 확인</p>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">관리자 승인 후 매칭 결과가 열려요.</p>
              {/* 실명·학과 비공개 강조 */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 mb-3">
                <span className="text-sm">🔒</span>
                <p className="text-[11px] font-bold text-white">실명·학과는 상대방에게 공개되지 않아요</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {['닉네임 · 성별', 'MBTI · 태그', '자기소개', '인스타그램 ID'].map((item) => (
                  <div key={item} className="px-2.5 py-1.5 bg-slate-50 rounded-lg text-center">
                    <p className="text-[10px] font-medium text-slate-500">{item}</p>
                  </div>
                ))}
              </div>
              {/* 인스타그램 강조 */}
              <div className="rounded-xl border border-pink-200/60 overflow-hidden" style={{ background: 'linear-gradient(135deg, #fdf2f8, #faf5ff)' }}>
                <div className="px-3 py-2.5 flex items-start gap-2.5">
                  <span className="text-base leading-none mt-0.5">📸</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">인스타그램 ID가 유일한 연락 수단이에요</p>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">매칭 상대의 인스타그램 ID가 공개돼요. 직접 DM을 보내 먼저 인사해보세요!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 주의 사항 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.4 }}
        className="mb-7"
      >
        <SectionTitle>주의 사항</SectionTitle>
        <div className="rounded-2xl border border-orange-200/60 bg-orange-50/60 p-5">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={16} className="text-orange-500 shrink-0" />
            <p className="font-bold text-orange-700 text-sm">반드시 확인해 주세요</p>
          </div>
          <div className="space-y-2.5">
            {WARNINGS.map((warning) => (
              <div key={warning} className="flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-orange-400 shrink-0 mt-1.5" />
                <p className="text-xs text-orange-700/80 leading-relaxed">{warning}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.45 }}
      >
        <button
          type="button"
          onClick={() => navigate('/signup')}
          className="w-full py-[15px] rounded-[18px] text-white text-[15px] font-bold flex items-center justify-center gap-2 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #6366f1)',
            boxShadow: '0 8px 32px rgba(59,130,246,.25)',
          }}
        >
          <Heart size={18} fill="currentColor" />
          지금 시작하기
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-3">
          가입 시 이용약관 및 개인정보 처리방침에 동의하게 돼요
        </p>
      </motion.div>
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

export default GuidePage;
