import { isAxiosError } from 'axios'
import { useEffect, useState, type FormEvent } from 'react'
import { logApi } from '../../api/log'
import { snapshotApi } from '../../api/snapshot'
import type { CharacterResponse } from '../../types/character'
import type { ActivityLogResponse } from '../../types/log'
import type { SnapshotSummaryResponse } from '../../types/snapshot'

const getErrorMessage = (e: unknown, fallback: string) =>
  (isAxiosError<{ error?: string }>(e) && e.response?.data?.error) || fallback

const formatGain = (n: number) => `${n >= 0 ? '+' : ''}${n.toLocaleString()}`

// 캐릭터가 바뀌면 key로 다시 마운트되어 state가 초기화됨
export default function CharacterDetail({ character }: { character: CharacterResponse }) {
  const [summary, setSummary] = useState<SnapshotSummaryResponse | null>(null)
  const [logs, setLogs] = useState<ActivityLogResponse[]>([])
  const [content, setContent] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    // 스냅샷이 없으면 BE가 400을 반환하므로 요약은 비워둠
    snapshotApi
      .getSummary(character.id)
      .then(({ data }) => setSummary(data))
      .catch(() => setSummary(null))
    logApi
      .getList(character.id)
      .then(({ data }) => setLogs(data))
      .catch((e) => setError(getErrorMessage(e, '로그를 불러오지 못했습니다.')))
  }, [character.id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    try {
      const { data } = await logApi.create(character.id, { content: content.trim() })
      setLogs((prev) => [data, ...prev])
      setContent('')
      setError('')
    } catch (e) {
      setError(getErrorMessage(e, '로그 저장에 실패했습니다.'))
    }
  }

  const handleDelete = async (logId: number) => {
    try {
      await logApi.remove(character.id, logId)
      setLogs((prev) => prev.filter((l) => l.id !== logId))
    } catch (e) {
      setError(getErrorMessage(e, '로그 삭제에 실패했습니다.'))
    }
  }

  return (
    <div className="character-detail">
      <h3>{character.characterName} 성장 요약</h3>
      {summary ? (
        <p>
          {summary.firstDate} ~ {summary.latestDate} ({summary.totalSnapshots}회 기록) · Lv.{summary.firstLevel} → Lv.
          {summary.latestLevel} ({formatGain(summary.levelGain)}) · 전투력 {formatGain(summary.combatPowerGain)}
        </p>
      ) : (
        <p>저장된 스냅샷이 없습니다.</p>
      )}

      <h3>활동 로그</h3>
      <form className="search-form" onSubmit={handleSubmit}>
        <input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={500}
          placeholder="오늘 한 일을 기록하세요"
        />
        <button type="submit">기록</button>
      </form>
      {error && <p className="error">{error}</p>}
      {logs.length === 0 ? (
        <p>기록된 로그가 없습니다.</p>
      ) : (
        <ul className="log-list">
          {logs.map((log) => (
            <li key={log.id}>
              <span className="log-date">{log.createdAt.slice(0, 16).replace('T', ' ')}</span>
              <span className="log-content">{log.content}</span>
              <button type="button" className="text-button" onClick={() => handleDelete(log.id)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
