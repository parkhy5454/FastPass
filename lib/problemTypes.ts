
// Unified problemTypes management for MY folder and Learn tab sync
export type ProblemType = {
  id: string
  qual: string // e.g., 전기기사
  name: string // e.g., 2022년 2회 기출문제 or 기출 10년, 예상문제
  count?: number
  createdAt: string
}

export const QUALIFICATIONS_ALL = [
  '전기기사','전기공사기사','전기철도기사','전기공사산업기사',
  '건축전기설비기술사','발송배전기술사','전기응용기술사','전기안전기술사',
  '철도신호기사','전기철도기술사','소방설비기사(전기)','전기기능장',
  '전기산업기사','전기공사기능사','철도신호산업기사','건축전기설비기사','전기기능사'
]

export function getProblemTypes(): ProblemType[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('problemTypes')
    if (!raw) return []
    return JSON.parse(raw)
  } catch { return [] }
}

export function saveProblemTypes(types: ProblemType[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem('problemTypes', JSON.stringify(types))
  // Dispatch event for Learn page sync
  window.dispatchEvent(new CustomEvent('problemTypesUpdated', { detail: types }))
  // Also dispatch storage event for other tabs
  window.dispatchEvent(new Event('storage'))
}

export function addProblemType(qual: string, name: string): ProblemType {
  const types = getProblemTypes()
  // Prevent duplicate
  const existing = types.find(t => t.qual===qual && t.name===name)
  if (existing) return existing
  const newType: ProblemType = {
    id: `${qual}_${name}_${Date.now()}`,
    qual,
    name,
    count: 0,
    createdAt: new Date().toISOString()
  }
  const updated = [...types, newType]
  saveProblemTypes(updated)
  return newType
}

export function removeProblemType(id: string) {
  const types = getProblemTypes()
  const updated = types.filter(t => t.id!==id)
  saveProblemTypes(updated)
}

export function getTypesByQual(qual: string): ProblemType[] {
  return getProblemTypes().filter(t => t.qual===qual)
}
