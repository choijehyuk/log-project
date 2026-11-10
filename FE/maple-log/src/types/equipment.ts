export interface EquipmentStatLine {
  label: string
  percent: boolean
  total: number
  base: number
  starforce: number
  etc: number
  add: number
  exceptional: number
}

export interface EquipmentItem {
  slot: string
  part: string | null
  name: string
  icon: string
  starforce: number
  scrollUpgrade: number
  goldenHammer: boolean
  cuttableCount: number | null
  requiredLevel: number

  potentialGrade: string | null
  potential1: string | null
  potential2: string | null
  potential3: string | null

  additionalPotentialGrade: string | null
  additionalPotential1: string | null
  additionalPotential2: string | null
  additionalPotential3: string | null

  soulName: string | null
  soulOption: string | null

  stats: EquipmentStatLine[]
}
