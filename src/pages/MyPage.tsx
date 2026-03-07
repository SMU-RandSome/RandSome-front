import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileLayout } from '@/components/layout/MobileLayout';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/store/authStore';
import { useDisplayMode } from '@/store/displayModeStore';
import { LogOut, Edit2, ChevronRight, UserCheck, UserX } from 'lucide-react';

const MBTI_OPTIONS = [
  { value: 'ISTJ', label: 'ISTJ - 소금형' },
  { value: 'ISFJ', label: 'ISFJ - 권력형' },
  { value: 'INFJ', label: 'INFJ - 예언자형' },
  { value: 'INTJ', label: 'INTJ - 과학자형' },
  { value: 'ISTP', label: 'ISTP - 백과사전형' },
  { value: 'ISFP', label: 'ISFP - 성인군자형' },
  { value: 'INFP', label: 'INFP - 잔다르크형' },
  { value: 'INTP', label: 'INTP - 아이디어형' },
  { value: 'ESTP', label: 'ESTP - 활동가형' },
  { value: 'ESFP', label: 'ESFP - 사교형' },
  { value: 'ENFP', label: 'ENFP - 스파크형' },
  { value: 'ENTP', label: 'ENTP - 발명가형' },
  { value: 'ESTJ', label: 'ESTJ - 사업가형' },
  { value: 'ESFJ', label: 'ESFJ - 친선도모형' },
  { value: 'ENFJ', label: 'ENFJ - 언변능숙형' },
  { value: 'ENTJ', label: 'ENTJ - 지도자형' },
];

interface ProfileState {
  nickname: string;
  mbti: string;
  intro: string;
  idealType: string;
  isCandidate: boolean;
}

