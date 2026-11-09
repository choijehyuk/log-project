import type { EquipmentItem } from '../types/equipment'
import { apiClient } from './client'

export const equipmentApi = {
  getEquipment: (characterId: number) =>
    apiClient.get<EquipmentItem[]>(`/characters/${characterId}/equipment`),
}
