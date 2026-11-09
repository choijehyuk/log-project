import { useEffect, useState } from 'react'
import { characterApi } from '../api/character'
import { scheduleApi } from '../api/schedule'
import type { CharacterScheduleResponse } from '../types/schedule'

// 대표 캐릭터(없으면 첫 캐릭터)의 오늘 스케줄 조회
export function useTodaySchedule() {
  const [schedule, setSchedule] = useState<CharacterScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { data: characters } = await characterApi.getMine()
        const target = characters.find((c) => c.main) ?? characters[0]
        if (!target) {
          setError('등록된 캐릭터가 없습니다.')
          return
        }
        const { data } = await scheduleApi.getToday(target.id)
        setSchedule(data)
      } catch {
        setError('스케줄을 불러오지 못했습니다.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { schedule, loading, error }
}
