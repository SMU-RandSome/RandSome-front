export const SERVICE_OPEN_DATE = new Date('2025-05-06T12:00:00+09:00');
export const MATCHING_OPEN_DATE = new Date('2025-05-27T10:00:00+09:00');

export const isServiceOpen = (): boolean => new Date() >= SERVICE_OPEN_DATE;
export const isMatchingOpen = (): boolean => new Date() >= MATCHING_OPEN_DATE;
