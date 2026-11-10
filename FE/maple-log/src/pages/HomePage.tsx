import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { equipmentApi } from '../api/equipment'
import { characterApi } from '../api/character'
import type { CharacterResponse } from '../types/character'
import type { EquipmentItem } from '../types/equipment'
import EquipTooltip from '../components/equipment/EquipTooltip'

const EQUIP_LAYOUT: Record<string, { col: number; row: number }> = {
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

function EquipSlot({ slot, item, style, onActivate, onDeactivate }: {
  slot: string
  item?: EquipmentItem
  style?: CSSProperties
  onActivate?: (item: EquipmentItem, rect: DOMRect) => void
  onDeactivate?: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)

  const activate = () => {
    if (item && ref.current) onActivate?.(item, ref.current.getBoundingClientRect())
  }

  return (
    <div
      ref={ref}
      className={item ? 'equip-slot equipped' : 'equip-slot'}
      style={style}
      title={item ? undefined : slot}
      onMouseEnter={activate}
      onMouseLeave={onDeactivate}
      onClick={activate}
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
  const [preset, setPreset] = useState<1 | 2 | 3>(1)
  const [tooltip, setTooltip] = useState<{ item: EquipmentItem; rect: DOMRect } | null>(null)

  useEffect(() => {
    setLoading(true)
    setTooltip(null)
    equipmentApi.getEquipment(characterId, preset)
      .then(({ data }) => setItems(data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [characterId, preset])

  const slotMap = new Map(items.map((i) => [i.slot, i]))

  return (
    <>
      <div className="preset-tabs">
        {([1, 2, 3] as const).map((p) => (
          <button
            key={p}
            className={`preset-tab${preset === p ? ' active' : ''}`}
            onClick={() => setPreset(p)}
          >
            프리셋 {p}
          </button>
        ))}
      </div>
      {loading && <p className="loading" style={{ padding: '24px 0' }}>불러오는 중...</p>}
      <div className="equip-grid" style={loading ? { opacity: 0.4, pointerEvents: 'none' } : undefined}>
        <div className="equip-portrait">
          <img src={characterImage} alt="캐릭터" />
        </div>
        {Object.entries(EQUIP_LAYOUT).map(([slot, pos]) => (
          <EquipSlot
            key={slot}
            slot={slot}
            item={slotMap.get(slot)}
            style={{ gridColumn: pos.col, gridRow: pos.row }}
            onActivate={(item, rect) => setTooltip({ item, rect })}
            onDeactivate={() => setTooltip(null)}
          />
        ))}
      </div>

      {tooltip && (
        <EquipTooltip item={tooltip.item} anchorRect={tooltip.rect} />
      )}
    </>
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
