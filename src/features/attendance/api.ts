import { apiClient } from '@/lib/axios';
import type { ApiResponse, AttendanceResponse } from '@/types';

export const getAttendance = (): Promise<ApiResponse<AttendanceResponse>> =>
  apiClient.get<ApiResponse<AttendanceResponse>>('/v1/attendance').then((r) => r.data);

export const checkAttendance = (): Promise<ApiResponse<null>> =>
  apiClient.post<ApiResponse<null>>('/v1/attendance').then((r) => r.data);
