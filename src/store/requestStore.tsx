import React, { createContext, useContext, useState, ReactNode } from 'react';

type RequestType = 'register' | 'match_random' | 'match_ideal';

interface PartnerProfile {
  id: number;
  nickname: string;
  mbti: string;
  intro: string;
  gender: 'male' | 'female';
  idealType: string;
  instagramId?: string;
}

interface Match {
  id: number;
  partnerId: number;
  matchedAt: string;
  partnerProfile: PartnerProfile;
}

interface MatchRequest {
  id: number;
  type: RequestType;
  status: 'pending' | 'approved' | 'rejected';
  amount: number;
  count?: number;
  createdAt: string | Date;
  rejectionReason?: string;
  matches?: Match[];
}

interface RequestContextType {
  requests: MatchRequest[];
  addRequest: (request: Omit<MatchRequest, 'id' | 'createdAt' | 'status'>) => void;
}

const RequestContext = createContext<RequestContextType | undefined>(undefined);

const DUMMY_REQUESTS: MatchRequest[] = [
  {
    id: 1,
    type: 'match_random',
    status: 'pending',
    amount: 2000,
    count: 2,
    createdAt: '2026.05.20 14:30',
  },
  {
    id: 2,
    type: 'register',
    status: 'pending',
    amount: 3000,
    createdAt: '2026.05.20 13:00',
  },
  {
    id: 3,
    type: 'match_ideal',
    status: 'approved',
    amount: 1500,
    count: 1,
    createdAt: '2026.05.19 10:00',
    matches: [
      {
        id: 101,
        partnerId: 201,
        matchedAt: '2026.05.19 10:30',
        partnerProfile: {
          id: 201,
          nickname: '즐거운 쿼카',
          mbti: 'ENFP',
          intro:
            '안녕하세요! 저는 상명대학교 22학번 경영학과에 재학 중인 김지수예요 😊 평소에 사람 만나는 걸 정말 좋아하고, 새로운 경험에 항상 두근두근하는 타입이에요. 축제 기간에 이런 서비스가 생겨서 너무 설레는 마음으로 신청했답니다! 취미는 요리, 여행, 그리고 독서예요. 특히 소설 읽는 걸 좋아해서 추천 책 이야기라면 몇 시간이든 얘기할 수 있어요. 카페 투어도 즐겨서 숨은 카페 찾는 게 취미가 됐어요. 같이 맛있는 거 먹으러 다니고 싶은 분 환영해요! 외향적이지만 조용한 시간도 소중히 여기는 편이라 혼자만의 시간도 잘 즐겨요. 편하게 연락주세요 :)',
          gender: 'female',
          idealType:
            '유머 감각이 있고 대화가 자연스럽게 이어지는 분이면 좋겠어요! 억지로 재미있으려 하지 않아도 그냥 있는 그대로의 모습이 편한 사람이요. 취미나 관심사가 다양해서 이야기 소재가 많으면 더욱 좋고요. 저는 음식을 정말 좋아하기 때문에 같이 맛집 탐방 다닐 수 있는 분이면 완벽해요 ㅎㅎ. 진지한 대화도 가끔 나눌 수 있는 깊이 있는 분이면 더 좋을 것 같아요. 나이, 학번, 전공 상관없이 마음이 잘 맞으면 그게 최고라고 생각해요. 무엇보다 서로를 존중하고 배려하는 마음이 가장 중요하다고 생각합니다.',
          instagramId: 'happy_quokka',
        },
      },
    ],
  },
  {
    id: 4,
    type: 'match_random',
    status: 'approved',
    amount: 3000,
    count: 3,
    createdAt: '2026.05.18 15:00',
    matches: [
      {
        id: 102,
        partnerId: 202,
        matchedAt: '2026.05.18 15:30',
        partnerProfile: {
          id: 202,
          nickname: '시크한 고양이',
          mbti: 'ISTP',
          intro:
            '안녕하세요. 컴퓨터공학과 21학번 박민준입니다. 많이 떠들지는 않지만 필요한 말은 확실히 하는 편이에요. 평소엔 음악 듣거나 영화 보는 걸 좋아하고, 혼자 있는 시간도 꽤 즐기는 편입니다. 그렇다고 사람이 싫은 건 아니에요. 편해지면 말도 잘 하고 농담도 잘 해요. 처음엔 좀 어색할 수 있는데 그냥 먼저 말 걸어주시면 잘 받아드릴게요. 헬스 6개월째 하고 있고, 요즘은 요리에도 관심 생겨서 이것저것 만들어 보고 있어요. 자취방에서 파스타 만드는 게 요즘 낙이에요. 부담 없이 연락 주세요.',
          gender: 'male',
          idealType:
            '억지로 분위기 맞추려 하지 않고, 침묵도 편하게 느끼는 분이면 좋겠어요. 시끄럽거나 항상 활발한 분보다는 차분하고 본인 페이스가 있는 분이 잘 맞을 것 같아요. 관심사가 겹치면 더 좋고요. 영화나 음악 취향 이야기 같이 나눌 수 있는 분이면 대화가 자연스럽게 이어질 것 같아요. 무리해서 맞추지 않아도 되고, 저도 그냥 있는 그대로 대할게요. 외모보다 분위기나 생각이 잘 맞는 분을 더 좋아하는 편이에요.',
          instagramId: 'chic_cat_99',
        },
      },
      {
        id: 103,
        partnerId: 203,
        matchedAt: '2026.05.18 15:30',
        partnerProfile: {
          id: 203,
          nickname: '활발한 강아지',
          mbti: 'ESFP',
          intro:
            '안녕하세요!! 체육교육과 23학번 이동현이에요 ㅎㅎ 저는 진짜 축제 너무 좋아하는 사람이에요. 공연 보고, 음식 먹고, 친구들이랑 어울리는 게 세상에서 제일 재밌어요. 평소엔 농구나 풋살 즐겨 하고, 음악도 엄청 좋아해서 항상 이어폰 끼고 다녀요. 최근엔 춤도 배우기 시작했는데 생각보다 재밌더라고요! 사람 에너지 받으면서 더 신나는 스타일이라서 같이 있으면 저도 더 즐거워요. 먹는 거 진짜 좋아하고 잘 먹는 편이에요. 같이 맛있는 거 먹으러 다니거나 축제 부스 같이 돌아다닐 분 있으면 연락 주세요!',
          gender: 'male',
          idealType:
            '같이 있으면 텐션 맞는 분이요! 저도 에너지가 넘치는 편이라 같이 신나게 놀 수 있는 분이면 정말 좋겠어요. 조용하고 차분한 분보다는 적극적으로 참여하는 걸 즐기는 분이 잘 맞을 것 같아요. 웃음 포인트 비슷하면 금방 친해질 수 있을 것 같고, 먹는 걸 좋아하는 분이라면 더 완벽해요! 진지한 관계도 물론 생각하고 있어요. 처음엔 가볍게 친구처럼 만나봐요 :) 나이 크게 상관 안 해요.',
          instagramId: 'active_doggo',
        },
      },
      {
        id: 104,
        partnerId: 204,
        matchedAt: '2026.05.18 15:30',
        partnerProfile: {
          id: 204,
          nickname: '똑똑한 부엉이',
          mbti: 'INTJ',
          intro:
            '안녕하세요. 전자공학과 20학번 정승우입니다. 평소에 말이 많은 편은 아닌데, 관심 있는 주제가 나오면 꽤 오래 이야기하는 편이에요. 독서와 다큐멘터리 시청을 즐기고, 요즘은 천문학과 철학 관련 책을 번갈아 읽고 있어요. 커피를 정말 좋아해서 카페 찾아다니는 게 취미 중 하나예요. 깊이 있는 대화를 나눌 수 있는 자리를 좋아하는 편이라서, 가벼운 대화보다는 서로의 생각을 나눌 수 있는 시간이 더 좋더라고요. 내성적이지만 신뢰가 쌓이면 많이 열리는 스타일이에요. 편하게 연락 주세요.',
          gender: 'male',
          idealType:
            '지적 호기심이 많고, 본인만의 생각과 관점이 있는 분이면 정말 잘 맞을 것 같아요. 대화할 때 단순히 공감만 하는 게 아니라 자기 의견도 잘 말할 수 있는 분이 좋아요. 같은 취미가 없어도 괜찮아요. 오히려 다른 분야에서 뭔가를 깊이 파고 있는 분이라면 서로 배울 게 더 많을 것 같아요. 조용한 카페에서 대화하거나 산책하는 걸 같이 즐길 수 있는 분이면 더할 나위 없겠습니다. 관계에 있어서 진중하고 성실한 분을 원해요.',
          instagramId: 'smart_owl',
        },
      },
    ],
  },
  {
    id: 5,
    type: 'match_random',
    status: 'rejected',
    amount: 1000,
    count: 1,
    createdAt: '2026.05.17 09:00',
    rejectionReason: '입금자명이 신청자 이름과 일치하지 않습니다.',
  },
];

export const RequestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [requests, setRequests] = useState<MatchRequest[]>(DUMMY_REQUESTS);

  const addRequest = (newData: Omit<MatchRequest, 'id' | 'createdAt' | 'status'>): void => {
    const newRequest: MatchRequest = {
      ...newData,
      id: Date.now(),
      status: 'pending',
      createdAt: new Date()
        .toLocaleString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
        .replace(/\. /g, '.')
        .replace(',', ''),
    };
    setRequests((prev) => [newRequest, ...prev]);
  };

  return (
    <RequestContext.Provider value={{ requests, addRequest }}>
      {children}
    </RequestContext.Provider>
  );
};

export const useRequests = (): RequestContextType => {
  const context = useContext(RequestContext);
  if (context === undefined) {
    throw new Error('useRequests must be used within a RequestProvider');
  }
  return context;
};

