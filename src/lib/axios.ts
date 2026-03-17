import axios from 'axios';
import type { ApiResponse, TokenResponse } from '@/types';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
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

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) throw new Error('No refresh token');

  const response = await axios.post<ApiResponse<TokenResponse>>(
    `${import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'}/v1/auth/reissue`,
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

    // 401이고 재시도 플래그가 없을 때만 갱신 시도
    if (error.response?.status === 401 && !(originalRequest as typeof originalRequest & { _retry?: boolean })._retry) {
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
        // Refresh 실패 → 로그아웃
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('authUser');
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);
