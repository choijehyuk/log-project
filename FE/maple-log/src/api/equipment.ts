import type { EquipmentItem } from '../types/equipment'
import { apiClient } from './client'

export const equipmentApi = {
  getEquipment: (characterId: number, preset: 1 | 2 | 3 = 1) =>
    apiClient.get<EquipmentItem[]>(`/characters/${characterId}/equipment?preset=${preset}`),
}
