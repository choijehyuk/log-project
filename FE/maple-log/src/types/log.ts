export interface ActivityLogRequest {
  content: string
}

export interface ActivityLogResponse {
  id: number
  characterId: number
  characterName: string
  content: string
  createdAt: string
}
