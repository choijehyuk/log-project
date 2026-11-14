import type { SnapshotResponse, SnapshotSummaryResponse } from '../types/snapshot'
import { apiClient } from './client'

export const snapshotApi = {
  getList: (characterId: number, limit = 30) =>
    apiClient.get<SnapshotResponse[]>(`/characters/${characterId}/snapshots`, { params: { limit } }),
  save: (characterId: number) => apiClient.post<SnapshotResponse>(`/characters/${characterId}/snapshots`),
  getSummary: (characterId: number) =>
    apiClient.get<SnapshotSummaryResponse>(`/characters/${characterId}/snapshots/summary`),
  // TODO: 테스트용 — 배포 전 삭제
  triggerAll: () => apiClient.post('/admin/snapshots/trigger-all'),
}
