// 모의고사 공통 처리: CSV 해석, 채점, 응시 권한 확인

export const CSV_COLUMNS = ['자격증', '회차', '과목', '문항번호', '문제', '보기1', '보기2', '보기3', '보기4', '정답', '해설'] as const

export type ExamRow = {
  category: string
  round: string
  subject: string
  number: number
  content: string
  choices: string[]
  answer: number
  explanation: string
}

// 따옴표와 쉼표를 처리하는 간단한 CSV 해석기 (BOM, CRLF 허용)
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '')
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++ } else { quoted = false }
      } else cell += ch
    } else if (ch === '"') {
      quoted = true
    } else if (ch === ',') {
      row.push(cell); cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      row.push(cell); cell = ''
      if (row.some(c => c.trim() !== '')) rows.push(row)
      row = []
    } else cell += ch
  }
  row.push(cell)
  if (row.some(c => c.trim() !== '')) rows.push(row)
  return rows
}

// CSV 텍스트를 문제 목록으로 바꿉니다. 한 줄이라도 틀리면 전체를 거부하도록 오류 목록을 돌려줍니다.
export function csvToExamRows(text: string): { rows: ExamRow[]; errors: { line: number; message: string }[] } {
  const table = parseCsv(text)
  const errors: { line: number; message: string }[] = []
  if (table.length < 2) return { rows: [], errors: [{ line: 1, message: '머리글과 문제 한 줄 이상이 필요합니다' }] }

  const header = table[0].map(h => h.trim())
  const idx = (name: string) => header.indexOf(name)
  const missing = CSV_COLUMNS.filter(c => idx(c) === -1)
  if (missing.length) return { rows: [], errors: [{ line: 1, message: `머리글 누락: ${missing.join(', ')}` }] }

  const rows: ExamRow[] = []
  for (let r = 1; r < table.length; r++) {
    const line = r + 1
    const get = (name: string) => (table[r][idx(name)] ?? '').trim()
    const before = errors.length
    const category = get('자격증')
    const round = get('회차')
    const subject = get('과목')
    const number = Number(get('문항번호'))
    const content = get('문제')
    const choices = ['보기1', '보기2', '보기3', '보기4'].map(get)
    const answer = Number(get('정답'))
    const explanation = get('해설')

    if (!category) errors.push({ line, message: '자격증이 비었습니다' })
    if (!round) errors.push({ line, message: '회차가 비었습니다' })
    if (!subject) errors.push({ line, message: '과목이 비었습니다' })
    if (!Number.isInteger(number) || number < 1) errors.push({ line, message: '문항번호는 1 이상의 숫자' })
    if (!content) errors.push({ line, message: '문제가 비었습니다' })
    if (choices.some(c => !c)) errors.push({ line, message: '보기 4개를 모두 입력하세요' })
    if (!Number.isInteger(answer) || answer < 1 || answer > 4) errors.push({ line, message: '정답은 1~4 중 하나' })

    if (errors.length === before) {
      rows.push({ category, round, subject, number, content, choices, answer, explanation })
    }
  }
  return { rows, errors }
}

export type Question = { id: string; subject: string; answer: number }

// 과목별 점수(정답 수 / 과목 문항 수 × 100)와 평균으로 채점합니다.
export function scoreAttempt(
  questions: Question[],
  answers: Record<string, number>,
  passScore: number,
  subjectMin: number,
) {
  const bySubject: Record<string, { correct: number; total: number; score: number }> = {}
  let correctAll = 0
  for (const q of questions) {
    const s = (bySubject[q.subject] ??= { correct: 0, total: 0, score: 0 })
    s.total += 1
    if (answers[q.id] === q.answer) { s.correct += 1; correctAll += 1 }
  }
  for (const s of Object.values(bySubject)) s.score = s.total ? Math.round((s.correct / s.total) * 1000) / 10 : 0
  const subjects = Object.values(bySubject)
  const total = subjects.length ? Math.round((subjects.reduce((a, b) => a + b.score, 0) / subjects.length) * 10) / 10 : 0
  const passed = total >= passScore && subjects.every(s => s.score >= subjectMin)
  return { bySubject, total, passed, correctAll, questionCount: questions.length }
}

// 구독 중이거나 관리자이면 응시 가능
export function hasExamAccess(session: Record<string, any>, user: { plan?: string; subscriptionExpiresAt?: Date | null } | null): boolean {
  if (session?.role === 'ADMIN') return true
  if (!user || !user.plan || user.plan === 'FREE') return false
  return !!user.subscriptionExpiresAt && new Date(user.subscriptionExpiresAt).getTime() > Date.now()
}
