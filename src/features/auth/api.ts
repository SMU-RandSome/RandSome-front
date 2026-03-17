import { apiClient } from '@/lib/axios';
import type {
  ApiResponse,
  EmailVerificationRequest,
  EmailVerificationCodeVerifyRequest,
  EmailVerificationTokenResponse,
  LoginRequest,
  TokenResponse,
  TokenReissueRequest,
} from '@/types';

export const sendEmailVerificationCode = (body: EmailVerificationRequest): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/auth/email/verification-codes', body).then((r) => r.data);

export const verifyEmailCode = (body: EmailVerificationCodeVerifyRequest): Promise<ApiResponse<EmailVerificationTokenResponse>> =>
  apiClient
    .post<ApiResponse<EmailVerificationTokenResponse>>('/v1/auth/email/verification-codes/verify', body)
    .then((r) => r.data);

export const login = (body: LoginRequest): Promise<ApiResponse<TokenResponse>> =>
  apiClient.post<ApiResponse<TokenResponse>>('/v1/auth/login', body).then((r) => r.data);

export const reissueToken = (body: TokenReissueRequest): Promise<ApiResponse<TokenResponse>> =>
  apiClient.post<ApiResponse<TokenResponse>>('/v1/auth/reissue', body).then((r) => r.data);
