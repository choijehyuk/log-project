// BE가 Nexon 응답 필드명(@JsonProperty)을 그대로 직렬화하므로 snake_case 유지
export interface BossContentRecord {
  content_name: string
  difficulty: string
  cycle: string
  list_order_no: number
  registration_flag: string
  complete_flag: string
}

export interface ContentRecord {
  content_name: string
  type: string
  registration_flag: string
  now_count: number
  max_count: number
  quest_state: string
}

export interface CharacterScheduleResponse {
  characterId: number
  characterName: string
  scheduleDate: string
  bossContents: BossContentRecord[]
  dailyContents: ContentRecord[]
  weeklyContents: ContentRecord[]
  weeklyBossClearCount: number
  weeklyBossClearLimitCount: number
}
