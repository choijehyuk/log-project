import { useEffect, useState } from 'react'
import { characterApi } from '../api/character'
import { scheduleApi } from '../api/schedule'
import { useAuth } from '../store/AuthContext'
import type { CharacterResponse } from '../types/character'
import type { BossContentRecord, CharacterScheduleResponse, ContentRecord } from '../types/schedule'

const DIFFICULTY: Record<string, string> = {
  easy: '이지', normal: '노말', hard: '하드', chaos: '카오스', extreme: '익스트림',
}

const DIFF_COLOR: Record<string, string> = {
  easy: '#4ecca3',
  normal: '#5b8dd9',
  hard: '#f08c00',
  chaos: '#9b59b6',
  extreme: '#e74c3c',
}

const CYCLE_LABEL: Record<string, string> = {
  bossDaily: '일일 보스', bossWeekly: '주간 보스', bossMonthly: '월간 보스',
}
const CYCLE_ORDER = ['bossDaily', 'bossWeekly', 'bossMonthly']

const EPIC_DUNGEON_MAX = 5

function getEffectiveMax(c: ContentRecord): number {
  if (c.max_count > 0) return c.max_count
  if (c.content_name.startsWith('에픽 던전')) return EPIC_DUNGEON_MAX
  return 0
}

function isDone(c: ContentRecord) {
  if (c.quest_state === '2') return true
  const max = getEffectiveMax(c)
  return max > 0 && c.now_count >= max
}

function cleanName(name: string): { badge: string | null; label: string } {
  const m = name.match(/^\[([^\]]+)\]\s*(.+)$/)
  return m ? { badge: m[1], label: m[2] } : { badge: null, label: name }
}

function EpicPips({ now }: { now: number }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
      {Array.from({ length: EPIC_DUNGEON_MAX }, (_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: i < now ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
            transition: 'background 0.2s',
          }}
        />
      ))}
    </div>
  )
}

