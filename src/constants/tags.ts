import type { PersonalityTag, FaceTypeTag, DatingStyleTag, Mbti } from '@/types';

export const MBTI_OPTIONS: { value: Mbti; label: Mbti }[] = [
  { value: 'ISTJ', label: 'ISTJ' },
  { value: 'ISFJ', label: 'ISFJ' },
  { value: 'INFJ', label: 'INFJ' },
  { value: 'INTJ', label: 'INTJ' },
  { value: 'ISTP', label: 'ISTP' },
  { value: 'ISFP', label: 'ISFP' },
  { value: 'INFP', label: 'INFP' },
  { value: 'INTP', label: 'INTP' },
  { value: 'ESTP', label: 'ESTP' },
  { value: 'ESFP', label: 'ESFP' },
  { value: 'ENFP', label: 'ENFP' },
  { value: 'ENTP', label: 'ENTP' },
  { value: 'ESTJ', label: 'ESTJ' },
  { value: 'ESFJ', label: 'ESFJ' },
  { value: 'ENFJ', label: 'ENFJ' },
  { value: 'ENTJ', label: 'ENTJ' },
];

export const PERSONALITY_TAGS: { value: PersonalityTag; label: string }[] = [
  { value: 'ACTIVE', label: '활발한' },
  { value: 'QUIET', label: '조용한' },
  { value: 'AFFECTIONATE', label: '다정한' },
  { value: 'INDEPENDENT', label: '독립적인' },
  { value: 'FUNNY', label: '유머있는' },
  { value: 'SERIOUS', label: '진지한' },
  { value: 'OPTIMISTIC', label: '긍정적인' },
  { value: 'CAREFUL', label: '신중한' },
  { value: 'EMOTIONAL', label: '감성적인' },
  { value: 'RATIONAL', label: '이성적인' },
  { value: 'CONSIDERATE', label: '배려심 깊은' },
  { value: 'TETO', label: '테토' },
  { value: 'EGEN', label: '에겐' },
];

export const FACE_TYPE_TAGS: { value: FaceTypeTag; label: string }[] = [
  { value: 'PUPPY', label: '강아지상' },
  { value: 'CAT', label: '고양이상' },
  { value: 'BEAR', label: '곰상' },
  { value: 'FOX', label: '여우상' },
  { value: 'RABBIT', label: '토끼상' },
  { value: 'PURE', label: '청순한' },
  { value: 'CHIC', label: '시크한' },
  { value: 'WARM', label: '훈훈한' },
  { value: 'DINOSAUR', label: '공룡상' },
  { value: 'HAMSTER', label: '햄스터상' },
  { value: 'WOLF', label: '늑대상' },
  { value: 'CUTE', label: '귀여운' },
  { value: 'STRONG', label: '강한' },
  { value: 'PRINCE', label: '왕자님상' },
  { value: 'DUBU', label: '두부상' },
  { value: 'JOKER', label: '조커상' },
  { value: 'SNAKE', label: '뱀상' },
];

export const DATING_STYLE_TAGS: { value: DatingStyleTag; label: string }[] = [
  { value: 'FREQUENT_CONTACT', label: '자주 연락' },
  { value: 'MODERATE_CONTACT', label: '적당한 연락' },
  { value: 'PLANNED_DATE', label: '계획형 데이트' },
  { value: 'SPONTANEOUS_DATE', label: '즉흥형 데이트' },
  { value: 'RESPECTFUL_SPACE', label: '각자 시간 존중' },
  { value: 'EXPRESSIVE', label: '감정 표현 잘함' },
  { value: 'GROW_TOGETHER', label: '함께 성장' },
  { value: 'HOME_DATE', label: '집 데이트 선호' },
  { value: 'OUTDOOR_DATE', label: '야외 데이트 선호' },
  { value: 'DEEP_TALK', label: '깊은 대화 선호' },
  { value: 'FRIEND_LIKE', label: '친구같은 연애' },
  { value: 'ROMANTIC', label: '로맨틱한 연애' },
  { value: 'SLOW_STARTER', label: '천천히 알아가기' },
];

// Record 형태 (label 조회용)
export const PERSONALITY_TAG_LABELS: Record<PersonalityTag, string> = Object.fromEntries(
  PERSONALITY_TAGS.map(({ value, label }) => [value, label]),
) as Record<PersonalityTag, string>;

export const FACE_TYPE_TAG_LABELS: Record<FaceTypeTag, string> = Object.fromEntries(
  FACE_TYPE_TAGS.map(({ value, label }) => [value, label]),
) as Record<FaceTypeTag, string>;

export const DATING_STYLE_TAG_LABELS: Record<DatingStyleTag, string> = Object.fromEntries(
  DATING_STYLE_TAGS.map(({ value, label }) => [value, label]),
) as Record<DatingStyleTag, string>;
