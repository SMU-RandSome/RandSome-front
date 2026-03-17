import { apiClient } from '@/lib/axios';
import type { ApiResponse } from '@/types';

export const registerCandidate = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/candidate-registrations').then((r) => r.data);

export const withdrawCandidate = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/candidate-registrations/withdraw').then((r) => r.data);