function SummaryBar({ schedule }: { schedule: CharacterScheduleResponse }) {
  const regDaily = schedule.dailyContents.filter(c => c.registration_flag === 'true')
  const regWeekly = schedule.weeklyContents.filter(c => c.registration_flag === 'true')
  const doneDaily = regDaily.filter(isDone).length
  const doneWeekly = regWeekly.filter(isDone).length

  const items = [
    { label: '주간 보스', value: schedule.weeklyBossClearCount, total: schedule.weeklyBossClearLimitCount },
    { label: '일일', value: doneDaily, total: regDaily.length },
    { label: '주간', value: doneWeekly, total: regWeekly.length },
  ]

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
      {items.map(({ label, value, total }) => {
        const complete = total > 0 && value >= total
        const pct = total > 0 ? (value / total) * 100 : 0
        const color = complete ? '#4ecca3' : 'var(--accent)'
        return (
          <div
            key={label}
            className="card"
            style={{
              padding: '14px 8px 12px',
              textAlign: 'center',
              borderTop: `3px solid ${color}`,
              marginBottom: 0,
            }}
          >
            <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 6, letterSpacing: '0.3px' }}>{label}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>
              {value}
              <span style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 400 }}>/{total}</span>
            </div>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden', marginTop: 8 }}>
              <div style={{
                height: '100%',
                background: color,
                width: `${pct}%`,
                transition: 'width 0.4s',
                borderRadius: 2,
              }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function BossSection({ bosses, clearCount, limitCount }: {
  bosses: BossContentRecord[]
  clearCount: number
  limitCount: number
}) {
  const [collapsed, setCollapsed] = useState(false)

  const registered = [...bosses]
    .filter(b => b.registration_flag === 'true')
    .sort((a, b) => a.list_order_no - b.list_order_no)

  if (registered.length === 0) return null

  const groups: Record<string, BossContentRecord[]> = {}
  for (const b of registered) {
    if (!groups[b.cycle]) groups[b.cycle] = []
    groups[b.cycle].push(b)
  }

  const doneCount = registered.filter(b => b.complete_flag === 'true').length
  const allDone = doneCount === registered.length

  return (
    <div className="card">
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : 14, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setCollapsed(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p className="section-title" style={{ marginBottom: 0, color: 'var(--text)' }}>보스</p>
          <span style={{
            fontSize: 11,
            color: allDone ? '#4ecca3' : 'var(--text2)',
            background: allDone ? 'rgba(78,204,163,0.12)' : 'rgba(255,255,255,0.06)',
            padding: '2px 7px',
            borderRadius: 10,
          }}>
            {doneCount}/{registered.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: clearCount >= limitCount ? '#4ecca3' : 'var(--accent)' }}>
            결정석 {clearCount}/{limitCount}
          </span>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text2)', transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
            <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      {!collapsed && CYCLE_ORDER.filter(c => groups[c]).map((cycle, ci) => (
        <div key={cycle}>
          {ci > 0 && <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />}
          <div style={{
            fontSize: 10,
            color: 'var(--text2)',
            marginBottom: 6,
            letterSpacing: '0.6px',
            textTransform: 'uppercase',
            fontWeight: 600,
          }}>
            {CYCLE_LABEL[cycle]}
          </div>
          {groups[cycle].map((boss, i) => {
            const done = boss.complete_flag === 'true'
            const diffColor = DIFF_COLOR[boss.difficulty] ?? '#aaa'
            const isLast = i === groups[cycle].length - 1
            return (
              <div
                key={`${boss.content_name}-${boss.difficulty}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: isLast ? 'none' : '1px solid var(--border)',
                  opacity: done ? 0.4 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <div className={`content-check${done ? ' done' : ''}`} />
                <span style={{
                  flex: 1,
                  fontSize: 14,
                  textDecoration: done ? 'line-through' : 'none',
                  color: done ? 'var(--text2)' : 'var(--text)',
                }}>
                  {boss.content_name}
                </span>
                <span style={{
                  fontSize: 11,
                  color: diffColor,
                  background: `${diffColor}1a`,
                  padding: '2px 8px',
                  borderRadius: 10,
                  border: `1px solid ${diffColor}33`,
                  flexShrink: 0,
                }}>
                  {DIFFICULTY[boss.difficulty] ?? boss.difficulty}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function ContentSection({ title, contents }: { title: string; contents: ContentRecord[] }) {
  const [collapsed, setCollapsed] = useState(false)

  const registered = contents.filter(c => c.registration_flag === 'true')
  if (registered.length === 0) return null

  const sorted = [...registered].sort((a, b) => (isDone(a) ? 1 : 0) - (isDone(b) ? 1 : 0))
  const doneCount = registered.filter(isDone).length
  const allDone = doneCount === registered.length

  return (
    <div className="card">
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: collapsed ? 0 : 12, cursor: 'pointer', userSelect: 'none' }}
        onClick={() => setCollapsed(v => !v)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <p className="section-title" style={{ marginBottom: 0, color: 'var(--text)' }}>{title}</p>
          <span style={{
            fontSize: 11,
            color: allDone ? '#4ecca3' : 'var(--text2)',
            background: allDone ? 'rgba(78,204,163,0.12)' : 'rgba(255,255,255,0.06)',
            padding: '2px 7px',
            borderRadius: 10,
          }}>
            {doneCount}/{registered.length}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: 'var(--text2)', transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {!collapsed && sorted.map((c, i) => {
        const done = isDone(c)
        const effectiveMax = getEffectiveMax(c)
        const pct = effectiveMax > 0 ? Math.round((c.now_count / effectiveMax) * 100) : 0
        const isEpic = c.content_name.startsWith('에픽 던전')
        const { badge, label } = cleanName(c.content_name)
        const isLast = i === sorted.length - 1
        return (
          <div
            key={c.content_name}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 0',
              borderBottom: isLast ? 'none' : '1px solid var(--border)',
              opacity: done ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <div className={`content-check${done ? ' done' : ''}`} />
            <div style={{ flex: 1, minWidth: 0 }}>
              {badge && (
                <span style={{
                  display: 'inline-block',
                  fontSize: 10,
                  color: 'var(--text2)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '1px 5px',
                  borderRadius: 4,
                  marginBottom: 3,
                }}>
                  {badge}
                </span>
              )}
              <div style={{
                fontSize: 14,
                textDecoration: done ? 'line-through' : 'none',
                color: done ? 'var(--text2)' : 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {label}
              </div>
              {effectiveMax > 0 && !done && !isEpic && (
                <div className="progress-bar" style={{ marginTop: 4 }}>
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              )}
            </div>
            {isEpic ? (
              <EpicPips now={c.now_count} />
            ) : effectiveMax > 0 ? (
              <span style={{ fontSize: 12, color: 'var(--text2)', flexShrink: 0 }}>
                {c.now_count}/{effectiveMax}
              </span>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export default function SchedulePage() {
  const { authType } = useAuth()
  const isNicknameUser = authType === 'NICKNAME'

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
    let cancelled = false

    const load = async () => {
      setSchedLoading(true)
      setSchedule(null)
      setNoData(false)
      setSyncError('')
      try {
        const { data } = await scheduleApi.getToday(selectedId)
        if (!cancelled) setSchedule(data)
      } catch {
        if (isNicknameUser) {
          if (!cancelled) setNoData(true)
        } else {
          try {
            const { data } = await scheduleApi.sync(selectedId)
            if (!cancelled) setSchedule(data)
          } catch (err: unknown) {
            if (!cancelled) {
              const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
              setSyncError(msg ?? 'Nexon API 오류가 발생했습니다.')
              setNoData(true)
            }
          }
        }
      } finally {
        if (!cancelled) setSchedLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [selectedId, isNicknameUser])

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
      setSyncError(msg ?? 'Nexon API 오류가 발생했습니다.')
      if (!schedule) setNoData(true)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return <div className="page"><p className="loading">불러오는 중...</p></div>

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 className="page-header" style={{ marginBottom: 0 }}>스케줄</h1>
        {schedule && (
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing || isNicknameUser}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 8,
              color: syncing ? 'var(--text2)' : 'var(--accent)',
              fontSize: 12,
              padding: '5px 11px',
              cursor: syncing || isNicknameUser ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {syncing ? '동기화 중...' : '↻ 동기화'}
          </button>
        )}
      </div>

      {isNicknameUser && (
        <div className="notice-banner">
          닉네임 로그인은 스케줄 동기화를 지원하지 않습니다.
          API Key 또는 Nexon 로그인이 필요합니다.
        </div>
      )}

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

      {schedLoading && <p className="loading">불러오는 중...</p>}

      {!schedLoading && schedule && (
        <>
          <SummaryBar schedule={schedule} />
          <BossSection
            bosses={schedule.bossContents}
            clearCount={schedule.weeklyBossClearCount}
            limitCount={schedule.weeklyBossClearLimitCount}
          />
          <ContentSection title="일일 콘텐츠" contents={schedule.dailyContents} />
          <ContentSection title="주간 콘텐츠" contents={schedule.weeklyContents} />
          {syncError && (
            <p style={{ fontSize: 13, color: '#e74c3c', textAlign: 'center', marginTop: 8 }}>{syncError}</p>
          )}
          <p style={{ fontSize: 11, color: 'var(--text2)', textAlign: 'center', marginTop: 4 }}>
            {schedule.scheduleDate} 기준
          </p>
        </>
      )}

      {!schedLoading && !schedule && noData && (
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
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSync}
            disabled={isNicknameUser || syncing}
          >
            {syncing ? '동기화 중...' : '지금 동기화하기'}
          </button>
          {isNicknameUser && (
            <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
              설정에서 로그인 방식을 변경하세요.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
