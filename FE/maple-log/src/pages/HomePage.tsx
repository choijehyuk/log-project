import { useEffect, useState, type CSSProperties } from 'react'
import { equipmentApi } from '../api/equipment'
import { characterApi } from '../api/character'
import type { CharacterResponse } from '../types/character'
import type { EquipmentItem } from '../types/equipment'

// 인게임 장비창 기준 7열 × 6행 배치 { col, row } — 슬롯명은 Nexon API item_equipment_slot 값
// 가운데 3~5열 × 1~4행은 캐릭터 이미지 자리
//
// 반지4  얼굴장식  [캐릭터 이미지]           모자      망토
// 반지3  눈장식    [            ]           상의      장갑
// 반지2  귀고리    [            ]           하의      신발
// 반지1  펜던트    [            ]           어깨장식  훈장
// 벨트   펜던트2   무기  보조무기  엠블렘   안드로이드 기계 심장
// 포켓                                      칭호      뱃지
const EQUIP_LAYOUT: Record<string, { col: number; row: number }> = {
  // 인게임은 아래에서 위로 반지1 → 반지4 (식중땐 프리셋 2로 API와 대조해 확인)
  '반지4':       { col: 1, row: 1 },
  '반지3':       { col: 1, row: 2 },
  '반지2':       { col: 1, row: 3 },
  '반지1':       { col: 1, row: 4 },
  '벨트':        { col: 1, row: 5 },
  '포켓 아이템': { col: 1, row: 6 },

  '얼굴장식':    { col: 2, row: 1 },
  '눈장식':      { col: 2, row: 2 },
  '귀고리':      { col: 2, row: 3 },
  '펜던트':      { col: 2, row: 4 },
  '펜던트2':     { col: 2, row: 5 },

  '무기':        { col: 3, row: 5 },
  '보조무기':    { col: 4, row: 5 },
  '엠블렘':      { col: 5, row: 5 },

  '모자':        { col: 6, row: 1 },
  '상의':        { col: 6, row: 2 },
  '하의':        { col: 6, row: 3 },
  '어깨장식':    { col: 6, row: 4 },
  '안드로이드':  { col: 6, row: 5 },
  '칭호':        { col: 6, row: 6 },

  '망토':        { col: 7, row: 1 },
  '장갑':        { col: 7, row: 2 },
  '신발':        { col: 7, row: 3 },
  '훈장':        { col: 7, row: 4 },
  '기계 심장':   { col: 7, row: 5 },
  '뱃지':        { col: 7, row: 6 },
}

function EquipSlot({ slot, item, style }: {
  slot: string
  item?: EquipmentItem
  style?: CSSProperties
}) {
  return (
    <div
      className={item ? 'equip-slot equipped' : 'equip-slot'}
      style={style}
      title={item ? `${slot} · ${item.name}` : slot}
    >
      {item ? (
        <>
          {item.starforce > 0 && <span className="equip-star">★{item.starforce}</span>}
          <img src={item.icon} alt={item.name} />
        </>
      ) : (
        <span className="equip-slot-name">{slot}</span>
      )}
    </div>
  )
}

function EquipGrid({ characterId, characterImage }: { characterId: number; characterImage: string }) {
  const [items, setItems] = useState<EquipmentItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    equipmentApi.getEquipment(characterId)
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [characterId])

  if (loading) return <p className="loading">장비 불러오는 중...</p>

  const slotMap = new Map(items.map((i) => [i.slot, i]))

  return (
    <div className="equip-grid">
      <div className="equip-portrait">
        <img src={characterImage} alt="캐릭터" />
      </div>
      {Object.entries(EQUIP_LAYOUT).map(([slot, pos]) => (
        <EquipSlot
          key={slot}
          slot={slot}
          item={slotMap.get(slot)}
          style={{ gridColumn: pos.col, gridRow: pos.row }}
        />
      ))}
    </div>
  )
}

export default function HomePage() {
  const [characters, setCharacters] = useState<CharacterResponse[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    characterApi.getMine()
      .then(({ data }) => {
        setCharacters(data)
        const main = data.find((c) => c.main) ?? data[0]
        if (main) setSelectedId(main.id)
      })
      .finally(() => setLoading(false))
  }, [])

  const selected = characters.find((c) => c.id === selectedId)

  if (loading) return <div className="page"><p className="loading">불러오는 중...</p></div>

  return (
    <div className="page">
      <h1 className="page-header">MapleLog</h1>

      {characters.length === 0 ? (
        <div className="empty">
          <p>등록된 캐릭터가 없습니다.</p>
          <p style={{ marginTop: 8 }}>설정 탭에서 캐릭터를 추가하세요.</p>
        </div>
      ) : (
        <>
          {characters.length > 1 && (
            <div className="char-list">
              {characters.map((c) => (
                <div
                  key={c.id}
                  className={`char-row${c.id === selectedId ? ' selected' : ''}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <img src={c.characterImage} alt={c.characterName} />
                  <div className="char-row-info">
                    <div className="char-row-name">{c.characterName}</div>
                    <div className="char-row-meta">Lv.{c.level} {c.characterClass} · {c.world}</div>
                  </div>
                  {c.main && <span className="char-row-badge">대표</span>}
                </div>
              ))}
            </div>
          )}

          {selected && (
            <>
              <div className="char-header">
                <img src={selected.characterImage} alt={selected.characterName} />
                <div className="char-info">
                  <div className="char-name">{selected.characterName}</div>
                  <div className="char-meta">{selected.characterClass} · {selected.world}</div>
                  <div className="char-combat">Lv.{selected.level}</div>
                </div>
              </div>

              <div className="card">
                <p className="section-title">장비</p>
                <EquipGrid characterId={selected.id} characterImage={selected.characterImage} />
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