interface ModalState {
  isOpen: boolean;
  title: string;
  content: React.ReactNode;
}

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isPWA } = useDisplayMode();

  const [isEditing, setIsEditing] = useState(false);
  const [modal, setModal] = useState<ModalState>({ isOpen: false, title: '', content: null });
  const [profile, setProfile] = useState<ProfileState>({
    nickname: user?.nickname ?? '행복한 쿼카',
    mbti: user?.mbti ?? 'ENFP',
    intro: user?.intro ?? '안녕하세요! 새로운 인연을 찾고 있어요.',
    idealType: '성실하고 대화가 잘 통하는 사람이 좋아요. 같이 맛집 탐방 다니는 걸 좋아했으면 좋겠어요!',
    isCandidate: user?.role === 'ROLE_CANDIDATE',
  });

  const handleLogout = (): void => {
    logout();
    navigate('/');
  };

  const handleSave = (): void => {
    setIsEditing(false);
  };

  const openNotice = (): void => {
    setModal({
      isOpen: true,
      title: '공지사항',
      content: (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-slate-900 mb-1">Randsome 오픈!</h4>
            <p>2026 상명대 축제를 위한 랜덤 매칭 서비스가 오픈되었습니다. 많은 사랑 부탁드립니다!</p>
            <span className="text-xs text-slate-400">2026.05.20</span>
          </div>
          <hr className="border-slate-100" />
          <div>
            <h4 className="font-bold text-slate-900 mb-1">매칭 승인 지연 안내</h4>
            <p>현재 신청자가 몰려 승인이 조금 지연되고 있습니다. 최대 30분 내로 처리될 예정이니 양해 부탁드립니다.</p>
            <span className="text-xs text-slate-400">2026.05.20</span>
          </div>
        </div>
      ),
    });
  };

  const openTerms = (): void => {
    setModal({
      isOpen: true,
      title: '이용약관',
      content: (
        <div className="space-y-2">
          <p>
            <strong>제1조 (목적)</strong>
            <br />
            본 약관은 Randsome 서비스의 이용 조건을 규정합니다.
          </p>
          <p>
            <strong>제2조 (개인정보)</strong>
            <br />
            수집된 개인정보는 매칭 목적 외에는 사용되지 않으며, 축제 종료 후 파기됩니다.
          </p>
          <p>
            <strong>제3조 (환불)</strong>
            <br />
            매칭 신청 후 단순 변심으로 인한 환불은 불가능합니다.
          </p>
          <p>
            <strong>제4조 (책임)</strong>
            <br />
            매칭 후 발생하는 개인 간의 문제에 대해 서비스는 책임을 지지 않습니다.
          </p>
        </div>
      ),
    });
  };

  return (
    <MobileLayout>
      {isPWA && (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100 px-4 h-14 flex items-center justify-between">
          <h1 className="text-lg font-bold text-slate-900">마이페이지</h1>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-slate-600"
            aria-label="로그아웃"
          >
            <LogOut size={20} />
          </button>
        </header>
      )}

      <div className={`flex-1 overflow-y-auto p-5 ${isPWA ? 'pb-24' : 'pb-8'}`}>
        {/* 프로필 카드 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-6 text-center relative overflow-hidden">
          <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center text-blue-500 text-3xl font-bold">
            {profile.nickname[0]}
          </div>

          {isEditing ? (
            <div className="space-y-4 text-left">
              <Select
                label="MBTI"
                options={MBTI_OPTIONS}
                value={profile.mbti}
                onChange={(e) => setProfile({ ...profile, mbti: e.target.value })}
              />
              <Textarea
                label="한줄 소개"
                value={profile.intro}
                onChange={(e) => setProfile({ ...profile, intro: e.target.value })}
              />
              <Textarea
                label="나의 이상형"
                placeholder="어떤 사람을 찾고 계신가요?"
                value={profile.idealType}
                onChange={(e) => setProfile({ ...profile, idealType: e.target.value })}
              />
              <div className="flex gap-2 pt-2">
                <Button variant="outline" fullWidth onClick={() => setIsEditing(false)}>
                  취소
                </Button>
                <Button fullWidth onClick={handleSave}>
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{profile.nickname}</h2>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
                  {profile.mbti}
                </span>
                {profile.isCandidate && (
                  <span className="inline-block px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full">
                    후보자
                  </span>
                )}
              </div>

              <div className="text-left space-y-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-slate-500 mb-1">한줄 소개</p>
                  <p className="text-slate-700 text-sm leading-relaxed">&ldquo;{profile.intro}&rdquo;</p>
                </div>
                <div className="bg-pink-50 p-4 rounded-xl">
                  <p className="text-xs font-bold text-pink-500 mb-1">나의 이상형</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{profile.idealType}</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="mx-auto flex items-center gap-2"
                onClick={() => setIsEditing(true)}
              >
                <Edit2 size={14} /> 프로필 수정
              </Button>
            </>
          )}
        </div>

        {/* 후보 상태 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                profile.isCandidate ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
              }`}
            >
              {profile.isCandidate ? <UserCheck size={20} /> : <UserX size={20} />}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">
                {profile.isCandidate ? '매칭 후보 등록됨' : '매칭 후보 미등록'}
              </p>
              <p className="text-xs text-slate-500">
                {profile.isCandidate
                  ? '다른 친구들이 나를 찾을 수 있어요!'
                  : '등록하면 매칭 확률이 올라가요!'}
              </p>
            </div>
          </div>
        </div>

        {/* 메뉴 */}
        <div className="space-y-2">
          {[
            { label: '공지사항', onClick: openNotice },
            { label: '이용약관', onClick: openTerms },
            { label: '문의하기', onClick: () => {} },
          ].map(({ label, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="w-full bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-700 font-medium">{label}</span>
              <ChevronRight size={18} className="text-slate-400" />
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">Randsome v1.0.0</p>
        </div>
      </div>

      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        title={modal.title}
      >
        {modal.content}
      </Modal>

      <BottomNav />
    </MobileLayout>
  );
};

export default MyPage;
