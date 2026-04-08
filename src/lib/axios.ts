import axios from 'axios';
import type { ApiResponse, TokenResponse } from '@/types';

const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = ENV_API_BASE_URL
  ? ENV_API_BASE_URL.replace(/\/+$/, '')
  : 'http://localhost:8080';

export const getApiErrorMessage = (err: unknown, fallback = '오류가 발생했습니다.'): string => {
  if (axios.isAxiosError(err)) {
    return (err.response?.data as ApiResponse<unknown> | undefined)?.error?.message ?? fallback;
  }
  return fallback;
};

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터: Access Token 첨부
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 진행 중인 토큰 갱신 요청 (중복 방지)
let refreshPromise: Promise<string> | null = null;
// 로그아웃 리다이렉트 중복 실행 방지
let isRedirectingToLogin = false;

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post<ApiResponse<TokenResponse>>(
    `${API_BASE_URL}/v1/auth/reissue`,
    { refreshToken },
  );

  const tokens = response.data.data;
  if (!tokens) throw new Error('Token reissue failed');

  localStorage.setItem('accessToken', tokens.accessToken);
  localStorage.setItem('refreshToken', tokens.refreshToken);
  return tokens.accessToken;
};

// 응답 인터셉터: 401 시 Refresh Token으로 갱신 후 재시도
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    // 401이고 재시도 플래그가 없을 때만 갱신 시도 (로그인 요청 자체는 제외)
    if (
      error.response?.status === 401 &&
      !(originalRequest as typeof originalRequest & { _retry?: boolean })._retry &&
      !originalRequest.url?.includes('/v1/auth/login')
    ) {
      (originalRequest as typeof originalRequest & { _retry?: boolean })._retry = true;

      try {
        // 동시에 여러 요청이 401을 받을 때 갱신 요청을 하나만 보냄
        if (!refreshPromise) {
          refreshPromise = refreshAccessToken().finally(() => {
            refreshPromise = null;
          });
        }
        const newToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch {
        // Refresh 실패 → 로그아웃 (동시에 여러 요청이 실패해도 한 번만 실행)
        if (!isRedirectingToLogin) {
          isRedirectingToLogin = true;
          const wasAuthenticated = !!localStorage.getItem('authUser');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authUser');
          if (wasAuthenticated) {
            // 실제 인증 상태였을 때만 로그인 페이지로 리다이렉트
            window.location.href = '/login';
          } else {
            // 비회원이 공개 API 호출 중 만료된 토큰으로 401이 난 경우 → 리다이렉트 없이 토큰만 정리
            isRedirectingToLogin = false;
          }
        }
        return Promise.reject(error);
      }
    }

    // 403 Forbidden: 권한 없음
    if (error.response?.status === 403) {
      console.error('403 Forbidden:', error.response);
      // Toast는 에러를 받는 쪽에서 처리하도록 여기선 로그만
      return Promise.reject(error);
    }

    return Promise.reject(error);
  },
);
