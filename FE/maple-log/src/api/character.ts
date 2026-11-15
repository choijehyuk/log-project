import type { CharacterRegisterRequest, CharacterResponse } from '../types/character'
import { apiClient } from './client'

export const characterApi = {
  search: (name: string) => apiClient.get<CharacterResponse>('/characters/search', { params: { name } }),
  register: (body: CharacterRegisterRequest) => apiClient.post<CharacterResponse>('/characters', body),
  autoRegister: () => apiClient.post<CharacterResponse>('/characters/auto-register'),
  getById: (characterId: number) => apiClient.get<CharacterResponse>(`/characters/${characterId}`),
  refresh: (characterId: number) => apiClient.put<CharacterResponse>(`/characters/${characterId}/refresh`),
  getMine: () => apiClient.get<CharacterResponse[]>('/characters/me'),
  setMain: (characterId: number) => apiClient.patch<CharacterResponse>(`/characters/me/${characterId}/main`),
  remove: (characterId: number) => apiClient.delete<void>(`/characters/${characterId}`),
  reorder: (orderedIds: number[]) => apiClient.patch<void>('/characters/me/order', orderedIds),
}
