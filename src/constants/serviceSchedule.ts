export const SERVICE_OPEN_DATE = new Date('2026-05-06T12:00:00+09:00');
export const MATCHING_OPEN_DATE = new Date('2026-05-27T10:00:00+09:00');

/** 운영 환경(Vercel Production)에서만 날짜 차단 적용 */
const isProduction = import.meta.env.VITE_ENV === 'production';

export const isServiceOpen = (): boolean => !isProduction || new Date() >= SERVICE_OPEN_DATE;
export const isMatchingOpen = (): boolean => !isProduction || new Date() >= MATCHING_OPEN_DATE;
