import axios from 'axios'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { characterApi } from '../api/character'
import { snapshotApi } from '../api/snapshot'
import type { CharacterResponse } from '../types/character'
import type { SnapshotResponse } from '../types/snapshot'

type Period = 7 | 30 | 999

function filterByPeriod(data: SnapshotResponse[], days: Period): SnapshotResponse[] {
  if (days === 999) return data
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  return data.filter((d) => new Date(d.snapshotDate) >= cutoff)
}

const ttStyle = {
  backgroundColor: 'var(--surface, #16213e)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#eee',
  fontSize: 12,
}

function fmtPower(v: number): string {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
  return v.toLocaleString()
}

export default function GrowthPage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [snapshots, setSnapshots] = useState<SnapshotResponse[]>([])
  const [period, setPeriod] = useState<Period>(30)
  const [loading, setLoading] = useState(true)
  const [snapLoading, setSnapLoading] = useState(false)
  const [recording, setRecording] = useState(false)
  const [recordMsg, setRecordMsg] = useState('')
  const [triggering, setTriggering] = useState(false)
  const [triggerMsg, setTriggerMsg] = useState('')

  useEffect(() => {
    characterApi.getMine()
      .then(({ data }) => {
        setCharacters(data)
        const main = data.find((c) => c.main) ?? data[0]
        if (main) setSelectedId(main.id)
      })
      .finally(() => setLoading(false))
  }, [])

  const loadSnapshots = (id: number) => {
    setSnapLoading(true)
    snapshotApi.getList(id, 365)
      .then(({ data }) => setSnapshots(data))
      .catch(() => setSnapshots([]))
      .finally(() => setSnapLoading(false))
  }

  useEffect(() => {
    if (selectedId === null) return
    loadSnapshots(selectedId)
  }, [selectedId])

  const filtered = filterByPeriod(snapshots, period)
  const chartData = [...filtered].sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate))
  const first = chartData[0]
  const last = chartData[chartData.length - 1]
  const levelDiff = first && last && first !== last ? last.level - first.level : null
  const powerDiff = first && last && first !== last ? last.combatPower - first.combatPower : null

  const handleRecord = async () => {
    if (!selectedId) return
    setRecording(true)
    setRecordMsg('')
    try {
      await snapshotApi.save(selectedId)
      loadSnapshots(selectedId)
      setRecordMsg('기록 완료!')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 400) {
        setRecordMsg(err.response.data?.error ?? '오늘은 이미 기록되었습니다.')
      } else {
        setRecordMsg('기록에 실패했습니다.')
      }
    } finally {
      setRecording(false)
    }
  }

  // TODO: 테스트용 — 배포 전 삭제
  const handleTriggerAll = async () => {
    setTriggering(true)
    setTriggerMsg('')
    try {
      await snapshotApi.triggerAll()
      if (selectedId) loadSnapshots(selectedId)
      setTriggerMsg('완료!')
    } catch {
      setTriggerMsg('실패했습니다.')
    } finally {
      setTriggering(false)
    }
  }

  if (loading) return <div className="page"><p className="loading">불러오는 중...</p></div>

  return (
    <div className="page">
      <div className="growth-header">
        <h1 className="page-header" style={{ marginBottom: 0 }}>성장 기록</h1>
        <div className="record-btn-wrap">
          {(recordMsg || triggerMsg) && (
            <span className={`record-msg ${(recordMsg || triggerMsg).includes('완료') ? 'ok' : 'err'}`}>
              {recordMsg || triggerMsg}
            </span>
          )}
          <button
            type="button"
            className="btn btn-primary"
            style={{ width: 'auto', padding: '7px 14px', fontSize: 13 }}
            onClick={handleRecord}
            disabled={recording || !selectedId}
          >
            {recording ? '기록 중...' : '지금 기록'}
          </button>
          {/* TODO: 테스트용 — 배포 전 삭제 */}
          <button
            type="button"
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '7px 12px', fontSize: 12 }}
            onClick={handleTriggerAll}
            disabled={triggering}
          >
            {triggering ? '실행 중...' : '[테스트] 전체 저장'}
          </button>
        </div>
      </div>

      {characters.length > 0 && (
        <div className="char-tabs">
          {characters.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`char-tab${c.id === selectedId ? ' active' : ''}`}
              onClick={() => { setSelectedId(c.id); setRecordMsg(''); setTriggerMsg('') }}
            >
              {c.characterName}
            </button>
          ))}
        </div>
      )}

      {last && (
        <div className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">레벨</span>
            <span className="summary-value">{last.level}</span>
            {levelDiff !== null && (
              <span className={`summary-gain ${levelDiff >= 0 ? 'pos' : 'neg'}`}>
                {levelDiff >= 0 ? '+' : ''}{levelDiff}
              </span>
            )}
          </div>
          <div className="summary-card">
            <span className="summary-label">전투력</span>
            <span className="summary-value">{fmtPower(last.combatPower)}</span>
            {powerDiff !== null && (
              <span className={`summary-gain ${powerDiff >= 0 ? 'pos' : 'neg'}`}>
                {powerDiff >= 0 ? '+' : '-'}{fmtPower(Math.abs(powerDiff))}
              </span>
            )}
          </div>
          <div className="summary-card">
            <span className="summary-label">경험치</span>
            <span className="summary-value">{last.expRate ?? '-'}%</span>
            <span className="summary-gain" style={{ color: 'var(--text2)' }}>lv.{last.level}</span>
          </div>
        </div>
      )}

      <div className="period-filter">
        {([7, 30, 999] as Period[]).map((d) => (
          <button
            key={d}
            type="button"
            className={`period-btn${period === d ? ' active' : ''}`}
            onClick={() => setPeriod(d)}
          >
            {d === 999 ? '전체' : `${d}일`}
          </button>
        ))}
      </div>

      {snapLoading && <p className="loading">데이터 불러오는 중...</p>}

      {!snapLoading && chartData.length === 0 && (
        <div className="empty">해당 기간의 스냅샷이 없습니다.</div>
      )}

      {!snapLoading && chartData.length > 0 && (
        <>
          <div className="chart-wrap">
            <p className="chart-title">레벨</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="snapshotDate"
                  tick={{ fill: '#aaa', fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#aaa', fontSize: 10 }} width={36} />
                <Tooltip contentStyle={ttStyle} labelStyle={{ color: '#aaa' }} />
                <Line type="monotone" dataKey="level" stroke="#f08c00" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrap">
            <p className="chart-title">전투력</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="snapshotDate"
                  tick={{ fill: '#aaa', fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#aaa', fontSize: 10 }}
                  width={48}
                  tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : String(v)}
                />
                <Tooltip
                  contentStyle={ttStyle}
                  labelStyle={{ color: '#aaa' }}
                  formatter={(v) => [typeof v === 'number' ? v.toLocaleString() : v, '전투력']}
                />
                <Line type="monotone" dataKey="combatPower" stroke="#e94560" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-wrap">
            <p className="chart-title">경험치</p>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart
                data={chartData.map((d) => ({
                  ...d,
                  expRateNum: d.expRate != null ? parseFloat(d.expRate) : null,
                }))}
                margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="snapshotDate"
                  tick={{ fill: '#aaa', fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  interval="preserveStartEnd"
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#aaa', fontSize: 10 }}
                  width={40}
                  tickFormatter={(v: number) => `${v}%`}
                />
                <Tooltip
                  contentStyle={ttStyle}
                  labelStyle={{ color: '#aaa' }}
                  formatter={(v) => [`${v}%`, '경험치']}
                />
                <Line
                  type="monotone"
                  dataKey="expRateNum"
                  stroke="#4ecca3"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
