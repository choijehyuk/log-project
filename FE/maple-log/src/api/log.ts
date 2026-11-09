import type { ActivityLogRequest, ActivityLogResponse } from '../types/log'
import { apiClient } from './client'

export const logApi = {
  getList: (characterId: number) => apiClient.get<ActivityLogResponse[]>(`/characters/${characterId}/logs`),
  create: (characterId: number, body: ActivityLogRequest) =>
    apiClient.post<ActivityLogResponse>(`/characters/${characterId}/logs`, body),
  remove: (characterId: number, logId: number) => apiClient.delete<void>(`/characters/${characterId}/logs/${logId}`),
}
