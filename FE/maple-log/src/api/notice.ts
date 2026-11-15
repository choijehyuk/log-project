import { apiClient } from './client'

export interface NoticeItem {
  title: string
  url: string
  notice_id: number
  date: string
}

export interface EventNoticeItem {
  title: string
  url: string
  notice_id: number
  date: string
  date_event_start: string
  date_event_end: string
}

export interface RankingItem {
  date: string
  ranking: number
  character_name: string
  world_name: string
  class_name: string
  sub_class_name: string
  character_level: number
  character_exp: number
  character_popularity: number
  character_guildname: string
}

export const noticeApi = {
  getNotices: () => apiClient.get<{ notice: NoticeItem[] }>('/notice'),
  getEventNotices: () => apiClient.get<{ event_notice: EventNoticeItem[] }>('/notice/event'),
  getRanking: (params?: { worldName?: string; characterClass?: string; page?: number }) =>
    apiClient.get<{ ranking: RankingItem[] }>('/ranking', {
      params: {
        worldName: params?.worldName,
        characterClass: params?.characterClass,
        page: params?.page ?? 1,
      },
    }),
}
