import { apiClient } from '@/lib/axios';
import type { ApiResponse, ReportCreateRequest } from '@/types';

export const createReport = (body: ReportCreateRequest): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/reports', body).then((r) => r.data);
