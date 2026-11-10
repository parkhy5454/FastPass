// AI 문항 생성 파이프라인: 생성(AI 또는 샘플) → 검증. 공개는 관리자 승인 후에만 됩니다.

export type GenQuestion = {
  subject: string
  number: number
  content: string
  choices: string[]
  answer: number
  explanation: string
}

export const SUBJECTS: Record<string, string[]> = {
  '전기기사': ['전기자기학', '전력공학', '전기기기', '회로이론 및 제어공학', '전기설비기술기준 및 판단기준'],
}
export const PER_SUBJECT = 20

// 키가 있으면 Anthropic, 없으면 샘플(테스트용). 키를 넣는 순간 자동으로 AI 생성으로 바뀝니다.
export function providerName(): 'anthropic' | 'sample' {
  return process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'sample'
}

function promptFor(category: string, subject: string, count: number, round: string) {
  return `당신은 국가자격시험(${category}) 필기 문제 출제자입니다.
과목: ${subject}
회차: ${round}
아래 조건으로 객관식 문항 ${count}개를 새로 만드세요.
- 실제 기출 문제를 옮기거나 거의 같게 쓰지 마세요. 출제 범위와 난이도만 맞추세요.
- 보기는 정확히 4개, 정답은 1~4 중 하나.
- 계산 문제는 풀이를 해설에 단계별로 적고, 결과가 정답과 맞는지 다시 확인하세요.
- 해설은 2~4문장으로 짧게.
- 설명 없이 JSON 배열만 출력하세요.
형식: [{"number":1,"content":"문제","choices":["보기1","보기2","보기3","보기4"],"answer":1,"explanation":"해설"}]
number는 1부터 ${count}까지 순서대로.`
}

async function generateWithAI(category: string, subject: string, count: number, round: string): Promise<any[]> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY as string,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.GEN_MODEL || 'claude-sonnet-5-5',
      max_tokens: 12000,
      messages: [{ role: 'user', content: promptFor(category, subject, count, round) }],
    }),
  })
  if (!res.ok) throw new Error(`AI 호출 실패 (${res.status})`)
  const data: any = await res.json()
  const text: string = (data.content || []).map((c: any) => c.text || '').join('')
  const start = text.indexOf('['), end = text.lastIndexOf(']')
  if (start < 0 || end < 0) throw new Error('AI 응답을 읽을 수 없습니다')
  return JSON.parse(text.slice(start, end + 1))
}

// 샘플: 키 없이 파이프라인을 테스트하기 위한 문항. 내용이 샘플이라는 표시가 붙습니다.
function generateSample(subject: string, count: number): any[] {
  return Array.from({ length: count }, (_, i) => ({
    number: i + 1,
    content: `[샘플] ${subject} 테스트 문항 ${i + 1}`,
    choices: ['보기 1', '보기 2', '보기 3', '보기 4'],
    answer: (i % 4) + 1,
    explanation: '[샘플] 파이프라인 테스트용 해설입니다.',
  }))
}

export async function generateRound(category: string, round: string): Promise<{ source: string; questions: GenQuestion[] }> {
  const subjects = SUBJECTS[category]
  if (!subjects) throw new Error('지원하지 않는 자격증입니다')
  const source = providerName()
  const questions: GenQuestion[] = []
  for (const subject of subjects) {
    const raw = source === 'anthropic'
      ? await generateWithAI(category, subject, PER_SUBJECT, round)
      : generateSample(subject, PER_SUBJECT)
    raw.forEach((q: any, i: number) => questions.push({
      subject,
      number: 0, // 아래에서 전체 번호를 다시 매깁니다
      content: String(q.content || ''),
      choices: Array.isArray(q.choices) ? q.choices.map((c: any) => String(c)) : [],
      answer: Number(q.answer),
      explanation: String(q.explanation || ''),
    }))
  }
  questions.forEach((q, i) => { q.number = i + 1 })
  return { source, questions }
}

// 검증: 형식, 번호, 중복, 빈 내용을 확인하고 문제 목록을 돌려줍니다.
export function validateRound(category: string, questions: GenQuestion[]): string[] {
  const errors: string[] = []
  const subjects = SUBJECTS[category] || []
  const seen = new Set<string>()
  questions.forEach(q => {
    const tag = `${q.number}번(${q.subject})`
    if (!subjects.includes(q.subject)) errors.push(`${tag}: 과목이 올바르지 않습니다`)
    if (!q.content || q.content.length < 5) errors.push(`${tag}: 문제가 너무 짧습니다`)
    if (q.choices.length !== 4) errors.push(`${tag}: 보기는 4개여야 합니다`)
    if (q.choices.some(c => !c.trim())) errors.push(`${tag}: 빈 보기가 있습니다`)
    if (!Number.isInteger(q.answer) || q.answer < 1 || q.answer > 4) errors.push(`${tag}: 정답 번호가 1~4 범위가 아닙니다`)
    if (!q.explanation) errors.push(`${tag}: 해설이 없습니다`)
    const key = q.content.replace(/\s+/g, '')
    if (seen.has(key)) errors.push(`${tag}: 같은 문제가 중복됩니다`)
    seen.add(key)
  })
  const expected = subjects.length * PER_SUBJECT
  if (questions.length !== expected) errors.push(`문항 수가 ${expected}개가 아닙니다 (현재 ${questions.length}개)`)
  return errors
}

// 다음 회차 번호: 공개된 회차와 초안 중 가장 큰 번호 + 1
export function nextRoundFrom(rounds: string[]): string {
  const nums = rounds.map(r => parseInt(r, 10)).filter(n => !isNaN(n))
  return String((nums.length ? Math.max(...nums) : 0) + 1)
}
