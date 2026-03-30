import { apiClient } from '@/lib/axios';
import type { DeviceTokenSyncRequest } from '@/types';

export const syncDeviceToken = (body: DeviceTokenSyncRequest): Promise<void> =>
  apiClient.patch('/v1/members/devices', body);

export const deleteDeviceToken = (): Promise<void> =>
  apiClient.delete('/v1/members/devices');
