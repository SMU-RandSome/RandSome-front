export const SERVICE_OPEN_DATE = new Date('2026-05-06T12:00:00+09:00');
export const MATCHING_OPEN_DATE = new Date('2026-05-27T10:00:00+09:00');

const isDev = import.meta.env.DEV;

export const isServiceOpen = (): boolean => isDev || new Date() >= SERVICE_OPEN_DATE;
export const isMatchingOpen = (): boolean => isDev || new Date() >= MATCHING_OPEN_DATE;
