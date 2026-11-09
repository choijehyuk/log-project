import type { CharacterScheduleResponse } from '../types/schedule'
import { apiClient } from './client'

export const scheduleApi = {
  getToday: (characterId: number) =>
    apiClient.get<CharacterScheduleResponse>(`/characters/${characterId}/schedule/today`),
  getHistory: (characterId: number) =>
    apiClient.get<CharacterScheduleResponse[]>(`/characters/${characterId}/schedule/history`),
  getMyToday: () => apiClient.get<CharacterScheduleResponse[]>('/characters/me/schedules/today'),
  sync: (characterId: number) =>
    apiClient.post<CharacterScheduleResponse>(`/characters/${characterId}/schedule/sync`),
}
