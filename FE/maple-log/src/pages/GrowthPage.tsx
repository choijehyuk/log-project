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

const tooltipStyle = {
  backgroundColor: 'var(--surface, #16213e)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8,
  color: '#eee',
  fontSize: 12,
}

export default function GrowthPage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [snapshots, setSnapshots] = useState<SnapshotResponse[]>([])
  const [period, setPeriod] = useState<Period>(30)
  const [loading, setLoading] = useState(true)
  const [snapLoading, setSnapLoading] = useState(false)

  useEffect(() => {
    characterApi.getMine()
      .then(({ data }) => {
        setCharacters(data)
        const main = data.find((c) => c.main) ?? data[0]
        if (main) setSelectedId(main.id)
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedId === null) return
    setSnapLoading(true)
    snapshotApi.getList(selectedId, 365)
      .then(({ data }) => setSnapshots(data))
      .catch(() => setSnapshots([]))
      .finally(() => setSnapLoading(false))
  }, [selectedId])

  const filtered = filterByPeriod(snapshots, period)
  const chartData = [...filtered].sort((a, b) =>
    a.snapshotDate.localeCompare(b.snapshotDate)
  )

  if (loading) return <div className="page"><p className="loading">불러오는 중...</p></div>

  return (
    <div className="page">
      <h1 className="page-header">성장 기록</h1>

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
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#aaa', fontSize: 10 }}
                  width={36}
                />
                <Tooltip contentStyle={tooltipStyle} labelStyle={{ color: '#aaa' }} />
                <Line
                  type="monotone"
                  dataKey="level"
                  stroke="#f08c00"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
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
                  tickFormatter={(v: number) =>
                    v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : String(v)
                  }
                />
                <Tooltip
                  contentStyle={tooltipStyle}
                  labelStyle={{ color: '#aaa' }}
                  formatter={(v) => [typeof v === 'number' ? v.toLocaleString() : v, '전투력']}
                />
                <Line
                  type="monotone"
                  dataKey="combatPower"
                  stroke="#e94560"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
