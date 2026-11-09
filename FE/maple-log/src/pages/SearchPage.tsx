import { useState, type FormEvent } from 'react'
import { characterApi } from '../api/character'
import { useAuth } from '../store/AuthContext'
import type { CharacterResponse } from '../types/character'

export default function SearchPage() {
  const { isAuthenticated } = useAuth()
  const [name, setName] = useState('')
  const [result, setResult] = useState<CharacterResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setResult(null)
    setLoading(true)
    try {
      const { data } = await characterApi.search(name.trim())
      setResult(data)
    } catch {
      setError('캐릭터를 찾을 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    if (!result) return
    setError('')
    try {
      await characterApi.register({ characterName: result.characterName })
      setMessage('내 캐릭터로 등록했습니다.')
    } catch {
      setError('캐릭터 등록에 실패했습니다.')
    }
  }

  return (
    <section>
      <h2>캐릭터 검색</h2>
      <form className="search-form" onSubmit={handleSearch}>
        <input placeholder="캐릭터 닉네임" value={name} onChange={(e) => setName(e.target.value)} required />
        <button type="submit" disabled={loading}>
          {loading ? '검색 중...' : '검색'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {result && (
        <div className="character-card">
          <img src={result.characterImage} alt={result.characterName} />
          <div>
            <h3>{result.characterName}</h3>
            <p>
              Lv.{result.level} {result.characterClass}
            </p>
            <p>{result.world}</p>
            {isAuthenticated && (
              <button type="button" onClick={handleRegister}>
                내 캐릭터로 등록
              </button>
            )}
            {message && <p>{message}</p>}
          </div>
        </div>
      )}
    </section>
  )
}
