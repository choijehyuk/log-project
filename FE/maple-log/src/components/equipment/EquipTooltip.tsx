import { useLayoutEffect, useRef, useState } from 'react'
import type { EquipmentItem, EquipmentStatLine } from '../../types/equipment'

const GRADE: Record<string, { color: string; letter: string }> = {
  '레어':     { color: '#5cb8ff', letter: 'R' },
  '에픽':     { color: '#b46cff', letter: 'E' },
  '유니크':   { color: '#ffcc00', letter: 'U' },
  '레전드리': { color: '#8ee000', letter: 'L' },
}

const TOOLTIP_WIDTH = 300
const GAP = 8

// 장착 레벨별 최대 스타포스
function maxStarforce(level: number): number {
  if (level < 95) return 5
  if (level < 108) return 8
  if (level < 118) return 10
  if (level < 128) return 15
  if (level < 138) return 20
  return 30
}

function StarRows({ current, max }: { current: number; max: number }) {
  const rows: number[][] = []
  for (let i = 0; i < max; i += 15) {
    rows.push(Array.from({ length: Math.min(15, max - i) }, (_, k) => i + k))
  }
  return (
    <div className="tt-stars">
      {rows.map((row, r) => (
        <div key={r} className="tt-star-row">
          {row.map((idx) => (
            <span
              key={idx}
              className={`tt-star${idx < current ? ' filled' : ''}${idx % 5 === 4 ? ' group-end' : ''}`}
            >
              ★
            </span>
          ))}
        </div>
      ))}
    </div>
  )
}

function StatLine({ stat }: { stat: EquipmentStatLine }) {
  const unit = stat.percent ? '%' : ''
  // 기본 외 수치가 있으면 인게임처럼 하늘색 + 괄호 내역 표시
  const parts = [
    { value: stat.starforce, className: 'tt-v-starforce' },
    { value: stat.etc, className: 'tt-v-etc' },
    { value: stat.add, className: 'tt-v-add' },
    { value: stat.exceptional, className: 'tt-v-exceptional' },
  ].filter((p) => p.value !== 0)
  const enhanced = parts.length > 0

  return (
    <div className={`tt-stat${enhanced ? ' enhanced' : ''}`}>
      {stat.label} : +{stat.total}{unit}
      {enhanced && (
        <span className="tt-breakdown">
          {' ( '}
          <span className="tt-v-base">{stat.base}{unit}</span>
          {parts.map((p, i) => (
            <span key={i} className={p.className}> +{p.value}{unit}</span>
          ))}
          {' )'}
        </span>
      )}
    </div>
  )
}

function PotentialSection({ title, grade, options }: {
  title: string
  grade: string | null
  options: (string | null)[]
}) {
  const lines = options.filter((o): o is string => !!o)
  if (lines.length === 0) return null
  const g = grade ? GRADE[grade] : undefined
  const color = g?.color ?? '#aaa'

  return (
    <div className="tt-section">
      <div className="tt-pot-header" style={{ color }}>
        {g && <span className="tt-grade-badge" style={{ background: color }}>{g.letter}</span>}
        {title}
      </div>
      {lines.map((line, i) => <div key={i} className="tt-line">{line}</div>)}
    </div>
  )
}

export default function EquipTooltip({ item, anchorRect }: {
  item: EquipmentItem
  anchorRect: DOMRect
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: anchorRect.top, left: anchorRect.right + GAP })

  // 렌더 후 실제 높이를 재서 화면 밖으로 나가지 않게 위치 보정
  useLayoutEffect(() => {
    const height = ref.current?.offsetHeight ?? 0
    const left = anchorRect.right + GAP + TOOLTIP_WIDTH > window.innerWidth
      ? Math.max(GAP, anchorRect.left - TOOLTIP_WIDTH - GAP)
      : anchorRect.right + GAP
    const top = Math.max(GAP, Math.min(anchorRect.top, window.innerHeight - height - GAP))
    setPos({ top, left })
  }, [anchorRect, item])

  const grade = item.potentialGrade ? GRADE[item.potentialGrade] : undefined
  const soulTitle = item.soulName && !item.soulName.endsWith('적용') ? `${item.soulName} 적용` : item.soulName

  return (
    <div ref={ref} className="equip-tooltip" style={{ ...pos, width: TOOLTIP_WIDTH }}>
      {/* 헤더: 스타포스 / 이름 / 등급 */}
      <div className="tt-header">
        {item.starforce > 0 && (
          <StarRows current={item.starforce} max={Math.max(item.starforce, maxStarforce(item.requiredLevel))} />
        )}
        <div className="tt-name">
          {item.name}{item.scrollUpgrade > 0 && ` (+${item.scrollUpgrade})`}
        </div>
        {item.potentialGrade && <div className="tt-grade">({item.potentialGrade} 아이템)</div>}
        {item.cuttableCount != null && (
          <div className="tt-cuttable">(가위 사용 잔여 횟수 : {item.cuttableCount}회)</div>
        )}
      </div>

      {/* 아이콘 */}
      <div className="tt-section">
        <div className="tt-icon" style={{ borderColor: grade?.color ?? '#666' }}>
          <img src={item.icon} alt={item.name} />
        </div>
      </div>

      {/* 장비분류 + 스탯 */}
      <div className="tt-section">
        <div className="tt-line">장비분류 : {item.part ?? item.slot}</div>
        {item.stats.map((stat) => (
          <StatLine key={`${stat.label}-${stat.percent}`} stat={stat} />
        ))}
      </div>

      <PotentialSection
        title="잠재옵션"
        grade={item.potentialGrade}
        options={[item.potential1, item.potential2, item.potential3]}
      />
      <PotentialSection
        title="에디셔널 잠재옵션"
        grade={item.additionalPotentialGrade}
        options={[item.additionalPotential1, item.additionalPotential2, item.additionalPotential3]}
      />

      {/* 소울 */}
      {soulTitle && (
        <div className="tt-section">
          <div className="tt-soul">{soulTitle}</div>
          {item.soulOption && <div className="tt-line">{item.soulOption}</div>}
        </div>
      )}
    </div>
  )
}
