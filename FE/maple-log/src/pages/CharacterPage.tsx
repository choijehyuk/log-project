import { useEffect, useState } from 'react'
import { characterApi } from '../api/character'
import CharacterDetail from '../components/character/CharacterDetail'
import type { CharacterResponse } from '../types/character'

export default function CharacterPage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    characterApi.getMine().then(({ data }) => setCharacters(data))
  }, [])

  const handleDelete = async (c: CharacterResponse) => {
    if (!window.confirm(`${c.characterName} 캐릭터를 삭제할까요?\n활동 로그·스케줄·스냅샷 기록도 함께 삭제됩니다.`)) return
    try {
      await characterApi.remove(c.id)
      setCharacters((prev) => prev.filter((x) => x.id !== c.id))
      if (selectedId === c.id) setSelectedId(null)
      setError('')
    } catch {
      setError('캐릭터 삭제에 실패했습니다.')
    }
  }

  const selected = characters.find((c) => c.id === selectedId)

  return (
    <section>
      <h2>내 캐릭터</h2>
      {error && <p className="error">{error}</p>}
      {characters.length === 0 ? (
        <p>등록된 캐릭터가 없습니다.</p>
      ) : (
        <ul className="character-list">
          {characters.map((c) => (
            <li key={c.id} className={c.id === selectedId ? 'selected' : undefined}>
              <button type="button" className="text-button" onClick={() => setSelectedId(c.id)}>
                {c.characterName} · Lv.{c.level} {c.characterClass} ({c.world}) {c.main && '⭐'}
              </button>
              <button type="button" className="text-button danger" onClick={() => handleDelete(c)}>
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
      {selected && <CharacterDetail key={selected.id} character={selected} />}
    </section>
  )
}
