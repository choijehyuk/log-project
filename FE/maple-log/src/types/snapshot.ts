export interface SnapshotResponse {
  id: number
  level: number
  expRate: string
  combatPower: number
  snapshotDate: string
}

export interface SnapshotSummaryResponse {
  firstDate: string
  latestDate: string
  firstLevel: number
  latestLevel: number
  levelGain: number
  firstCombatPower: number
  latestCombatPower: number
  combatPowerGain: number
  totalSnapshots: number
}
