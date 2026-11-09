import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { characterApi } from '../api/character'
import { useAuth } from '../store/AuthContext'
import type { CharacterResponse } from '../types/character'

export default function SettingsPage() {
  const { nickname, logout } = useAuth()
  const navigate = useNavigate()
  const [characters, setCharacters] = useState<CharacterResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddSheet, setShowAddSheet] = useState(false)
  const [charName, setCharName] = useState('')
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    characterApi.getMine()
      .then(({ data }) => setCharacters(data))
      .finally(() => setLoading(false))
  }, [])

  const handleSetMain = async (characterId: number) => {
    try {
      await characterApi.setMain(characterId)
      setCharacters((prev) =>
        prev.map((c) => ({ ...c, main: c.id === characterId }))
      )
    } catch {
      setError('대표 캐릭터 설정에 실패했습니다.')
    }
  }

  const handleDelete = async (c: CharacterResponse) => {
    if (!window.confirm(`${c.characterName}을(를) 삭제할까요?\n활동 로그·스케줄·스냅샷도 함께 삭제됩니다.`)) return
    try {
      await characterApi.remove(c.id)
      setCharacters((prev) => prev.filter((x) => x.id !== c.id))
    } catch {
      setError('캐릭터 삭제에 실패했습니다.')
    }
  }

  const handleAdd = async () => {
    if (!charName.trim()) return
    setAdding(true)
    setError('')
    try {
      const { data } = await characterApi.register({ characterName: charName.trim() })
      setCharacters((prev) => [...prev, data])
      setCharName('')
      setShowAddSheet(false)
    } catch {
      setError('캐릭터 등록에 실패했습니다. 캐릭터명을 확인해주세요.')
    } finally {
      setAdding(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="page">
      <h1 className="page-header">설정</h1>

      {error && <p className="error-text">{error}</p>}

      <div className="settings-section">
        <p className="settings-title">계정</p>
        <div className="settings-item">
          <span className="settings-item-label">닉네임</span>
          <span className="settings-item-value">{nickname ?? '설정 안 함'}</span>
        </div>
        <button type="button" className="btn btn-danger" onClick={handleLogout}>
          로그아웃
        </button>
      </div>

      <div className="settings-section">
        <p className="settings-title">캐릭터</p>
        {loading ? (
          <p className="loading">불러오는 중...</p>
        ) : (
          characters.map((c) => (
            <div key={c.id} className="settings-item">
              <img
                src={c.characterImage}
                alt={c.characterName}
                style={{ width: 40, height: 40, objectFit: 'contain' }}
              />
              <div className="settings-item-label">
                <div style={{ fontWeight: 600 }}>{c.characterName}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>Lv.{c.level} {c.characterClass}</div>
              </div>
              {!c.main && (
                <button
                  type="button"
                  className="settings-item-btn primary"
                  onClick={() => handleSetMain(c.id)}
                >
                  대표
                </button>
              )}
              {c.main && (
                <span className="char-row-badge" style={{ marginRight: 4 }}>대표</span>
              )}
              <button
                type="button"
                className="settings-item-btn danger"
                onClick={() => handleDelete(c)}
              >
                삭제
              </button>
            </div>
          ))
        )}
        <button
          type="button"
          className="btn btn-secondary"
          style={{ marginTop: 8 }}
          onClick={() => setShowAddSheet(true)}
        >
          + 캐릭터 추가
        </button>
      </div>

      {showAddSheet && (
        <div className="overlay" onClick={() => setShowAddSheet(false)}>
          <div className="bottom-sheet" onClick={(e) => e.stopPropagation()}>
            <h3>캐릭터 추가</h3>
            <input
              placeholder="캐릭터명을 입력하세요"
              value={charName}
              onChange={(e) => setCharName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              autoFocus
            />
            {error && <p className="error-text">{error}</p>}
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAdd}
              disabled={adding || !charName.trim()}
            >
              {adding ? '등록 중...' : '추가'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => { setShowAddSheet(false); setError('') }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
