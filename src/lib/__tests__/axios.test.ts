import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { apiClient } from '@/lib/axios';

// --- 인터셉터 핸들러 헬퍼 ---

type RequestHandler = (config: InternalAxiosRequestConfig) => InternalAxiosRequestConfig;
type ResponseErrorHandler = (error: unknown) => Promise<unknown>;

const getRequestFulfilled = (): RequestHandler => {
  const mgr = apiClient.interceptors.request as unknown as {
    handlers: Array<{ fulfilled: RequestHandler } | null>;
  };
  const handler = mgr.handlers.find((h) => h !== null);
  if (!handler) throw new Error('No request interceptor found');
  return handler.fulfilled;
};

const getResponseRejected = (): ResponseErrorHandler => {
  const mgr = apiClient.interceptors.response as unknown as {
    handlers: Array<{ rejected: ResponseErrorHandler } | null>;
  };
  const handler = mgr.handlers.find((h) => h !== null);
  if (!handler) throw new Error('No response interceptor found');
  return handler.rejected;
};

/** AxiosError를 직접 생성하는 헬퍼 */
const makeAxios401 = (url = '/v1/some/endpoint'): AxiosError => {
  const err = new AxiosError('Unauthorized', 'ERR_BAD_REQUEST');
  err.config = { url, headers: {} } as InternalAxiosRequestConfig;
  err.response = {
    status: 401,
    data: {},
    headers: {},
    config: err.config,
    statusText: 'Unauthorized',
  } as AxiosResponse;
  return err;
};

describe('apiClient interceptors', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // ─────────────────────────────────────────────
  // 요청 인터셉터
  // ─────────────────────────────────────────────
  describe('요청 인터셉터', () => {
    it('accessToken이 있을 때 Authorization 헤더 첨부', () => {
      localStorage.setItem('accessToken', 'my-token');
      const handler = getRequestFulfilled();
      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = handler(config);
      expect(result.headers['Authorization']).toBe('Bearer my-token');
    });

    it('accessToken이 없을 때 Authorization 헤더 미첨부', () => {
      const handler = getRequestFulfilled();
      const config = { headers: {} } as InternalAxiosRequestConfig;
      const result = handler(config);
      expect(result.headers['Authorization']).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────
  // 응답 인터셉터
  // ─────────────────────────────────────────────
  describe('응답 인터셉터', () => {
    it('axios 에러가 아닌 경우 원본 에러 그대로 reject', async () => {
      const handler = getResponseRejected();
      const genericError = new Error('generic');
      await expect(handler(genericError)).rejects.toBe(genericError);
    });

    it('401이 아닌 500 에러는 갱신 없이 그대로 reject', async () => {
      const handler = getResponseRejected();
      const err = new AxiosError('Server error', 'ERR_BAD_RESPONSE');
      err.config = { url: '/v1/test', headers: {} } as InternalAxiosRequestConfig;
      err.response = { status: 500, data: {}, headers: {}, config: err.config, statusText: 'Internal Server Error' } as AxiosResponse;
      await expect(handler(err)).rejects.toBeInstanceOf(AxiosError);
    });

    it('로그인 URL(/v1/auth/login)의 401은 갱신 시도 안 함', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh');
      const postSpy = vi.spyOn(axios, 'post');
      const handler = getResponseRejected();
      const err = makeAxios401('/v1/auth/login');
      await expect(handler(err)).rejects.toBeInstanceOf(AxiosError);
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('_retry 플래그가 있는 요청은 갱신 재시도 안 함', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh');
      const postSpy = vi.spyOn(axios, 'post');
      const handler = getResponseRejected();
      const err = makeAxios401('/v1/protected');
      (err.config as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;
      await expect(handler(err)).rejects.toBeInstanceOf(AxiosError);
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('401 시 refreshToken으로 axios.post 재발급 호출', async () => {
      localStorage.setItem('refreshToken', 'valid-refresh-token');
      const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          result: 'SUCCESS',
          data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
          error: null,
        },
      });
      // apiClient(originalRequest) retry를 네트워크 없이 처리하기 위해 adapter 교체
      const origAdapter = apiClient.defaults.adapter;
      apiClient.defaults.adapter = async (config) => ({
        data: { result: 'SUCCESS', data: null },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      });

      const handler = getResponseRejected();
      await handler(makeAxios401());
      apiClient.defaults.adapter = origAdapter;

      expect(postSpy).toHaveBeenCalledWith(
        expect.stringContaining('/v1/auth/reissue'),
        { refreshToken: 'valid-refresh-token' },
      );
    });

    it('Refresh 성공 시 새 토큰을 localStorage에 저장', async () => {
      localStorage.setItem('refreshToken', 'old-refresh');
      vi.spyOn(axios, 'post').mockResolvedValue({
        data: {
          result: 'SUCCESS',
          data: { accessToken: 'new-access', refreshToken: 'new-refresh' },
          error: null,
        },
      });
      // apiClient(originalRequest) retry를 네트워크 없이 처리하기 위해 adapter 교체
      const origAdapter = apiClient.defaults.adapter;
      apiClient.defaults.adapter = async (config) => ({
        data: { result: 'SUCCESS', data: null },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
        request: {},
      });

      const handler = getResponseRejected();
      await handler(makeAxios401());
      apiClient.defaults.adapter = origAdapter;

      expect(localStorage.getItem('accessToken')).toBe('new-access');
      expect(localStorage.getItem('refreshToken')).toBe('new-refresh');
    });

    it('Refresh 실패 시 localStorage에서 토큰 삭제', async () => {
      localStorage.setItem('accessToken', 'old-access');
      localStorage.setItem('refreshToken', 'bad-refresh');
      localStorage.setItem('authUser', JSON.stringify({ id: 1 }));

      vi.spyOn(axios, 'post').mockRejectedValue(new Error('Refresh failed'));
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
        configurable: true,
      });

      const handler = getResponseRejected();
      await handler(makeAxios401()).catch(() => {});

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(localStorage.getItem('authUser')).toBeNull();
    });
  });
});
