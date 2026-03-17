import { apiClient } from '@/lib/axios';
import type {
  ApiResponse,
  MatchingApplicationRequest,
  MatchingHistoryItem,
  MatchingApplicationStatus,
  MatchingResultDetailItem,
} from '@/types';

export const applyMatching = (body: MatchingApplicationRequest): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/matching', body).then((r) => r.data);

export const getMatchingHistory = (status?: MatchingApplicationStatus): Promise<ApiResponse<MatchingHistoryItem[]>> =>
  apiClient
    .get<ApiResponse<MatchingHistoryItem[]>>('/v1/matching/applications', { params: status ? { status } : undefined })
    .then((r) => r.data);

export const withdrawMatching = (applicationId: number): Promise<ApiResponse<null>> =>
  apiClient
    .post<ApiResponse<null>>(`/v1/matching/applications/${applicationId}/withdraw`)
    .then((r) => r.data);

export const getMatchingResult = (applicationId: number): Promise<ApiResponse<MatchingResultDetailItem[]>> =>
  apiClient
    .get<ApiResponse<MatchingResultDetailItem[]>>(`/v1/matching/applications/${applicationId}/approved`)
    .then((r) => r.data);
