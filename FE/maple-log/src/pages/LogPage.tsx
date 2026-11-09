import { useEffect, useState } from 'react'
import { characterApi } from '../api/character'
import { logApi } from '../api/log'
import type { CharacterResponse } from '../types/character'
import type { ActivityLogResponse } from '../types/log'

export default function LogPage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [logs, setLogs] = useState<ActivityLogResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [logLoading, setLogLoading] = useState(false)
  const [showSheet, setShowSheet] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

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
    setLogLoading(true)
    logApi.getList(selectedId)
      .then(({ data }) => setLogs(data))
      .catch(() => setLogs([]))
      .finally(() => setLogLoading(false))
  }, [selectedId])

  const handleSubmit = async () => {
    if (!content.trim() || selectedId === null) return
    setSubmitting(true)
    try {
      const { data } = await logApi.create(selectedId, { content: content.trim() })
      setLogs((prev) => [data, ...prev])
      setContent('')
      setShowSheet(false)
    } catch {
      setError('로그 작성에 실패했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (logId: number) => {
    if (selectedId === null) return
    try {
      await logApi.remove(selectedId, logId)
      setLogs((prev) => prev.filter((l) => l.id !== logId))
    } catch {
      setError('삭제에 실패했습니다.')
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  if (loading) return <div className="page"><p className="loading">불러오는 중...</p></div>

  return (
    <div className="page">
      <h1 className="page-header">활동 로그</h1>

      {error && <p className="error-text">{error}</p>}

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

      {logLoading && <p className="loading">로그 불러오는 중...</p>}

      {!logLoading && (
        <div className="card">
          {logs.length === 0 ? (
            <p className="empty" style={{ padding: '24px 0' }}>기록된 활동 로그가 없습니다.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="log-item">
                <div className="log-header">
                  <span className="log-char">{log.characterName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="log-date">{formatDate(log.createdAt)}</span>
                    <button
                      type="button"
                      className="log-delete"
                      onClick={() => handleDelete(log.id)}
                    >
                      ×
                    </button>
                  </div>
                </div>
                <p className="log-content-text">{log.content}</p>
              </div>
            ))
          )}
        </div>
      )}

      {selectedId !== null && (
        <button type="button" className="fab" onClick={() => setShowSheet(true)}>+</button>
      )}

      {showSheet && (
        <div className="overlay" onClick={() => setShowSheet(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>활동 로그 작성</h3>
            <textarea
              placeholder="오늘의 플레이 기록을 남겨보세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              autoFocus
            />
            {error && <p className="error-text">{error}</p>}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowSheet(false)}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
