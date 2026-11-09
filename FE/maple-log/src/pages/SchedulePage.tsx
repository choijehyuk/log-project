import { useEffect, useState } from 'react'
import { characterApi } from '../api/character'
import { scheduleApi } from '../api/schedule'
import type { CharacterResponse } from '../types/character'
import type { BossContentRecord, CharacterScheduleResponse, ContentRecord } from '../types/schedule'

function BossSection({ bosses, clearCount, limitCount }: {
  bosses: BossContentRecord[]
  clearCount: number
  limitCount: number
}) {
  const pct = limitCount > 0 ? Math.round((clearCount / limitCount) * 100) : 0
  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <p className="section-title" style={{ marginBottom: 0 }}>주간 보스</p>
        <span style={{ fontSize: 13, color: 'var(--accent)' }}>{clearCount} / {limitCount}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div style={{ marginTop: 12 }}>
        {[...bosses].sort((a, b) => a.list_order_no - b.list_order_no).map((boss) => (
          <div key={`${boss.content_name}-${boss.difficulty}`} className="content-item">
            <div className={`content-check${boss.complete_flag === 'true' ? ' done' : ''}`} />
            <span className="content-name">{boss.difficulty} {boss.content_name}</span>
            <span className="content-count">{boss.cycle}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ContentSection({ title, contents }: { title: string; contents: ContentRecord[] }) {
  if (contents.length === 0) return null
  return (
    <div className="card">
      <p className="section-title">{title}</p>
      {contents.map((c) => {
        const done = c.max_count > 0 && c.now_count >= c.max_count
        const pct = c.max_count > 0 ? Math.round((c.now_count / c.max_count) * 100) : 0
        return (
          <div key={c.content_name} className="content-item">
            <div className={`content-check${done ? ' done' : ''}`} />
            <div style={{ flex: 1 }}>
              <div className="content-name">{c.content_name}</div>
              {c.max_count > 0 && (
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
            {c.max_count > 0 && (
              <span className="content-count">{c.now_count}/{c.max_count}</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function SchedulePage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [schedule, setSchedule] = useState<CharacterScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [schedLoading, setSchedLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [charError, setCharError] = useState('')
  const [noData, setNoData] = useState(false)
  const [syncError, setSyncError] = useState('')

  useEffect(() => {
    characterApi.getMine()
      .then(({ data }) => {
        setCharacters(data)
        const main = data.find((c) => c.main) ?? data[0]
        if (main) setSelectedId(main.id)
      })
      .catch(() => setCharError('캐릭터 목록을 불러오지 못했습니다.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedId === null) return
    setSchedLoading(true)
    setSchedule(null)
    setNoData(false)
    setSyncError('')
    scheduleApi.getToday(selectedId)
      .then(({ data }) => setSchedule(data))
      .catch(() => setNoData(true))
      .finally(() => setSchedLoading(false))
  }, [selectedId])

  const handleSync = async () => {
    if (selectedId === null) return
    setSyncing(true)
    setSyncError('')
    try {
      const { data } = await scheduleApi.sync(selectedId)
      setSchedule(data)
      setNoData(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
      setSyncError(msg ?? 'Nexon API 오류가 발생했습니다. 스케줄 엔드포인트는 OAuth 로그인이 필요할 수 있습니다.')
      setNoData(true)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return <div className="page"><p className="loading">불러오는 중...</p></div>

  return (
    <div className="page">
      <h1 className="page-header">스케줄</h1>

      {charError && <p className="error-text">{charError}</p>}

      {characters.length > 0 && (
        <div className="char-tabs">
          {characters.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`char-tab${c.id === selectedId ? ' active' : ''}`}
              onClick={() => setSelectedId(c.id)}
            >
              {c.characterName}
            </button>
          ))}
        </div>
      )}

      {(schedLoading || syncing) && <p className="loading">{syncing ? '동기화 중...' : '스케줄 불러오는 중...'}</p>}

      {!schedLoading && !syncing && schedule && (
        <>
          <BossSection
            bosses={schedule.bossContents}
            clearCount={schedule.weeklyBossClearCount}
            limitCount={schedule.weeklyBossClearLimitCount}
          />
          <ContentSection title="일일 콘텐츠" contents={schedule.dailyContents} />
          <ContentSection title="주간 콘텐츠" contents={schedule.weeklyContents} />
        </>
      )}

      {!schedLoading && !syncing && noData && (
        <div className="empty-sync">
          <p>오늘 스케줄 데이터가 없습니다.</p>
          {syncError ? (
            <p style={{ fontSize: 13, color: '#e74c3c', marginBottom: 16, maxWidth: 280 }}>
              {syncError}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
              넥슨 API에서 스케줄을 가져옵니다.
            </p>
          )}
          <button type="button" className="btn btn-primary" onClick={handleSync}>
            지금 동기화하기
          </button>
        </div>
      )}
    </div>
  )
}
